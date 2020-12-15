<template>
  <div class="status-card" :class="panel_color">

    <!-- Status Header -->
    <div class="status-header">
      <div class="status-header-text">{{ status_type }}</div>
      <font-awesome-icon :icon="panel_icon" class="status-icon"></font-awesome-icon>
    </div>

    <!-- Status Content - All Healthy -->
    <div class="status-content"  v-if="all_healthy">
      All modules are currently {{ status_type }}.
    </div>

    <!-- Status Content - Modules List -->
    <div class="status-content" v-else-if="modules.length > 0" >
      The following modules are currently {{ status_type }}:
      <ul>
        <li v-for="(module, index) in modules" :key="index">{{ module.module_display_name }}</li>
      </ul>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'

@Component
export default class Status extends Vue {
  @Prop(String) status_type!: string
  @Prop({ type: Array, required: true }) modules!: ConnectedModule[]
  @Prop({ default: false }) all_healthy!: boolean

  /**
   * Return the status color based on,
   * the status_type provided.
   *
   * Healthy -> Green
   * Unhealthy -> Amber
   * Down -> Red
   */
  get panel_color() {
    let color = ''
    if (this.status_type === 'healthy') {
      color = 'green'
    } else if (this.status_type === 'unhealthy') {
      color = 'amber'
    } else if (this.status_type === 'down') {
      color = 'red'
    }
    return color
  }

  /**
   * Return the status icon based on,
   * the status_type provided.
   *
   * Healthy ->
   * Unhealthy ->
   * Down ->
   */
  get panel_icon() {
    let icon = ''
    if (this.status_type === 'healthy') {
      icon = 'check-circle'
    } else if (this.status_type === 'unhealthy') {
      icon = 'exclamation-circle'
    } else if (this.status_type === 'down') {
      icon = 'times-circle'
    }
    return icon
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.status-icon {
  float: right;
  position: relative;
  font-size: 1.5em;
  top: -0.9em;
}

.status-header {
  box-sizing: border-box;
  padding: 1.5em;
  text-transform: uppercase;
  font-weight: bold;
  color: $main;
}

.status-content {
  box-sizing: border-box;
  padding: 1.5em;
}

.status-content ul {
  list-style: disclosure-closed;
  margin: 1em 0 0 2em;
  color: $main;
}

.status-card {
  margin: 0 0 1em 0;
  font-size: 0.9em;
}

.red {
  background-color: $red2;
}

.red > .status-header {
  background-color: $red3;
}

.red > .status-header > .status-icon {
  color: $red !important;
}

.red > .status-content {
  color: $main;
}

.amber {
  background-color: $amber2;
}

.amber > .status-header {
  background-color: $amber3;
}

.amber > .status-header > .status-icon {
  color: $amber !important;
}

.amber > .status-content {
  color: $main;
}

.green {
  background-color: $green2;
}

.green > .status-header {
  background-color: $green3;
}

.green > .status-header > .status-icon {
  color: $green1 !important;
}

.green > .status-content {
  color: $main;
}

.status-content ul {
  color: #000000;
}

</style>
