describe('Login Tests - Testing Login Page', () => {

  // Test that page exists.
  it('Login page exists and is accessible to public.', () => {
    cy.visit('/#/login')

    cy.get('.login-panel').contains('Sign in')
    cy.get('.login-panel').get('#email')
    cy.get('.login-panel').get('#password')
  })

  // Test auto redirect to login page.
  it('User is redirected when accessing private pages.', () => {
    cy.visit('/#/marketplace')
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })
  
  // Test empty fields error message.
  it('Error is shown when login fields are empty.', () => {
    cy.visit('#/login')
    
    // Attempt to login.
    cy.get('.login-panel').get('button').click({force: true})
    cy.get('.login-panel').get('.alert').should('have.text', 'Please provide both an email and password before logging in.')
  })

  // Test error message when login credentials are incorrect.
  it('Error is shown when login fields contain invalid details.', () => {
    cy.visit('#/login')

    // Fill in fields with dummy data.
    cy.get('#email').type('Sherlock.Holmes@forcepoint.com', {force: true})
    cy.get('#password').type('22bBak3rStr33t', {force: true})

    // Attempt to login.
    cy.get('.login-panel').get('button').click({force: true})
    cy.get('.login-panel').get('.alert').should('have.text', 'Invalid login credentials.')
  })

  // Test successful login.
  it('User is redirected to homepage upon successful login attempt.', () => {
    cy.visit('#/login')

    // Fill in fields with dummy data.
    cy.get('#email').type('admin.user@forcepoint.com', {force: true})
    cy.get('#password').type('password1', {force: true})

    // Attempt to login.
    cy.get('.login-panel').get('button').click({force: true})

    // Check that user has been redirected
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/')
    })
  })

  // Test creating new user and logging in.
  it('New user can be created and successfully login.', () => {
    
    // Login and retrieve token, then create user.
    cy.login()
    cy.getLocalStorage('token').then(token => {
      cy.request({
        method: 'POST',
        url: '/api/user',
        headers: {
          'x-access-token': token
        },
        body: {
          'name': 'Jim Jimothy',
          'email': 'jim@theonetruejim.com',
          'password': 'helloworld'
        }
      }).then((resp) => {

        // Clear stored token.
        cy.clearLocalStorage()

        // Redirect to login page.
        cy.visit('#/login')

        // Fill in fields with dummy data.
        cy.get('#email').type('jim@theonetruejim.com', {force: true})
        cy.get('#password').type('helloworld', {force: true})
    
        // Attempt to login.
        cy.get('.login-panel').get('button').click({force: true})
    
        // Check that user has been redirected
        cy.location().should((loc) => {
          expect(loc.hash).to.eq('#/')
        })
        
      })
    })

  })

})