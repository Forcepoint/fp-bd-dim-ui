<template>
  <div>
    <h2>Change Password</h2>
    <p>Enter the new password for the current account in the fields below.</p>
    <input type="password" placeholder="Password" :ref="'password'" />
    <input type="password" placeholder="Confirm Password" :ref="'confirmpassword'" />
    <button @click="change_password">Save</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ChangePassword extends Vue {

  /**
   * Build and send the request to change the user password.
   */
  change_password() {

    // Setup fields.
    const password = {
      email: '',
      password: ''
    }

    // Retrieve user email
    const email = localStorage.getItem('email')
    if (email) {
      password.email = email
    } else {
      this.$EventBus.$emit('alert', { type: 3, value: 'Unable to retrieve the email for the current user. Please try again later.' })
      return
    }

    // Build object.
    Object.keys(this.$refs).forEach(ref => {
      const element = this.$refs[ref] as HTMLInputElement
      password[ref] = element.value
    })

    // Validate password.
    if (!this.validate_password(password)) {
      return
    }

    // Send request.
    const url = '/api/user'
    Vue.axios.put(url, password).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: 'Successfully updated the password for the current user.' })
    }).catch((error) => {
      if (error.response.status === 401) {
        this.$EventBus.$emit('alert', { type: 2, value: 'Your session has expired. Please login again.' })
        this.$EventBus.$emit('close_websocket')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$router.push('/login')
      } else if (error.response.status === 403) {
        this.$EventBus.$emit('alert', { type: 2, value: 'You are not authorized. Please login.' })
        this.$EventBus.$emit('close_websocket')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$router.push('/login')
      } else if (error.response.status === 500) {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error updating the current users password. Please try again later.' })
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error while updating the current users password. Please try again later.' })
      }
    })
  }

  /**
   * Validate entered password.
   */
  validate_password(password: Record<string, string>) {
    let valid = true
    if (password.password === '') {
      this.$EventBus.$emit('alert', { type: 3, value: 'Please fill in the \'Password\' field before submitting.' })
      valid = false
    } else if (password.confirmpassword === '') {
      this.$EventBus.$emit('alert', { type: 3, value: 'Please fill in the \'Confirm Password\' field before submitting.' })
      valid = false
    } else if (password.password !== password.confirmpassword) {
      this.$EventBus.$emit('alert', { type: 3, value: 'Both password fields must match before submission.' })
      valid = false
    }
    return valid
  }

}
</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
@import '../../../scss/variables.scss';

input {
  width: calc(100% - 2.5em);
  background-color: $secondary;
  border: none;
  margin: 0 0 1.5em 0;
  padding: 1.3em 1.25em;
}

input:hover {
  background-color: $quatenary;
}

button {
  padding: 1em;
  background: $main;
  border: none;
  border-radius: 2px;
  color: #FFFFFF;
  float: right;
  cursor: pointer;
}

button:hover {
  background-color: black;
}

p {
  line-height: 1.5em;
  margin: 0 0 1.5em 0;
  padding: 0 0 1em 0;
  border-bottom: 1px solid $secondary;
}

h2 {
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  color: $main;
  margin: 0 0 0.5em 0;
}

</style>
