<template>
  <main>
    <div class="left">
      <img class="login-logo" src="@/assets/fp_login_logo.png" />
    </div>
    <div class="right">
      <div class="login-panel">
        <h2>Sign in</h2>
        <Alert :alert_title="'alert'" />
        <input type="text" placeholder="Email" :ref="'email'" id="email" />
        <input type="password" placeholder="Password" :ref="'password'" id="password" />
        <button @click="login">Login</button>
        <div class="clear" />
      </div>
    </div>
    <footer>
      <p><a href="https://www.forcepoint.com/copyrights-and-trademarks" target="_blank" rel="noopener noreferrer">©2020 Forcepoint</a>&nbsp;|&nbsp;<a href="https://www.forcepoint.com/legal/legal-information" target="_blank" rel="noopener noreferrer" id="footer-link-border">Privacy</a></p>
    </footer>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Alert from '@/components/modules/Global/Alert.vue'

@Component({
  components: {
    Alert
  }
})
export default class Login extends Vue {

  /**
   * Send request to login user to the
   * Dynamic Intelligence Manager.
   */
  login() {

    // Build login POST body.
    const login = {}
    let valid = true
    Object.keys(this.$refs).forEach(ref => {
      const element = this.$refs[ref] as HTMLInputElement
      if (element.value === '') {
        valid = false
        return
      }
      login[ref] = element.value
    })

    // If not valid display error.
    if (!valid) {
      this.$EventBus.$emit('alert', { type: 3, value: 'Please provide both an email and password before logging in.' })
      return
    }

    // Send request to login.
    const request = Vue.axios.create()
    delete request.defaults.headers.common['x-access-token']
    const url = '/login'
    request.post(url, JSON.stringify(login)).then((response) => {
      const status = response.data.status
      if (status) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', response.data.user.name)
        localStorage.setItem('email', response.data.user.email)
        this.$EventBus.$emit('logged_in')
        this.$router.push('/')
      } else {
        const message = response.data.message
        this.$EventBus.$emit('alert', { type: 3, value: message })
      }
    }).catch((error) => {
      if (error.response.status === 401) {
        this.$EventBus.$emit('alert', { type: 3, value: 'Invalid login credentials.' })
      } else {
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error logging you in. Please try again later.' })
      }
    })

  }

}
</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap');
@import '@/scss/variables.scss';

main {
  width: 100%;
  height: 120vh;
  background-color: #037465;
  background-image: radial-gradient(#00a28f, transparent 80%),linear-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px),linear-gradient(90deg, rgba(255, 255, 255, 0.25) 1px, transparent 1px),radial-gradient(transparent 79px, rgba(255, 255, 255, 0.25) 80px, transparent 81px),radial-gradient(transparent 79px, rgba(255, 255, 255, 0.25) 80px, transparent 81px),linear-gradient(90deg, transparent 2px, #037465 2px, #037465 138px, transparent 140px),linear-gradient(transparent 1px, rgba(255, 255, 255, 0.25) 1px, #037465 2px, #037465 139px, rgba(255, 255, 255, 0.25) 140px, transparent 140px, transparent 200px),linear-gradient(90deg, transparent 1px, rgba(255, 255, 255, 0.25) 1px, #037465 2px, #037465 139px, rgba(255, 255, 255, 0.25) 140px, transparent 140px, transparent 200px);
  background-position: -500px -500px,-2px -2px,-2px -2px,50px 50px,150px 150px,-20px 0,0 -20px,-20px 0;
  background-repeat: no-repeat,repeat,repeat,repeat,repeat,repeat,repeat,repeat;
  background-size: 3000px 2000px,100px 100px,100px 100px,200px 200px,200px 200px,200px 1px,1px 200px,200px 1px;
}

.left {
  width: 50%;
  height: 90%;
  float: left;
}

.right {
  width: 50%;
  height: 90%;
  float: left;
}

footer {
  width: 100%;
  height: 10%;
  color: #ffffff;
  text-align: center;
}

.login-logo {
  width: 30em;
  height: 11.5em;
  display: block;
  margin: 0 auto;
  position: relative;
  top: calc(50% - 5.75em);
}

.login-panel {
  background-color: rgba(0,97,84,.6);
  border: 1px solid #fff;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 32px;
  width: 30em;
  height: auto;
  margin: 0 auto;
  position: relative;
  top: calc(50% - 13.5em);
}

.login-panel h2 {
  color: #fff;
  font-size: 32px;
  margin-bottom: 28px;
  margin-top: 32px;
}

.login-panel input {
  background: none;
  border: 0;
  border-bottom: solid 1px #fff;
  box-sizing: border-box;
  color: #fff;
  font-size: 18px;
  height: 32px;
  line-height: 22px;
  padding: 0 48px 8px 0;
  width: 100%;
  margin: 1.5em 0 1.5em 0;
  outline: none;
}

.login-panel button {
  background: none;
  border: 1px solid #fff;
  border-radius: 2px;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  height: 40px;
  line-height: 16px;
  margin-top: 48px;
  transition: border-color .15s ease-in-out;
  width: 72px;
  float: right;
}

footer a {
  text-decoration: none;
}

footer a, footer a:visited, footer a:hover {
  color: #ffffff;
}

footer a:hover {
  text-decoration: underline;
}

::placeholder {
  color: #FFFFFF;
}

</style>
