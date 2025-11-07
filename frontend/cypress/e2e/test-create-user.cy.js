describe('Flujo completo de creación de usuario (admin)', () => {
  const admin = {
    nombre: 'admin_test',
    password: '123456',
  };

  const nuevoUsuario = {
    nombre: `usuario_cypress_${Date.now()}`,
    genero: 'Masculino',
    atributos: 'Activo, puntual',
    maneja: true,
    lentes: false,
    diabetico: false,
    enfermedades: 'Ninguna',
  };

  before(() => {
    // 🔹 Login como admin
    cy.visit('https://webapp-qa-2025.azurewebsites.net/');
    cy.get('.from-box.login').should('be.visible').within(() => {
      cy.get('input[placeholder="Usuario"]').clear().type(admin.nombre);
      cy.get('input[placeholder="Contraseña"]').clear().type(admin.password);
      cy.get('button[type="submit"]').should('contain', 'Login').click({ force: true });
    });

    // 🔹 Esperar login exitoso y cerrar alert
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
    cy.contains('OK').click();

    // 🔹 Esperar home visible
    cy.url({ timeout: 10000 }).should('include', '/home');
    cy.contains('Usuarios', { timeout: 10000 }).should('be.visible');
  });

  it('Abre el modal y crea un nuevo usuario correctamente', () => {
    // 🔹 Abrir modal
    cy.contains('Agregar Usuario').should('be.visible').click({ force: true });
    cy.get('.modal-content', { timeout: 10000 }).should('be.visible');

    // 🔹 Completar formulario
    cy.get('input[placeholder="Nombre del Usuario"]').type(nuevoUsuario.nombre);
    cy.get('input[placeholder="Género"]').type(nuevoUsuario.genero);
    cy.get('textarea[placeholder="Atributos"]').type(nuevoUsuario.atributos);
    cy.get('input[type="checkbox"]').eq(0).check(); // maneja
    cy.get('input[placeholder="Enfermedades"]').type(nuevoUsuario.enfermedades);

    // 🔹 Hacer clic en Agregar
    cy.get('.modal-content button[type="submit"]')
      .should('be.visible')
      .click({ force: true });

    // 🔹 Esperar que ocurra el reload del home (provocado por la app)
    cy.url({ timeout: 20000 }).should('include', '/home');

    // 🔹 Esperar que el componente de usuarios se renderice otra vez
    cy.contains('Usuarios', { timeout: 10000 }).should('be.visible');

    // 🔹 Buscar el nuevo usuario en la lista
    cy.contains(nuevoUsuario.nombre, { timeout: 10000 }).should('exist');
    cy.contains('Activo').should('exist');
  });
});
