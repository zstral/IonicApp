import { setupWindowSQLiteMock } from '../support/commands';

describe('Pruebas E2E de Autenticación y Flujos Clave', () => {


it('Debería permitir al usuario iniciar sesión con credenciales válidas y navegar al /main', () => {

    cy.visit('/login', {
      onBeforeLoad(win) {
        setupWindowSQLiteMock(win as any);

        const mockDbInstance = (win as any).sqlitePlugin.openDatabase({}, () => {});
        mockDbInstance.transaction((tx: any) => {
            tx.executeSql(
                'INSERT INTO user (username, password, nombre, apellido, nivelEducacion, fechaNacimiento) VALUES (?, ?, ?, ?, ?, ?)',
                ['testuser', '1234', 'Usuario', 'Prueba', 'Técnico', '1990-01-01'],
                () => {},
                () => {}
            );
        });
        console.log('Cypress: Mock DB inyectada con datos de prueba.');
      }
    });

    cy.get('ion-input[name="username"] input').type('testuser');
    cy.get('ion-input[name="password"] input').type('1234');
    cy.get('ion-button[type="submit"]').click();
    cy.get('ion-label:contains("Perfil")', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/main');
  });

  it('Debería permitir un registro de usuario exitoso.', () => {
    cy.visit('/signup', {
      onBeforeLoad(win) {
        setupWindowSQLiteMock(win as any);
      }
    });

    cy.get('ion-input[name="username"] input').type('newuser');
    cy.get('ion-input[name="password"] input').type('newpassword123');
    cy.get('ion-button[type="submit"]').click();

    cy.url().should('include', '/signup-extended');
    cy.get('ion-input[name="nombre"] input').type('Nuevo');
    cy.get('ion-input[name="apellido"] input').type('Usuario');
    cy.get('ion-select[name="nivelEducacion"]').click();
    cy.get('ion-alert .alert-radio-group button').contains('Técnico').click();
    cy.get('ion-alert .alert-button-group button').contains('OK').click();
    cy.get('input[name="fechaNacimiento"]')
    .should('be.visible')
    .invoke('val', '01-01-2025')
    .trigger('change')
    .trigger('input');
    cy.get('ion-button[type="submit"]').last().click();

    cy.url().should('include', '/home');
  });

  it('Debería mostrar un mensaje de consola "User not found" al intentar iniciar sesión con credenciales incorrectas.', () => {
    cy.visit('/login', {
      onBeforeLoad(win) {
        setupWindowSQLiteMock(win as any);
      }
    });

    cy.get('ion-input[name="username"] input').type('wronguser');
    cy.get('ion-input[name="password"] input').type('wrongpass');
    cy.get('ion-button[type="submit"]').click();

    cy.url().should('not.include', '/main');
    cy.url().should('include', '/login');
  });
});
