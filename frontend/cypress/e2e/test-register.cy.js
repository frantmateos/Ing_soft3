describe('Flujo de Registro y Login de Administrador', () => {
  const usuario = {
    nombre: `admin_test`,
    password: '123456',
    admin: true
  };

  it('Permite registrar un nuevo usuario', () => {
    cy.visit('https://webapp-qa-2025.azurewebsites.net/');
    cy.contains('Regístrate').click();

    cy.get('.from-box.register')
      .should('be.visible')
      .within(() => {
        cy.get('input[placeholder="Usuario"]').type(usuario.nombre);
        cy.get('input[placeholder="Contraseña"]').type(usuario.password);
        cy.contains('Registrarse').should('be.visible').click({ force: true });
      });

    cy.on('window:alert', (text) => {
      expect(text).to.include('Registro exitoso');
    });
  });

  it('Permite hacer login con el usuario recién creado y acceder al Home', () => {
    cy.visit('https://webapp-qa-2025.azurewebsites.net/');

    cy.get('.from-box.login')
      .should('be.visible')
      .within(() => {
        cy.get('input[placeholder="Usuario"]').clear().type(usuario.nombre);
        cy.get('input[placeholder="Contraseña"]').clear().type(usuario.password);

        cy.get('button[type="submit"]').should('contain', 'Login').click({ force: true });
      });

    cy.window().its('localStorage.token').should('exist');

    cy.url({ timeout: 10000 }).should('include', '/home');

    cy.contains('Usuarios', { timeout: 10000 }).should('be.visible');
  });
});
