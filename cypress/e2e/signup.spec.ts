describe('Signup', () => {
    beforeEach(() => {
        cy.visit('/signup');
    })

    it('Debería cargar la pantalla de registro correctamente', () => {
        cy.get('ion-title').should('contain', 'Registro');
        cy.get('[data-testid="username"]').should('be.visible');
    })
});