describe('Home Tests - Testing Home Page', () => {

  // Run before each test.
  beforeEach(() => {
    cy.login()
  })

  // Run after test suite.
  after(() => {

    // Wait for any hanging commands to complete.
    cy.wait(3000)

    // Remove containers.
    cy.remove_containers()
    
  })

  // Test that page is inaccessible to public.
  it('Home page is inaccessible to public.', () => {
    cy.logout()
    cy.visit('/#/')

    // Ensure that the user is redirected to login page.
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })

  // Test that page exists.
  it('Home page exists and contains statistics and health panels.', () => {
    cy.visit('/#/')

    // Check that both the Intelligence and Module Health panels exist.
    cy.get('.panel').contains('Intelligence')
    cy.get('.panel').contains('Module Health')
  })

  // Home page displays message for lack of attatched modules.
  it('Message is displayed when no modules are attached.', () => {
    cy.remove_containers().then(() => {
      // Reload the page.
      cy.visit('/#/')
      
      // Check that the no modules added message is displayed.
      cy.get('.panel-empty').contains('No modules have been added.')
      cy.get('.panel-empty').contains('Please install a module from the Dynamic Intelligence Manager marketplace.')
    })
  })

  // Home page displays healthy status when all modules are healthy.
  it('All modules healthy message displayed when all modules are healthy.', () => {
    cy.visit('/#/marketplace')

    cy.remove_containers().then(() => {

      // Get all modules on page.
      cy.get('.install').then((modules) => {

        // Select random module to install.
        const module = modules[Math.floor(Math.random() * modules.length)]
        module.click()

        // Wait for command to complete.
        cy.wait(5000)

        // Navigate to homepage.
        cy.visit('/#/')

        // Verify that healthy message is displayed.
        cy.get('.status-card').contains('All modules are currently healthy.')

      })

    })

  })

  // Home page displays down status when module is down.
  it('Module is down message displayed when module is down..', () => {

    // Get all modules on ingress page and stop.
    cy.visit('/#/ingress')
    cy.get('.stop-control').then((control) => {
      control.click()
      cy.wait(3000)

      // Navigate to homepage.
      cy.visit('/#/')

      // Verify that healthy message is displayed.
      cy.get('.status-card').contains('The following modules are currently down:')
    })

    // Bring module back up for removal via api.
    cy.visit('/#/ingress')
    cy.get('.start-control').then((control) => {
      control.click()
    })

  })

})