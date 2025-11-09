// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// Helper para loguear por API y guardar el token en localStorage
Cypress.Commands.add('apiLogin', (nombre, password, admin = true) => {
  const api = Cypress.env('backendApiUrl');
  return cy.request('POST', `${api}/users/login`, { nombre, password, admin })
    .then((resp) => {
      expect(resp.status).to.be.oneOf([200, 201]);
      const token = resp.body.Token || resp.body.token;
      expect(token, 'token recibido').to.be.a('string');

      // Guardamos el token para la app
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('nombre', nombre);
      return token;
    });
});

// (Opcional) Helper para crear usuario por API (útil para preparar datos)
Cypress.Commands.add('apiCreateUser', (user) => {
  const api = Cypress.env('backendApiUrl');
  const token = window.localStorage.getItem('token');
  return cy.request({
    method: 'POST',
    url: `${api}/users`,
    body: user,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((resp) => resp);
});
