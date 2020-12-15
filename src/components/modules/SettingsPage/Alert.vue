<template>
  <div class="alert-area">

    <!-- Success Alert -->
    <transition name="fade">
      <div class="alert success" v-if="success !== ''">{{ success }}</div>
    </transition>

    <!-- Warning Alert -->
    <transition name="fade">
      <div class="alert warning" v-if="warning !== ''">{{ warning }}</div>
    </transition>

    <!-- Error Alert -->
    <transition name="fade">
      <div class="alert error" v-if="error != ''">{{ error }}</div>
    </transition>

    <!-- Info Alert -->
    <transition name="fade">
      <div class="alert info" v-if="info != ''">{{ info }}</div>
    </transition>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import AlertInterface from '@/components/interfaces/alert'

@Component
export default class Alert extends Vue {
  @Prop(String) alert_title!: string

  success = ''
  warning = ''
  error = ''
  info = ''

  /**
   * Upon mounting add listener for events of
   * type 'alert_title'. This is used to get
   * and display alerts of said type.
   */
  mounted() {
    this.$EventBus.$on(this.alert_title, this.alert_received)
  }

  /**
   * Handle received alerts and update the
   * relevant fields with the received
   * alert data.
   */
  alert_received(alert: AlertInterface) {
    if (alert.type === 1) {
      this.success = alert.value
    } else if (alert.type === 2) {
      this.warning = alert.value
    } else if (alert.type === 3) {
      this.error = alert.value
    } else if (alert.type === 4) {
      this.info = alert.value
    }
  }

  /**
   * Watch for updates to the value of
   * success. Upon updating, set a delay
   * before clearing the value.
   */
  @Watch('success')
  clear_success() {
    if (this.success === '') {
      return
    }
    setTimeout(() => {
      this.success = ''
    }, 5000)
  }

  /**
   * Watch for updates to the value of
   * warning. Upon updating, set a delay
   * before clearing the value.
   */
  @Watch('warning')
  clear_warning() {
    if (this.warning === '') {
      return
    }
    setTimeout(() => {
      this.warning = ''
    }, 5000)
  }

  /**
   * Watch for updates to the value of
   * error. Upon updating, set a delay
   * before clearing the value.
   */
  @Watch('error')
  clear_error() {
    if (this.error === '') {
      return
    }
    setTimeout(() => {
      this.error = ''
    }, 5000)
  }

  /**
   * Watch for updates to the value of
   * info. Upon updating, set a delay
   * before clearing the value.
   */
  @Watch('info')
  clear_info() {
    if (this.info === '') {
      return
    }
    setTimeout(() => {
      this.info = ''
    }, 5000)
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.alert {
  width: 100%;
}

.alert-area {
  width: 100%;
  margin: 0 auto;
  position: fixed;
}

.logged-out-alert {
  width: 30em;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
