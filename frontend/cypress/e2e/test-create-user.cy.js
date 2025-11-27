// cypress/e2e/test-create-user.cy.js

// ✅ Helper: cierra cualquier SweetAlert2 visible para que no bloquee la UI
function closeAnySwal() {
  cy.get('body').then($body => {
    const hasSwal = $body.find('.swal2-container:visible').length > 0;
    if (hasSwal) {
      cy.get('.swal2-confirm').click({ force: true }); // botón "OK"
      cy.get('.swal2-container').should('not.exist');
    }
  });
}

describe('Login como Administrador y creación de nuevo cliente (robusto)', () => {
  const baseUrl = 'https://frontend-qa-production.up.railway.app';

  const admin = {
    nombre: 'admin_test',
    password: '123456',
  };

  const nuevoUsuario = {
    nombre: `usuario_cypress_${Date.now()}`,
    genero: 'Masculino',
    atributos: 'Activo, puntual',
    maneja: true,        // primer checkbox
    lentes: false,       // segundo checkbox (lo dejamos sin marcar)
    diabetico: false,    // tercer checkbox (lo dejamos sin marcar)
    enfermedades: 'Ninguna',
  };

  before(() => {
    // Intercepts generales para poder esperar después
    cy.intercept('POST', '**/users').as('createUser');
    cy.intercept('GET', '**/users/all').as('listUsers');
    cy.intercept('GET', '**/users/token').as('token');

    // 🔹 Ir al login
    cy.visit(`${baseUrl}/`);

    // 🔹 Completar login
    cy.get('.from-box.login').should('be.visible').within(() => {
      cy.get('input[placeholder="Usuario"]').clear().type(admin.nombre);
      cy.get('input[placeholder="Contraseña"]').clear().type(admin.password);
      cy.contains('button', 'Login').click({ force: true });
    });

    // 🔹 Si aparece el Swal de “Login exitoso”, cerrarlo
    closeAnySwal();

    // 🔹 Esperar que navegue a Home y cargue
    cy.url({ timeout: 15000 }).should('include', '/home');
    cy.contains('Usuarios', { timeout: 15000 }).should('be.visible');

    // 🔹 A veces la app consulta el token y luego lista usuarios
    cy.wait('@token', { timeout: 15000 });
    cy.wait('@listUsers', { timeout: 15000 });
  });

  it('Abre el modal y crea un nuevo usuario correctamente', () => {
    // 🔹 Abrir modal “Agregar Usuario”
    cy.contains('Agregar Usuario', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });

    // 🔹 Si se dibuja un Swal por detrás/adelante, cerrarlo
    closeAnySwal();

  // 🔹 Asegurar que el modal está visible (dar más tiempo en CI/entornos lentos)
  cy.get('.modal-content', { timeout: 20000 }).should('be.visible');

    // 🔹 Completar formulario (seleccionamos inputs dentro del modal para evitar
    //     confundirnos con inputs fuera del contexto que puedan estar presentes)
    cy.get('.modal-content').within(() => {
      // Esperar explicitamente a que el input principal esté presente y habilitado.
      const nombreInput = cy.get('input[placeholder="Nombre del Usuario"]', { timeout: 15000 });
      nombreInput.should('exist').and('be.visible').and('not.be.disabled');
      nombreInput.clear().type(nuevoUsuario.nombre);

      const generoInput = cy.get('input[placeholder="Género"]', { timeout: 10000 });
      generoInput.should('exist').and('be.visible').and('not.be.disabled');
      generoInput.clear().type(nuevoUsuario.genero);

      cy.get('textarea[placeholder="Atributos"]', { timeout: 10000 }).should('be.visible').type(nuevoUsuario.atributos);

      // Checkboxes: maneja es el primero (index 0)
      if (nuevoUsuario.maneja) cy.get('input[type="checkbox"]').eq(0).check({ force: true });

      cy.get('input[placeholder="Enfermedades"]', { timeout: 10000 }).should('be.visible').type(nuevoUsuario.enfermedades);
    });

    // 🔹 Enviar
    cy.get('.modal-content')
      .contains('button', 'Agregar')
      .should('be.visible')
      .click({ force: true });

    // 🔹 Esperar respuesta de creación (POST /users)
    cy.wait('@createUser', { timeout: 20000 }).its('response.statusCode').should('be.oneOf', [200, 201]);

    // 🔹 Cerrar Swal de éxito si aparece
    closeAnySwal();

    // 🔹 La app suele refrescar o volver a pedir la lista; esperá la/s llamadas
    cy.wait('@listUsers', { timeout: 20000 });

    // Por si la UI tarda en re-renderizar:
    cy.contains('Usuarios', { timeout: 15000 }).should('be.visible');

    // 🔹 Verificar que el nuevo usuario aparece en la grilla/lista
    cy.contains(nuevoUsuario.nombre, { timeout: 15000 }).should('exist');
  });
});
