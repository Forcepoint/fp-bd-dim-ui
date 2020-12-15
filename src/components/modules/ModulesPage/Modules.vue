<template>
  <div class="panel">

    <!-- Panel Header -->
    <div class="panel-header" v-if="modules.length > 0 || panel_title == 'Active Modules' || loading">
      <h2>{{ panel_title }}</h2>
    </div>

    <!-- Panel Content -->
    <div class="panel-content" v-if="modules.length > 0 && !loading">
      <div v-for="(module, index) in modules" :key="index">
        <div class="status" :class="status_class(module)">

          <!-- Module Icon -->
          <div class="icon">
            <img :src="module.icon_url" class="module-icon" v-if="module.icon_url" />
            <img src="@/assets/placeholder.jpg" class="module-icon" v-else />
          </div>

          <!-- Module Details -->
          <div class="details">

            <!-- Module - Name -->
            <span class="status-name">{{ module.module_display_name }}</span>
            <br />

            <!-- Module - Last Import -->
            <span class="status-last-import" v-if="module.configured && module.last_import != ''">
              Last update {{ module.last_import }}
            </span>
            <span class="status-last-import" v-else-if="module.configured">
              No updates received
            </span>
            <span class="status-last-import" v-else>
              Configuration Required
            </span>

          </div>

          <!-- Module Statistics -->
          <div class="stats" v-if="module.configured && module.module_type == 'ingress'">
            <Stats :module="module" />
          </div>

          <div class="stats" v-else>
          </div>

          <!-- Module Status -->
          <div class="status-area">
            <span class="status-value">
              <font-awesome-icon icon="check-circle" class="status-icon green" v-if="module.status == 1"></font-awesome-icon>
              <font-awesome-icon icon="check-circle" class="status-icon amber" v-else-if="module.status == 0"></font-awesome-icon>
              <font-awesome-icon icon="times-circle" class="status-icon red" v-else-if="module.status == -1"></font-awesome-icon>
            </span>
          </div>

          <!-- Module Controls -->
          <div class="module-controls">

            <!-- Stop/Start Control -->
            <button class="control-icon start-control" v-if="module.status == -1" @click="start(module)"><font-awesome-icon icon="play"></font-awesome-icon></button>
            <button class="control-icon stop-control" v-if="module.status == 1" @click="stop(module)"><font-awesome-icon icon="stop"></font-awesome-icon></button>

            <!-- Configure Control -->
            <button class="control-icon mid-icon configure-control" @click="$EventBus.$emit('show_config', module.module_service_name)"><font-awesome-icon icon="cog"></font-awesome-icon></button>

            <!-- Remove Control -->
            <button class="control-icon remove-control" @click="remove(module)"><font-awesome-icon icon="trash"></font-awesome-icon></button>

          </div>

        </div>

        <!-- Module Configuration -->
        <Config :index="index" :module="module" :icon="module.image_data" v-if="module.status != -1" />

      </div>
      <div class="clear"></div>
    </div>

    <!-- Panel Content - Empty -->
    <div class="panel-content" v-else-if="modules.length == 0 && !loading && panel_title == 'Active Modules' ">
      <div class="panel-empty">
        <div v-if="panel_title == 'Configuration Required'"><h2>There are no configurable modules.</h2><p>Please install a module from the Dynamic Intelligence Manager marketplace.</p></div>
        <div v-else><h2>There are no active modules.</h2><p>Go to the <router-link :to="'/marketplace'">Marketplace</router-link> tab, install a module manually or configure any module just installed.</p></div>
      </div>
    </div>

    <!-- Panel Content - Loading -->
    <div class="panel-loading" v-else-if="loading">
      <font-awesome-icon icon="spinner" spin></font-awesome-icon>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import Config from '@/components/modules/ModulesPage/Config.vue'
import Stats from '@/components/modules/ModulesPage/Stats.vue'

@Component({
  components: {
    Config,
    Stats
  }
})
export default class Modules extends Vue {
  @Prop(String) panel_title!: string
  @Prop(Boolean) loading!: boolean
  @Prop({ type: Array, required: true }) modules!: ConnectedModule[]

  /**
   * Return display class for status.
   */
  status_class(status: ConnectedModule) {
    if (status.status === 1) {
      return 'green-card'
    } else if (status.status === 0) {
      return 'amber-card'
    } else {
      return 'red-card'
    }
  }

