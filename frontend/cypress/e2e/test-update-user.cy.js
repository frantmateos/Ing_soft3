// cypress/e2e/test-update-user.cy.js
const BASE_APP = 'https://webapp-qa-2025.azurewebsites.net';
const BASE_API = 'https://backend-qa-2025.azurewebsites.net';

function closeAnySwal() {
  // Cierra cualquier SweetAlert (de Login o de Update)
  cy.get('body').then($b => {
    if ($b.find('.swal2-container:visible').length) {
      cy.get('.swal2-confirm').click({ force: true });
      cy.get('.swal2-container').should('not.exist');
    }
  });
}

describe('Loguea como admin y modifica un usuario por la UI', () => {
  const admin = { nombre: 'admin_test', password: '123456' };

  const userToEdit = {
    nombre: 'usuario_edit_cypress',
    genero: 'Masculino',
    atributos: 'Activo', // El valor original
    maneja: false,
    lentes: false,
    diabetico: false,
    enfermedades: 'Ninguna',
  };

  const newAttrs = 'Actualizado por Cypress ✅';
  let adminToken = null;

  before(() => {
    // Hook 'before' para asegurar que el servidor esté despierto
    // y que el usuario de prueba exista.
    cy.request({
      method: 'POST',
      url: `${BASE_API}/users/login`,
      body: { nombre: admin.nombre, password: admin.password, admin: true },
      timeout: 60000 // 60s de timeout para el "cold start" de Azure
    }).then(({ body }) => {
      adminToken = body.Token;
      return cy.request({
        method: 'GET',
        url: `${BASE_API}/users/all`,
        headers: { Authorization: `Bearer ${adminToken}` },
        timeout: 60000
      });
    }).then(({ body }) => {
      const exists = Array.isArray(body) && body.some(u => u.nombre === userToEdit.nombre);
      if (!exists) {
        // Si no existe, lo crea
        return cy.request({
          method: 'POST',
          url: `${BASE_API}/users`,
          headers: { Authorization: `Bearer ${adminToken}` },
          body: userToEdit,
          timeout: 60000
        });
      } else {
        // Si ya existe, se asegura de que tenga el atributo original
        const user = body.find(u => u.nombre === userToEdit.nombre);
        user.atributos = userToEdit.atributos; // Restaura el atributo
        return cy.request({
            method: 'PUT',
            url: `${BASE_API}/users`,
            headers: { Authorization: `Bearer ${adminToken}` },
            body: user,
            timeout: 60000
        });
      }
    });
  });

  // Función recursiva para manejar la recarga 401 de la app
  function waitForUserList() {
    cy.log('Esperando que la lista de usuarios cargue (GET /users/all)...');
    cy.wait('@listUsers', { timeout: 15000 }).then((interception) => {
      if (interception.response.statusCode !== 200) {
        cy.log('La lista falló (401), recargando la página...');
        cy.reload(); // La recarga dispara el intercept 'listUsers' de nuevo
        waitForUserList(); // Vuelve a esperar
      } else {
        cy.log('Lista de usuarios cargada (200 OK).');
      }
    });
  }

  it('Edita el usuario y persiste los cambios', () => {
    // 1. Definir TODOS los intercepts ANTES de visitar
    cy.intercept('GET', '**/users/token').as('token');
    cy.intercept('GET', '**/users/all').as('listUsers'); // Se usará varias veces
    cy.intercept('PUT', '**/users').as('updateUser');

    // 2. Login por UI
    cy.visit(`${BASE_APP}/`);
    cy.get('.from-box.login').should('be.visible').within(() => {
      cy.get('input[placeholder="Usuario"]').clear().type(admin.nombre);
      cy.get('input[placeholder="Contraseña"]').clear().type(admin.password);
      cy.contains('button', 'Login').click({ force: true });
    });

    // 3. Cerrar Swal y esperar token
    closeAnySwal();
    cy.wait('@token', { timeout: 15000 });
    cy.url({ timeout: 15000 }).should('include', '/home');

    // 4. Lógica de espera y recarga
    waitForUserList();

    // 5. Buscar al usuario y abrir el modal
    cy.contains('Usuarios', { timeout: 15000 }).should('be.visible');
    cy.contains('[class*="Lista-usuarios"] li, .bloque', userToEdit.nombre, {
      timeout: 15000,
    })
    .should('be.visible')
    .scrollIntoView()
    .within(() => {
      cy.contains('button, a', /actualizar/i)
        .should('be.visible')
        .click({ force: true });
    });

    // 6. Modal visible, editar y guardar
    cy.get('.modal-content', { timeout: 10000 }).should('be.visible');
    cy.get('.modal-content textarea[placeholder="Atributos"]')
      .clear()
      .type(newAttrs);

    cy.get('.modal-content').find('button[type="submit"]').click({ force: true });
    
    // 7. Esperar confirmación de la API
    cy.wait('@updateUser', { timeout: 20000 })
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);

    // 8. Cerrar Swal de éxito
    closeAnySwal();
    
    // --- INICIO DE LA CORRECCIÓN ---
    // 9. Verificar el cambio (SIN REABRIR EL MODAL)
    // El 'window.location.reload()' de tu app se habrá disparado después del Swal.
    // Esperamos a que la página se recargue y la lista esté OK.
    waitForUserList();

    // 10. Ahora verificamos el *texto* en la lista.
    cy.log('Verificando que el texto actualizado esté en la lista...');
    cy.contains('[class*="Lista-usuarios"] li, .bloque', userToEdit.nombre)
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', newAttrs); // Verificamos que el nuevo texto está en la fila
    // --- FIN DE LA CORRECCIÓN ---
  });
});