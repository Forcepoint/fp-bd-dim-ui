<template>
  <div>
    <!-- Modules Panels -->
    <div class="row">
      <Modules :panel_title="'Active Modules'" :modules="modules_list(true)" :loading="loading" :key="key" />
    </div>
    <div class="row">
      <Modules :panel_title="'Configuration Required'" :modules="modules_list(false)" :loading="loading" :key="key" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import Modules from '@/components/modules/ModulesPage/Modules.vue'
import Stats from '@/components/modules/ModulesPage/Stats.vue'

@Component({
  components: {
    Modules,
    Stats
  }
})
export default class ModulePane extends Vue {
  @Prop(String) module_type: string | undefined

  // Set state of module
  loading = true
  key = 0

  // Store Modules
  modules: ConnectedModule[] = []

  /**
   * Upon mounting send request for
   * module statuses.
   */
  mounted() {
    this.$EventBus.$on('refresh_modules', this.retrieve_statuses)
    // this.$EventBus.$on('refresh', this.retrieve_statuses)
    this.$EventBus.$on('refresh', this.handle_refresh)
    this.retrieve_statuses()
  }

  /**
   * Handle refresh requests from websocket
   * messages received.
   */
  handle_refresh(message: Record<string, string>) {
    const state = message.state
    const module = message.module
    if (state === 'started') {
      this.change_state(module, 1)
    } else if (state === 'stopped') {
      this.change_state(module, -1)
    } else if (state === 'deleted') {
      this.remove_module(module)
    } else if (state === 'created') {
      this.retrieve_statuses()
    }
  }

  /**
   * Change module display state.
   */
  change_state(service: string, state: number) {
    this.modules.forEach((module) => {
      if (module.module_service_name === service) {
        module.status = state
      }
    })
  }

  /**
   * Remove module by module service name.
   */
  remove_module(service: string) {

    // Retrieve module index.
    let service_index = -1
    this.modules.forEach((module, index) => {
      if (module.module_service_name === service) {
        service_index = index
      }
    })

    // Splice module from array.
    console.log(service_index)
    if (service_index !== -1) {
      this.modules.splice(service_index, 1)
    }
  }

  /**
   * Retrieve module statuses
   */
  retrieve_statuses() {

    this.loading = true
    this.key++
    this.modules = []

    // Retrieve health
    const url = `/api/modules?moduleType=${this.module_type}`
    Vue.axios.get(url).then(response => {
      if (response.data === null) {
        this.loading = false
        return
      }
      const modules: ConnectedModule[] = []
      response.data.forEach(module => {
        const new_module = new ConnectedModule(
          module.module_display_name,
          module.module_service_name,
          module.module_description,
          module.module_type,
          module.icon_url,
          module.inbound_route,
          module.configured,
          module.configurable,
          module.module_health.status,
          module.module_health.last_update
        )
        modules.push(new_module)
      })
      this.modules = modules
      this.loading = false
      this.key++
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving the modules. Please try again later.' })
      }
    })

  }

  /**
   * Return the computed list of configured
   * or not configured modules.
   */
  modules_list(configured: boolean) {
    let list: ConnectedModule[] = []
    if (configured) {
      list = this.modules.filter(status => {
        return status.configured
      })
    } else {
      list = this.modules.filter(status => {
        return !status.configured
      })
    }
    return list
  }

}
</script>
