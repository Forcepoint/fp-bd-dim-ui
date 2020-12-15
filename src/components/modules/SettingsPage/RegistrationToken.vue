<template>
  <div>
    <h2>Registration Token</h2>
    <p>To register new modules with the Dynamic Intelligence Manager controller, a valid registration token is required. This token is within the text field below.</p>
    <h3>Your Token</h3>
    <input type="text" placeholder="Key" :value="key" disabled />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class RegistrationToken extends Vue {

  key = ''

  /**
   * Load current key into field upon
   * mounting the module.
   */
  mounted() {
    this.create_key()
  }

  /**
   * Send a request to create a new key
   * and display it.
   */
  create_key() {

    // Send request for key.
    const url = '/api/keys'
    Vue.axios.get(url).then((response) => {
      const status = response.status
      if (status === 200) {
        if (response.data.message && response.data.message !== '') {
          const message = response.data.message.split(' ')
          const token = message[message.length - 1]
          this.key = token
          this.$EventBus.$emit('alert', { type: 1, value: 'Successfully retreived registration token.' })
        }
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error creating the new registration token. Please try again later.' })
      }
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
      }
    })

  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

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

</style>