  /**
   * Stop the selected module on the docker
   * host by sending an authenticated
   * request to the DIM controller.
   */
  stop(module: ConnectedModule) {
    console.log('Stopping the selected module.')
    const url = '/api/docker'
    const modules = { containers: [{ command: 'stop', id: module.module_service_name, name: module.module_display_name }] }
    Vue.axios.post(url, JSON.stringify(modules)).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: `Request to stop module '${module.module_display_name}' successfully sent.` })
    })
  }

  /**
   * Start the selected module on the docker
   * host by sending an authenticated
   * request to the DIM controller
   */
  start(module: ConnectedModule) {
    console.log('Starting the selected module.')
    const url = '/api/docker'
    const modules = { containers: [{ command: 'start', id: module.module_service_name, name: module.module_display_name }] }
    Vue.axios.post(url, JSON.stringify(modules)).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: `Request to start module '${module.module_display_name}' successfully sent.` })
    })
  }

  /**
   * Remove the selected module on the docker
   * host by sending an authenticated
   * request to the DIM controller.
   */
  remove(module: ConnectedModule) {
    console.log('Removing the selected module.')
    const url = '/api/docker'
    const modules = { containers: [{ command: 'remove', id: module.module_service_name, name: module.module_display_name }] }
    Vue.axios.post(url, JSON.stringify(modules)).then(() => {
      this.$EventBus.$emit('alert', { type: 1, value: `Request to remove module '${module.module_display_name}' successfully sent.` })
    })
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.status {
  float: left;
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 1em 0;
  transition: background-color 0.25s ease-in;
}

.status-icon {
  float: right;
  font-size: 1.3em;
  margin: 1em 0 0 1em;
}

.panel-control {
  float: right;
  position: relative;
  top: -1.15em;
}

.status-value {
  text-transform: uppercase;
  float: right;
  position: relative;
  margin: -0.8em 0 0 0;
}

.status-last-import {
  color: $main;
  font-size: 0.8em;
}

.configure {
  border: none;
  padding: 0.5em 1em 0.5em 1em;
  border-radius: 1em;
  position: relative;
  top: -0.25em;
  cursor: pointer;
  outline: 0;
  min-width: 6.5em;
}

.status-name {
  position: relative;
  margin: 1em 0 0 0;
}

.module-icon {
  height: 4em;
  margin: 0 1em 0 0;
  float: left;
}

.module-details {
  position: relative;
  margin: 0.8em 0.8em 0 5.5em;
  box-sizing: border-box;
}

.icon, .details, .stats, .status-area {
  float: left;
  margin: 1.5em;
  box-sizing: border-box;
}

.details {
  width: 12em;
  position: relative;
  box-sizing: border-box;
  margin: 2.25em 0 0 0;
}

.stats {
  width: 27em;
  box-sizing: border-box;
  margin: 2.25em 0 0 0;
}

.status-area {
  float: left;
  position: relative;
  box-sizing: border-box;
  margin: 2.25em 0 0 0;
}

.module-controls {
  width: 2em;
  height: 7em;
  float: right;
  box-sizing: border-box;
}

.control-icon {
  color: #FFFFFF;
  float: right;
  width: 2.75em !important;
  height: 33.33%;
  background-color: $main;
  border: none;
  transition: background-color 0.25s ease-in;
}

.control-icon:hover {
  cursor: pointer;
  background-color: #000000;
}

// Control - Healthy
.green-card .control-icon {
  color: #FFFFFF;
  float: right;
  padding: 0.64em 0.5em;
  width: 1.75em;
  background-color: $green1;
}

.green-card .control-icon:hover {
  cursor: pointer;
  background-color: $green3;
}

.mid-icon {
  border-top: 1px solid $green2;
  border-bottom: 1px solid $green2;
}

// Control Down
.red-card .control-icon {
  color: #FFFFFF;
  float: right;
  padding: 0.64em 0.5em;
  width: 1.75em;
  background-color: $red;
}

.red-card .control-icon:hover {
  cursor: pointer;
  background: $red2;
}

.red-card .mid-icon {
  border-top: 1px solid $red3;
  border-bottom: 1px solid $red3;
}

// Control Unhealthy
.amber-card .control-icon {
  color: #FFFFFF;
  float: right;
  padding: 0.64em 0.5em;
  width: 1.75em;
  background-color: $amber3;
}

.amber-card .control-icon:hover {
  cursor: pointer;
  background-color: $amber2;
}

.amber-card .mid-icon {
  border-top: 1px solid $amber3;
  border-bottom: 1px solid $amber3;
}

</style>
