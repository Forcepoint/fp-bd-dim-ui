describe('Intelligence Sources Tests - Testing Intelligence Sources Page', () => {

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
  it('Intelligence Sources page is inaccessible to public.', () => {
    cy.logout()
    cy.visit('/#/ingress')

    // Ensure that the user is redirected to login page.
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })

  // Test that page exists.
  it('Intelligence Sources page exists and contains active modules panel.', () => {
    cy.visit('/#/ingress')

    // Wait for page to load.
    cy.wait(1000)

    // Check that both the Active Modules panel exists.
    cy.get('.panel').contains('Active Modules')
  })

  // There are no active modules message displayed when no modules attached.
  it('There are no active modules message displayed when no modules attached.', () => {
    cy.visit('/#/ingress')

    // Check that no active modules message is present.
    cy.get('.panel-content').contains('There are no active modules.')
    cy.get('.panel-content').contains('Go to the Dynamic Intelligence Manager Marketplace or install one manually.')
  })

  // Clicking marketplace when no modules active redirects to marketplace.
  it('When no modules are active the marketplace link is displayed.', () => {
    cy.visit('/#/ingress')

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

  // Active modules are displayed in the active modules pane when installed.
  it('Active modules pane is displayed and modules are shown when the modules are active.', () => {
    cy.install_container('ingress', 'Forcepoint Importer').then(() => {
      // Navigate to intelligence sources and ensure module is in active panel.
      cy.visit('/#/ingress')

      // Wait for panels to load.
      cy.wait(1000)

      // Check that module exists with name Forcepoint Importer.
      cy.get('.panel-header').contains('Active Modules').parentsUntil('.panel').parent().within((panel) => {
        cy.get('.status').contains('Forcepoint Data Importer')
      })
    })
  })
  
  // Modules can be configured by clicking the configure button, which shows several configuration fields.
  it('Modules can be configured by clicking the configuration button, which displays several configuration fields.', () => {
    cy.install_container('ingress', '').then(() => {
      cy.visit('/#/ingress')

      // Click on configuration button and count fields. Should be more than 0.
      cy.get('.configure-control').click({force: true})
      cy.get('.field').should((fields) => {
        cy.expect(fields.length).to.be.greaterThan(0)
      })
    })
  })

  // Removing containers resets the Active Modules panel to empty.
  it('Removing containers from the Dynamic Intelligence Manager removes them from the UI.', () => {
    cy.install_container('ingress', '').then(() => {
      cy.visit('/#/ingress')
    })
  })

})