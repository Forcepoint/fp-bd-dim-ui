// Login to Dynamic Intelligence Manager with Admin account.
Cypress.Commands.add('login', () => { 
  cy.request({
    method: 'POST',
    url: '/login',
    body: JSON.stringify({
      "email": "admin.user@forcepoint.com",
      "password": "password1"
    })
  })
  .then((resp) => {
    cy.setLocalStorage('token', resp.body.token)
  })
})

// Logout of Dynamic Intelligence Manager.
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage()
})

// Retrieve list of attached containers from Dynamic Intelligence Manager.
Cypress.Commands.add('get_containers', () => {
  cy.getLocalStorage('token').then((token) => {
    cy.request({
      method: 'GET',
      url: '/api/docker',
      headers: {
        'x-access-token': token
      }
    }).then((resp) => {
      let containers = []
      if (resp.body !== null && resp.body.containers !== null) {
        containers = resp.body.containers.filter((container) => { return !container.includes('dim-controller') && !container.includes('dim-ui') && !container.includes('mariadb') })
      }
      return containers
    })
  })
})

// Remove all attached containers from Dynamic Intelligence Manager.
Cypress.Commands.add('remove_containers', () => {
  cy.get_containers().then((containers) => {
    cy.getLocalStorage('token').then((token) => {
      containers.forEach(container => {
        console.log(container.replace('/', ''))
        cy.request({
          method: 'POST',
          url: '/api/docker',
          headers: {
            'x-access-token': token
          },
          body: JSON.stringify({ containers: [{'command': 'remove', 'id': container.replace('/', '')}] })
        })
        cy.wait(5000)
      })
      return
    })
  })
})

// Install random container from marketplace.
Cypress.Commands.add('install_container', (type, name) => {
  cy.visit('/#/marketplace')

  cy.get('.install').then((modules) => {

    // Select correct panel based on type provided.
    if (type === 'ingress') {
      cy.get('.active').click({force: true, multiple: true})
    } else if (type === 'egress') {
      cy.get('.market-menu > li').not('.active').click({force: true, multiple: true})
    }

    if (name == '') {
      const module = modules[Math.floor(Math.random() * modules.length)]
      module.click()
    } else {
      cy.get('.market-module').contains(name).parentsUntil('.market-module').parent().within((module) => {
        cy.get('.install').click({force: true})
      })
    }

    // Wait for command to complete.
    cy.wait(5000)

  })

})

// Retrieve list of all elements from safelist and blocklist.
Cypress.Commands.add('get_elements', (safelist) => {
  let elements = []
  cy.getLocalStorage('token').then((token) => {
    cy.request({
      method: 'GET',
      url: `/api/elements?pageSize=100000&page=1&safeList=${safelist}`,
      headers: {
        'x-access-token': token
      }
    }).then((resp) => {
      elements = resp.body.elements
      return elements
    })
  })
})

// Delete all elements from safelist and blocklist.
Cypress.Commands.add('remove_elements', () => {

  // Remove safelist elements.
  cy.get_elements(true).then((elements) => {
    if (elements !== null && elements.length > 0) {
      cy.getLocalStorage('token').then((token) => {
        elements.forEach((element) => {
          cy.request({
            method: 'DELETE',
            url: '/api/elements',
            headers: {
              'x-access-token': token
            },
            body: JSON.stringify(element)
          })
        })
      })
    }
  })

  // Remove blocklist elements.
  cy.get_elements(false).then((elements) => {
    if (elements !== null && elements.length > 0) {
      cy.getLocalStorage('token').then((token) => {
        elements.forEach((element) => {
          cy.request({
            method: 'DELETE',
            url: '/api/elements',
            headers: {
              'x-access-token': token
            },
            body: JSON.stringify(element)
          })
        })
      })
    }
  })

})

// Add element to list.
Cypress.Commands.add('add_element', (type, list, value) => {
  cy.visit('/#/elements')

  cy.wait(500)

  // Switch tabs.
  cy.get('.elements-menu > li').contains(list).click({force: true, multiple: true})

  // Open panel.
  cy.get('.add-element').click({force: true})

  // Fill in values.
  cy.get('.vs__open-indicator').click({force: true})
  cy.get('.vs__dropdown-menu li').contains(type).click({force: true})
  cy.get('input[placeholder=Value]').type(value, {force: true})
  cy.get('td button').contains('Submit').click({force: true})

  // Close panel
  cy.get('.add-element').click({force: true})

})

// Add elements to both lists.
Cypress.Commands.add('add_elements', (list) => {

  cy.add_element('URL', 'Safelist', 'http://testing.com')
  cy.add_element('IP', 'Safelist', '111.111.111.111')
  cy.add_element('DOMAIN', 'Safelist', 'nottesting.com')
  cy.add_element('URL', 'Blocklist', 'http://nottesting.com')
  cy.add_element('IP', 'Blocklist', '222.222.222.222')
  cy.add_element('DOMAIN', 'Blocklist', 'testing.com')

})

// Delete all users from settings.
Cypress.Commands.add('remove_users', () => {
  cy.visit('/#/settings')
  cy.get('.settings-menu li').contains('User Accounts').click({force: true}).then(() => {
    cy.wait(2000)
    cy.get('table').find('tr').then((rows) => {
      if (rows.length > 1) {
        cy.get('table button').each(($el) => {
          cy.wrap($el).click({force: true})
          cy.get('button').contains('OK').click({force: true})
        })
      }
    }) 
  })
})