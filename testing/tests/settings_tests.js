describe('Settings Tests - Testing Settings Page', () => {

  // Run before each test.
  beforeEach(() => {
    cy.login()
  })

  // Test that page is inaccessible to public.
  it('Settings page is inaccessible to public.', () => {
    cy.logout()
    cy.visit('/#/settings')

    // Ensure that the user is redirected to login page.
    cy.location().should((loc) => {
      expect(loc.hash).to.eq('#/login')
    })
  })

  // Test that page exists.
  it('Settings page exists and contains links to create user, backup etc.', () => {
    cy.visit('/#/settings')

    // Check that links to all settings exist.
    cy.get('.settings-menu').contains('Backup')
    cy.get('.settings-menu').contains('User Accounts')
    cy.get('.settings-menu').contains('Registration Token')
    cy.get('.settings-menu').contains('Change Password')
  })

  // Test that backup now button creates backup.
  it('Backup now button creates new backup.', () => {
    cy.remove_elements().then(() => {
      cy.visit('/#/settings')
      cy.get('.backup-now button').click({force: true})
      cy.wait(1000)
      cy.get('.backup-row td').then((backups) => {
        old_date = backups[1].innerText
        old_elements = backups[2].innerText
        cy.add_element('URL', 'Safelist', 'http://deletemeplease.com/ineedtobedeleted').then(() => {
          cy.visit('/#/settings')
          cy.get('.backup-now button').click({force: true})
          cy.visit('/#/settings')
          cy.get('.backup-row td').then((backups) => {
            new_date = backups[1].innerText
            new_elements = backups[2].innerText
            expect(old_date + ' - ' + old_elements).not.to.eq(new_date + ' - ' + new_elements)
          })
        })
      })
    })
  })

  // Test that creating user succeeds.
  it('Create user form successfully creates a new user.', () => {
    cy.remove_users().then(() => {
      cy.visit('/#/settings')
      cy.get('.settings-menu li').contains('User Accounts').click({force: true}).then(() => {
        cy.get('input[placeholder=Name]').clear({force: true}).type('Paul Blart', {force: true})
        cy.get('input[placeholder=Email]').clear({force: true}).type('paul.blart@forcepoint.com', {force: true})
        cy.get('input[placeholder=Password]').clear({force: true}).type('theyseemerollingtheyhating', {force: true})
        cy.get('button').contains('Create').click({force: true})
        cy.wait(1000)
        cy.get('tr').contains('Paul Blart').should('have.length', 1)
      })
    })
  })

  // Test that creating duplicate user fails.
  it('Create user form prevents duplicate users being created.', () => {
    cy.remove_users().then(() => {
      cy.visit('/#/settings')
      cy.get('.settings-menu li').contains('User Accounts').click({force: true}).then(() => {
        cy.get('input[placeholder=Name]').clear({force: true}).type('Paul Blart', {force: true})
        cy.get('input[placeholder=Email]').clear({force: true}).type('paul.blart@forcepoint.com', {force: true})
        cy.get('input[placeholder=Password]').clear({force: true}).type('theyseemerollingtheyhating', {force: true})
        cy.get('button').contains('Create').click({force: true})
        cy.wait(1000)
        cy.get('input[placeholder=Name]').clear({force: true}).type('Paul Blart', {force: true})
        cy.get('input[placeholder=Email]').clear({force: true}).type('paul.blart@forcepoint.com', {force: true})
        cy.get('input[placeholder=Password]').clear({force: true}).type('theyseemerollingtheyhating', {force: true})
        cy.get('button').contains('Create').click({force: true})
        cy.wait(1000)
        cy.get('.warning').contains('User already exists')
        cy.get('tr').contains('Paul Blart').should('have.length', 1)
      })
    })
  })

  // Test that all fields must be entered.
  it('All fields must be entered before submitting create user form.', () => {
    cy.visit('/#/settings')
    cy.get('.settings-menu li').contains('User Accounts').click({force: true}).then(() => {
      cy.get('input[placeholder=Name]').clear({force: true}).type('Paul Blart', {force: true})
      cy.get('input[placeholder=Email]').clear({force: true}).type('paul.blart@forcepoint.com', {force: true})
      cy.get('button').contains('Create').click({force: true})
      cy.get('.error').contains('All fields must be filled. Please submit again once the \'Password\' field has been filled.')
      cy.get('input[placeholder=Name]').clear({force: true}).type('Paul Blart', {force: true})
      cy.get('input[placeholder=Email]').clear({force: true})
      cy.get('button').contains('Create').click({force: true})
      cy.get('.error').contains('All fields must be filled. Please submit again once the \'Email\' field has been filled.')
    })
  })

  // Test that valid email address must be entered.
  it('A valid email address must be supplied.', () => {
    cy.visit('/#/settings')
    cy.get('.settings-menu li').contains('User Accounts').click({force: true}).then(() => {
      cy.get('input[placeholder=Name]').clear({force: true}).type('Paul Blart', {force: true})
      cy.get('input[placeholder=Email]').clear({force: true}).type('notanemail', {force: true})
      cy.get('input[placeholder=Password]').clear({force: true}).type('theyseemerollingtheyhating', {force: true})
      cy.get('button').contains('Create').click({force: true})
      cy.get('.error').contains('A valid email address must be entered.')
    })
  })
  
})