describe('Elements Tests - Testing Elements Page', () => {

  // Run before each test.
  beforeEach(() => {
    cy.login()
    cy.remove_elements()
  })

  // Test that page is inaccessible to public.
  it('Elements page is inaccessible to public.', () => {
    cy.logout()
    cy.visit('/#/elements')

    // Ensure that the user is redirected to login page.
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })

  // Test that page exists.
  it('Elements exists and contains safelist and blocklist panel.', () => {
    cy.visit('/#/elements')

    // Wait for page to load.
    cy.wait(1000)

    // Check that both the Safelist and Blocklist panel exists.
    cy.get('.panel').contains('Safelist')
    cy.get('.panel').contains('Blocklist')
  })

  // Test that when no elements are contained within the safelist the no elements found message is displayed.
  it('No elements in safelist message is displayed when no elements have been added.', () => {
    cy.visit('/#/elements')

    // Wait for element retrieval to complete.
    cy.wait(1000)

    // Check if message is displayed indicating no elements present.
    cy.get('.panel-content').contains('No elements found.')
    cy.get('.panel-content').contains('Please import elements into the Dynamic Intelligence Manager')
  })

  // Test that when no element are contained within the blocklist, the no elements found message is displayed.
  it('No elements in blocklist message is displayed when no elements have been added.', () => {
    cy.visit('/#/elements')

    // Wait for element retrieval to complete.
    cy.wait(1000)

    // Switch to the blocklist tab.
    cy.get('.elements-menu > li').not('.active').click({force: true, multiple: true})

    // Check if the message is displayed indicating no elements present.
    cy.get('.panel-content').contains('No elements found.')
    cy.get('.panel-content').contains('Please import elements into the Dynamic Intelligence Manager')
  })

  // Test that the add element module exists.
  it('Clicking add element button displays the add element module.', () => {
    cy.visit('/#/elements')

    // Find add elements button and click it.
    cy.get('.add-element').click({force: true})

    // Check for add element module dom elements.
    cy.get('tr').contains('td', 'Manual Entry')
    cy.get('.v-select').contains('URL')
    cy.get('input[placeholder=Value]').should('be.empty')
    cy.get('td button').contains('Submit')
  })

  // Test that there are four options for adding elements.
  it('Add Element module contains dropdown with four values: URL, RANGE, IP, DOMAIN.', () => {
    cy.visit('/#/elements')

    // Open add elements module.
    cy.get('.add-element').click({force: true})

    // Retrieve the dropdown.
    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').should('have.length', 4)
    cy.get('.vs__dropdown-menu li').should((types) => {
      cy.expect(types[0].innerText).to.equal('URL')
      cy.expect(types[1].innerText).to.equal('DOMAIN')
      cy.expect(types[2].innerText).to.equal('IP')
      cy.expect(types[3].innerText).to.equal('RANGE')
    })
  })

  // Test adding each type of element.
  it('Adding valid elements of each type succeeds and is displayed in the blocklist and safelist.', () => {
    cy.visit('/#/elements')

    // Wait for page to load.
    cy.wait(1000)

    // Add to safelist.
    cy.get('.add-element').click({force: true})

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('URL').click({force: true})
    cy.get('input[placeholder=Value]').type('http://jimisreal.com/believe', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'URL\' with value \'http://jimisreal.com/believe\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('IP').click({force: true})
    cy.get('input[placeholder=Value]').type('115.165.134.153', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'IP\' with value \'115.165.134.153\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('DOMAIN').click({force: true})
    cy.get('input[placeholder=Value]').type('jimisreal.com', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'DOMAIN\' with value \'jimisreal.com\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('RANGE').click({force: true})
    cy.get('input[placeholder=To]').type('111.111.111.222', {force: true})
    cy.get('input[placeholder=From]').type('111.111.111.111', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'RANGE\' with value \'111.111.111.111-111.111.111.222\'.')

    // Wait for page to load.
    cy.wait(1000)

    // Check safelist length.
    cy.get('.list-element').should('have.length', 4)

    // // Add to blocklist.
    cy.get('.elements-menu > li').not('.active').click({force: true, multiple: true})
    cy.wait(1000)

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('URL').click({force: true})
    cy.get('input[placeholder=Value]').type('http://jimisnotreal.com/believe', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'URL\' with value \'http://jimisnotreal.com/believe\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('IP').click({force: true})
    cy.get('input[placeholder=Value]').type('122.221.122.221', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'IP\' with value \'122.221.122.221\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('DOMAIN').click({force: true})
    cy.get('input[placeholder=Value]').type('jimisnotreal.com', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'DOMAIN\' with value \'jimisnotreal.com\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('RANGE').click({force: true})
    cy.get('input[placeholder=To]').type('222.111.111.222', {force: true})
    cy.get('input[placeholder=From]').type('222.111.111.111', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('Successfully added entry for \'RANGE\' with value \'222.111.111.111-222.111.111.222\'.')

    // Wait for page to load.
    cy.wait(1000)

    // Check blocklist length.
    cy.get('.list-element').should('have.length', 4)
  })

  // Test that invalid elements are blocked.
  it('Adding invalid elements is prevented and an error is displayed.', () => {
    cy.visit('/#/elements')

    // Wait for page to load.
    cy.wait(1000)

    // Add to safelist.
    cy.get('.add-element').click({force: true})

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('URL').click({force: true})
    cy.get('input[placeholder=Value]').clear({force: true}).type('notavalidurl', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'URL\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('IP').click({force: true})
    cy.get('input[placeholder=Value]').clear({force: true}).type('555.555.555.555', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'IP\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('DOMAIN').click({force: true})
    cy.get('input[placeholder=Value]').clear({force: true}).type('..com', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'DOMAIN\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('RANGE').click({force: true})
    cy.get('input[placeholder=To]').clear({force: true}).type('555.555.555.555', {force: true})
    cy.get('input[placeholder=From]').clear({force: true}).type('666.666.666.666', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'RANGE\'.')

    // Wait for page to load.
    cy.wait(1000)

    // Check safelist length.
    cy.get('.list-element').should('have.length', 0)

    // // Add to blocklist.
    cy.get('.elements-menu > li').not('.active').click({force: true, multiple: true})
    cy.wait(1000)

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('URL').click({force: true})
    cy.get('input[placeholder=Value]').clear({force: true}).type('notavalidurl', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'URL\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('IP').click({force: true})
    cy.get('input[placeholder=Value]').clear({force: true}).type('555.555.555.555', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'IP\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('DOMAIN').click({force: true})
    cy.get('input[placeholder=Value]').clear({force: true}).type('..com', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'DOMAIN\'.')

    cy.get('.vs__open-indicator').click({force: true})
    cy.get('.vs__dropdown-menu li').contains('RANGE').click({force: true})
    cy.get('input[placeholder=To]').clear({force: true}).type('555.555.555.555', {force: true})
    cy.get('input[placeholder=From]').clear({force: true}).type('666.666.666.666', {force: true})
    cy.get('td button').contains('Submit').click({force: true})
    cy.get('.alert-area').contains('The value entered must be a valid \'RANGE\'.')


    // Wait for page to load.
    cy.wait(1000)

    // Check blocklist length.
    cy.get('.list-element').should('have.length', 0)
  })

  // Test that deletion of elements works.
  it('Deleting elements from the safelist removes them from the safelist.', () => {
    cy.visit('/#/elements')

    cy.add_element('URL', 'Safelist', 'http://deletemeplease.com/ineedtobedeleted').then(() => {
      cy.wait(1000)
      cy.get('.list-element').should('have.length', 1)
      cy.get('.delete-button').click({force: true, multiple: true})
      cy.get('.confirm-button').click({force: true})
      cy.wait(1000)
      cy.get('.list-element').should('have.length', 0)
    })
  })

  // Test the deletion of elements from the safelist works.
  it('Deletion of elements from blocklist removes them from the blocklist.', () => {
    cy.visit('/#/elements')

    cy.add_element('URL', 'Blocklist', 'http://deletemeplease.com/ineedtobedeleted').then(() => {
      cy.wait(1000)
      cy.get('.list-element').should('have.length', 1)
      cy.get('.delete-button').click({force: true, multiple: true})
      cy.get('.confirm-button').click({force: true})
      cy.wait(1000)
      cy.get('.list-element').should('have.length', 0)
    })
  })

  // // Test that editing of elements displays an error when value is not valid.
  it('Editing elements and providing invalid elements, fails.', () => {
    cy.visit('/#/elements')

    cy.add_element('URL', 'Safelist', 'http://testing.com').then(() => {
      cy.get('.edit-button').then((elements) => {
        elements[0].click({force: true})
        cy.wait(1000)
        cy.get('input[placeholder=Value]').clear({force: true}).type('@testing.com')
        cy.get('.save-button').click({force: true})
        cy.get('.alert-area').contains('The value entered must be a valid \'URL\'.')
      })
    })
  })

  // // Editing elements and supplying valid updates succeeds.
  it('Editing elements and providing valid elements succeeds.', () => {
    cy.visit('/#/elements')

    cy.add_element('URL', 'Safelist', 'http://testing.com').then(() => {
      cy.get('.edit-button').then((elements) => {
        elements[0].click({force: true})
        cy.wait(1000)
        cy.get('input[placeholder=Value]').clear({force: true}).type('http://alsotesting.com')
        cy.get('.save-button').click({force: true})
        cy.get('.alert-area').contains('Successfully updated element from \'http://testing.com\' to \'http://alsotesting.com\'.')
      })
    })
  })

  // // Test that the moving of elements from safelist to blocklist works.
  it('Moving elements from safelist to blocklist succeeds.', () => {
    cy.add_elements().then(() => {
      cy.visit('/#/elements')
      cy.get('.list-element').should('have.length', 3)
      cy.get('.elements-menu > li').not('.active').click({force: true, multiple: true})
      cy.get('.move-button').then((elements) => {
        elements[0].click({force: true})
        cy.get('.list-element').should('have.length', 2)
        cy.get('.elements-menu > li').not('.active').click({force: true, multiple: true})
        cy.wait(1000)
        cy.get('.list-element').should('have.length', 4)
      })
    })
  })

  // Test that the moving of elements from blocklist to safelist works.
  it('Moving elements from blocklist to safelist works.', () => {
    cy.add_elements().then(() => {
      cy.visit('/#/elements')
      cy.get('.list-element').should('have.length', 3)
      cy.get('.move-button').then((elements) => {
        elements[0].click({force: true})
        cy.get('.list-element').should('have.length', 2)
        cy.get('.elements-menu > li').not('.active').click({force: true, multiple: true})
        cy.wait(1000)
        cy.get('.list-element').should('have.length', 4)
      })
    })
  })

  // Test that the search field filters the results.
  it('Entering a value in the search field filters the results.', () => {
    cy.add_elements().then(() => {
      cy.visit('/#/elements')
      cy.get('input[placeholder="Type to search..."]').type('222', {force: true})
      cy.get('.list-element').should('have.length', 1)
    })
  })

})