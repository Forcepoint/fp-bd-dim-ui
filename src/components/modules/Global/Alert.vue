<template>
  <div class="alert-area" :class="{ 'logged-out': !is_logged_in }">
    <AlertField v-for="(alert, index) in alerts" :key="index" :value="alert.value" :type="alert.type" :interval="5000" :index="index" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import AlertField from '@/components/modules/Global/AlertField.vue'
import AlertInterface from '@/components/interfaces/alert'

@Component({
  components: {
    AlertField
  }
})
export default class Alert extends Vue {
  @Prop(String) alert_title!: string

  reconnect_alert_received = false

  alerts: AlertInterface[] = []
  types = [
    '',
    'success',
    'warning',
    'error',
    'info'
  ]

  /**
   * Upon mounting add listener for events of
   * type 'alert_title'. This is used to get
   * and display alerts of said type.
   */
  mounted() {
    this.$EventBus.$on(this.alert_title, this.alert_received)
    this.$EventBus.$on('clear_alert', this.clear_alert)
  }

  /**
   * Handle received alerts and update the
   * relevant fields with the received
   * alert data.
   */
  alert_received(alert: AlertInterface) {
    if (alert.value.includes('Countdown') && !this.reconnect_alert_received) {
      this.alerts.push(alert)
      this.reconnect_alert_received = true
    } else if (!alert.value.includes('Countdown')) {
      this.alerts.push(alert)
    }
  }

  /**
   * Remove alerts from alert array by index.
   */
  clear_alert(index: number) {
    if (!this.alerts[index]) {
      return
    }
    if (this.alerts[index].value.includes('Countdown')) {
      this.reconnect_alert_received = false
    }
    this.alerts.splice(index, 1)
  }

  /**
   * Return whether the user is logged in.
   */
  get is_logged_in() {
    if (localStorage.getItem('token')) {
      return true
    }
    return false
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.alert {
  margin: 0 0 0.5em 0;
}

.alert-area {
  position: fixed;
  width: 20em;
  opacity: .9;
  left: 1.5em;
}

.logged-out {
  opacity: .9;
  position: relative;
  margin: 0;
  left: 0;
  width: 100% !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
