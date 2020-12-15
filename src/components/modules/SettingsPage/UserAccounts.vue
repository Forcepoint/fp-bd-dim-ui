<template>
  <div>
    <h2>User Accounts</h2>
    <p>Add or remove user accounts from the Dynamic Intelligence Manager system. All user accounts added to the system have full access to the Dynamic Intelligence Manager controler.</p>
    <div class="control-area">
      <h3>Create User</h3>
      <input type="text" placeholder="Name" :ref="'name'" />
      <input type="text" placeholder="Email" :ref="'email'" />
      <input type="password" placeholder="Password" :ref="'password'" />
      <button @click="create_user">Create</button>
      <div style="clear: both;"></div>
    </div>
    <div class="control-area">
      <h3>Delete User</h3>
      <table>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th></th>
        </tr>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td><button @click="delete_user(user)">Delete</button></td>
        </tr>
      </table>
      <div style="clear: both;"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { User } from '@/components/dataclasses/User'

@Component
export default class UserAccounts extends Vue {

  users: User[] = []

  /**
   * On mounting retrieve all user accounts in
   * the Dynamic Intelligence Manager system.
   */
  mounted() {
    this.retrieve_users()
    this.$EventBus.$on('refresh', this.retrieve_users)
  }

  /**
   * Retrieve an array of all users in the
   * Dynamic Intelligence Manager.
   */
  retrieve_users() {
    const url = '/api/user'
    Vue.axios.get(url).then((response) => {
      if (response.data.items === null) {
        return
      }
      this.users = []
      response.data.items.forEach(user => {
        const new_user = new User(user.name, user.email)
        this.users.push(new_user)
      })
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
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving user accounts. Please try again later.' })
      }
    })
  }

  /**
   * Send request to /api/user endpoint to create
   * a new user for the Dynamic Intelligence Manager.
   */
  create_user() {

    // Build create user POST body.
    const user = {}
    Object.keys(this.$refs).forEach(ref => {
      const element = this.$refs[ref] as HTMLInputElement
      user[ref] = element.value
    })
    console.log(user)

    // Validate user
    if (!this.validate_user(user)) {
      return
    }

    // Send request to create user.
    const url = '/api/user'
    Vue.axios.post(url, JSON.stringify(user)).then((response) => {
      const status = response.status
      if (status === 201) {
        this.$EventBus.$emit('alert', { type: 1, value: 'Successfully created the new user account.' })
        this.$EventBus.$emit('refresh')
      }
    }).catch((error) => {
      if (error.response.status === 400) {
        console.log('User already exists.')
      } else if (error.response.status === 401) {
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
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error creating the user. Please try again later.' })
      }
    })

  }

  /**
   * Validate the user fields before submission.
   */
  validate_user(user: Record<string, string>) {
    let valid = true

    // Check that all fields have been filled.
    if (user.name === '') {
      this.$EventBus.$emit('alert', { type: 3, value: 'All fields must be filled. Please submit again once the \'Name\' field has been filled.' })
      valid = false
    } else if (user.email === '') {
      this.$EventBus.$emit('alert', { type: 3, value: 'All fields must be filled. Please submit again once the \'Email\' field has been filled.' })
      valid = false
    } else if (user.password === '') {
      this.$EventBus.$emit('alert', { type: 3, value: 'All fields must be filled. Please submit again once the \'Password\' field has been filled.' })
      valid = false
    }

    // Check that the email address is valid.
    if (valid) {
      const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const pattern = new RegExp(email_regex)

      valid = pattern.test(user.email)
      if (!valid) {
        this.$EventBus.$emit('alert', { type: 3, value: 'A valid email address must be entered.' })
      }
    }

    return valid
  }

  /**
   * Send request to user endpoint to delete
   * the given user account.
   */
  delete_user(user: User) {
    const url = '/api/user'
    this.$fire({
      title: 'Confirm',
      text: 'Are you sure you wish to delete this user account?',
      showCancelButton: true,
      customClass: {
        popup: 'confirm-popup',
        header: 'confirm-header',
        cancelButton: 'cancel-button',
        confirmButton: 'confirm-button',
        title: 'confirm-title',
        content: 'confirm-content'
      }
    }).then(r => {
      if (r.value) {
        Vue.axios.delete(url, { data: JSON.stringify(user) }).then((response) => {
          this.$EventBus.$emit('alert', { type: 1, value: 'Successfully deleted the user account.' })
          this.$EventBus.$emit('refresh')
        }).catch((error) => {
          if (error.response.status === 401) {
            this.$EventBus.$emit('alert', { type: 2, value: 'Your session has expired. Please login again.' })
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
          } else if (error.response.status === 403) {
            this.$EventBus.$emit('alert', { type: 2, value: 'You are not authorized. Please login.' })
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
          } else {
            this.$EventBus.$emit('alert', { type: 3, value: 'There was an error deleting the user. Please try again later.' })
          }
        })
      }
    })
  }

}
</script>

<style lang="scss" scoped>

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

h2, h3 {
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  color: $main;
  margin: 0 0 0.5em 0;
}

h3 {
  width: 100%;
  border-bottom: 1px solid $secondary;
  padding: 0 0 1em 0;
  margin: 0 0 1em 0;
}

.control-area {
  border-bottom: 1px solid $secondary;
  padding: 0 0 1em 0;
  margin: 0 0 1em 0;
}

table {
  margin: 1em 0 0 0;
  display: table;
}

</style>
