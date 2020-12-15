<template>
  <div id="app">
    <div class="menu" v-if="is_logged_in()">
      <div class="menu-left">
        <div class="menu-burger" @click="open = !open">
          <font-awesome-icon icon="bars" class="help-icon"></font-awesome-icon>
        </div>
        <div class="logo">
          <img src="./assets/logo_white.png" />
        </div>
        <ul class="menu-links" :class="{'menu-open': open}">
          <router-link v-for="(route, index) in this.$router.options.routes.slice(0,6)" :to="route.path" :key="index" class="menu-item" @click.native="open = false">{{ route.name }}</router-link>
          <a class="menu-item" @click="logout">Logout</a>
        </ul>
      </div>
      <div class="menu-right">
        <p class="user">{{ user() }}</p>
        <ul>
          <li><router-link :to="'/settings'"><font-awesome-icon icon="cog" class="help-icon"></font-awesome-icon></router-link></li>
          <li><a href="https://frcpnt.com/dim"><font-awesome-icon icon="question-circle" class="help-icon"></font-awesome-icon></a></li>
        </ul>
      </div>
    </div>
    <div class="menu-break" v-if="is_logged_in()"></div>
    <div class="alert-container" v-if="is_logged_in()">
      <Alert :alert_title="'alert'" />
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Alert from '@/components/modules/Global/Alert.vue'
import jwt_decode from 'jwt-decode'

@Component({
  components: {
    Alert
  }
})
export default class App extends Vue {

  open = false
  reconnectInterval = 0
  connection: WebSocket | undefined = undefined

  /**
   * Upon mounting register event handlers and
   * open the websocket connection.
   */
  mounted() {
    this.$EventBus.$on('logged_in', this.websocket)
    this.$EventBus.$on('connect_websocket', this.open_websocket)
    this.$EventBus.$on('close_websocket', this.close_websocket)
    this.websocket(false)
  }

  /**
   * Create a new websocket connection, or reconnect.
   */
  websocket(reconnecting: boolean) {

    // Check if user logged in.
    if (!this.is_logged_in()) {
      return
    }

    // Check if reconnecting.
    if (reconnecting) {
      this.$EventBus.$emit('alert', { type: 2, value: 'Countdown - Connection to Websocket lost. Reconnecting in - 5 - connect_websocket' })
    } else {
      this.$EventBus.$emit('connect_websocket')
    }

  }

  /**
   * Open a new websocket connection.
   */
  open_websocket() {

    // Retrieve token and verify.
    const token = localStorage.getItem('token')
    if (token === undefined || token === '') {
      return
    }
    const exp = jwt_decode(token).standard_claims.exp
    if (Date.now() >= exp * 1000) {
      return
    }

    // Open Websocket connection.
    this.connection = new WebSocket(`wss://${window.location.host}/api/ws?token=${token}`)

    // Handle messages received over websocket.
    this.connection.onmessage = (event) => {
      const data = event.data
      this.handle_message(data)
    }

    // On closing connection, check if up and reconnect.
    this.connection.onclose = (event) => {
      if (event.code === 1000) {
        return
      }
      this.websocket(true)
    }

    // Upon an error occuring.
    this.connection.onerror = () => {
      if (!this.is_logged_in()) {
        return
      }
      this.$EventBus.$emit('alert', { type: 3, value: 'There was an error with your connection to the websocket.' })
    }

  }

  /**
   * Close the websocket connection.
   */
  close_websocket() {
    if (!this.connection) {
      return
    }
    this.connection.close(1000, 'Deliberate disconnection')
    this.connection = undefined
  }

  /**
   * Handle messages received on the Websocket.
   */
  handle_message(event: any) {

    // Parse event.
    const message = JSON.parse(event)

    // Retrieve event details.
    let message_type = 0
    if (message.event_type === 'success') {
      message_type = 1
    } else if (message.event_type === 'warning') {
      message_type = 2
    } else if (message.event_type === 'error') {
      message_type = 3
    } else if (message.event_type === 'info') {
      message_type = 2
    }

    // Emit event for alert area.
    this.$EventBus.$emit('alert', { type: message_type, value: message.value })

    // Emit refresh event.
    const event_type = message.context.type
    const event_module = message.context.identifier
    const state = message.context.state
    if (event_type === 'module') {
      this.$EventBus.$emit('refresh', { module: event_module, state: state })
    } else {
      this.$EventBus.$emit('refresh')
    }
  }

  /**
   * On clicking logout button, logout the user.
   * This involved clearing their token and returning
   * them to the login page.
   */
  logout() {
    this.open = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    this.$EventBus.$emit('close_websocket')
    this.$router.push('/login')
  }

  /**
   * If a user is logged in return True.
   * This is used to control whether the router
   * links are displayed or not.
   */
  is_logged_in() {
    if (localStorage.getItem('token')) {
      return true
    }
    return false
  }

  /**
   * Get the logged in user name.
   */
  user() {
    return localStorage.getItem('user')
  }

  /**
   * Alert Size controller. Adjusts based on panel size.
   */
  alert_small() {
    let small = false
    const small_routes = ['/login', '/user', '/password']
    const route = this.$route.path
    if (!route) {
      small = false
    } else {
      small = small_routes.indexOf(route) > -1
    }
    return small
  }

}
</script>

<style lang="scss">

@import './scss/main.scss';
@import "vue-select/src/scss/vue-select.scss";

</style>
