// cypress/e2e/test-register.cy.js
describe('Flujo de Registro y Login de Administrador', () => {
  const usuario = {
    nombre: `admin_test`,
    password: '123456',
    admin: true
  };

  it('Permite registrar un nuevo usuario', () => {
    cy.visit('https://webapp-qa-2025.azurewebsites.net/');
    cy.contains('Regístrate').click();

    // (Opcional) Intercept para ver el 200
    cy.intercept('POST', '**/users').as('register');

    cy.get('.from-box.register')
      .should('be.visible')
      .within(() => {
        cy.get('input[placeholder="Usuario"]').type(usuario.nombre);
        cy.get('input[placeholder="Contraseña"]').type(usuario.password);
        cy.contains('Registrarse').click({ force: true });
      });

    cy.wait('@register').its('response.statusCode').should('be.oneOf', [200, 201]);

    cy.contains('Registro exitoso', { timeout: 10000 }).should('be.visible');
  });

  it('Permite hacer login con el usuario recién creado y acceder al Home', () => {
    cy.visit('https://webapp-qa-2025.azurewebsites.net/');

    cy.intercept('POST', '**/users/login').as('login');
    cy.intercept('GET', '**/users/token').as('token');
    cy.intercept('GET', '**/users/all').as('usersAll');

    cy.get('.from-box.login')
      .should('be.visible')
      .within(() => {
        cy.get('input[placeholder="Usuario"]').clear().type(usuario.nombre);
        cy.get('input[placeholder="Contraseña"]').clear().type(usuario.password);
        cy.get('button[type="submit"]').should('contain', 'Login').click({ force: true });
      });

    cy.wait('@login').its('response.statusCode').should('eq', 200);

    cy.window().then((win) => {
      const tkn = win.localStorage.getItem('token');
      expect(tkn, 'token en localStorage').to.be.a('string').and.not.be.empty;
    });

    cy.reload();

    cy.url({ timeout: 10000 }).should('include', '/home');

    cy.wait('@token').its('response.statusCode').should('eq', 200);
    cy.wait('@usersAll').its('response.statusCode').should('be.oneOf', [200, 204]); // tu API puede devolver 204 si no hay usuarios

    cy.contains('Usuarios', { timeout: 10000 }).should('be.visible');
  });
});
