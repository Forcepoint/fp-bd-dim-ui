describe('Intelligence Export Tests - Testing Intelligence Export Page', () => {

  // Run before each test.
  beforeEach(() => {
    cy.login()
  })

  // Run after test suite.
  afterEach(() => {

    cy.login()
    
    // Wait for any hanging commands to complete.
    cy.wait(3000)

    // Remove containers.
    cy.remove_containers()
    
  })

  // Test that page is inaccessible to public.
  it('Intelligence Export page is inaccessible to public.', () => {
    cy.logout()
    cy.visit('/#/egress')

    // Ensure that the user is redirected to login page.
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })

  // Test that page exists.
  it('Intelligence Export page exists and contains active modules panel.', () => {
    cy.visit('/#/egress')

    // Wait for page to load.
    cy.wait(1000)

    // Check that both the Active Modules panel exists.
    cy.get('.panel').contains('Active Modules')
  })

  // There are no active modules message displayed when no modules attached.
  it('There are no active modules message displayed when no modules attached.', () => {
    cy.visit('/#/egress')

    // Check that no active modules message is present.
    cy.get('.panel-content').contains('There are no active modules.')
    cy.get('.panel-content').contains('Go to the Dynamic Intelligence Manager Marketplace or install one manually.')
  })

  // Clicking marketplace when no modules active redirects to marketplace.
  it('When no modules are active the marketplace link is displayed.', () => {
    cy.visit('/#/egress')

    // Check that no active modules message is present.
    cy.get('.panel-content').contains('Go to the Dynamic Intelligence Manager Marketplace or install one manually.')

    // Retrieve the marketplace link and click it.
    cy.get('.panel-content').within(() => {
      cy.get('a').click({force: true}).then(() => {
        cy.location().should((loc) => {
          expect(loc.hash).to.eq('#/marketplace')
        })
      })
    })
  })

  // Modules requiring configuration are displayed in the configuration required modules panel when installed.
  it('Configuration required panel is displayed and modules are shown when the modules require configuration.', () => {
    cy.install_container('egress', 'Forcepoint SMC').then(() => {
      cy.visit('/#/egress')

      // Wait for panels to load.
      cy.wait(1000)

      // Check that module exists with name Forcepoint Importer.
      cy.get('.panel-header').contains('Configuration Required').parentsUntil('.panel').parent().within((panel) => {
        cy.get('.status').contains('Forcepoint SMC')
      })
    })
  })

})