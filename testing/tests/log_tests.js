describe('Logs Tests - Testing Logs Page', () => {

  // Run before each test.
  beforeEach(() => {
    cy.login()
  })

  // Run after all tests.
  after(() => {

    cy.login()
    
    // Wait for any hanging commands to complete.
    cy.wait(3000)

    // Remove containers.
    cy.remove_containers()

  })

  // Test that page is inaccessible to public.
  it('Logs page is inaccessible to public.', () => {
    cy.logout()
    cy.visit('/#/logs')

    // Ensure that the user is redirected to login page.
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })

  // Test that page exists.
  it('Logs page exists and contains batch status and logs panels.', () => {
    cy.visit('/#/logs')

    // Check that both the Intelligence and Module Health panels exist.
    cy.get('.panel').contains('Batch Status')
    cy.get('.panel').contains('Logs')
    cy.get('.status-card').contains('Pending', { matchCase: false })
    cy.get('.status-card').contains('Failed', { matchCase: false })
  })

  // Test that the page contains an array of log events.
  it('Log page contains an array of log events.', () => {
    cy.visit('/#/logs')

    // Ensure that the array of log events is greater than 0.
    cy.get('.log-message').its('length').should('be.gt', 0)
  })

  // Test that the dropdown contains All Modules and any attached modules.
  it('The dropdown contains all modules attached', () => {
    cy.install_container('ingress', 'Amazon GuardDuty').then(() => {
      cy.visit('/#/logs')
      cy.wait(1000)

      // Retrieve the dropdown.
      cy.get('.module-select .vs__open-indicator').click({force: true})
      cy.get('.vs__dropdown-menu li').should('have.length', 2)
      cy.get('.vs__dropdown-menu li').should((modules) => {
        cy.expect(modules[0].innerText).to.equal('All Modules')
        cy.expect(modules[1].innerText).to.equal('Amazon GuardDuty')
      })
    })
  })

  // Test that the dropdown contains all log levels.
  it('The dropdown contains all modules attached', () => {
    cy.visit('/#/logs')
    cy.wait(1000)

    // Retrieve the dropdown.
    cy.get('.level-select .vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').should('have.length', 5)
    cy.get('.vs__dropdown-menu li').should((levels) => {
      cy.expect(levels[0].innerText).to.equal('Info')
      cy.expect(levels[1].innerText).to.equal('Debug')
      cy.expect(levels[2].innerText).to.equal('Warning')
      cy.expect(levels[3].innerText).to.equal('Error')
      cy.expect(levels[4].innerText).to.equal('Fatal')
    })
  })

})