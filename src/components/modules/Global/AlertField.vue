<template>
  <div>
    <transition name="fade">
      <div class="alert" :class="types[type]" v-if="display_value !== '' && !display_value.includes('Countdown')">{{ display_value }}</div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AlertField extends Vue {
  @Prop(Number) type!: number
  @Prop(String) value!: string
  @Prop(Number) interval!: number
  @Prop(Number) index!: number

  display_value = this.value

  types = [
    '',
    'success',
    'warning',
    'error',
    'info'
  ]

  mounted() {
    if (this.display_value.includes('Countdown')) {
      const values = this.display_value.replace(' ', '').split('-')
      let countdown = parseInt(values[2])
      const timer = setInterval(() => {
        if (countdown > 0) {
          this.display_value = `${values[1].trimRight()} ${countdown} seconds.`
          countdown -= 1
        } else {
          this.display_value = ''
          this.$EventBus.$emit(values[3].trimLeft())
          clearInterval(timer)
          this.$EventBus.$emit('clear_alert', this.index)
        }
      }, 1000)
    } else {
      setTimeout(() => {
        this.display_value = ''
      }, this.interval)
    }
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

.logged-out-alert {
  width: 30em;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
