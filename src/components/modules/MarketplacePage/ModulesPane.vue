<template>
  <div class="panel">

    <!-- Panel Header -->
    <div class="panel-header market">
      <ul class="market-menu">
        <li :class="{active: active == 'Source Modules'}" @click="set_active('Source Modules')">Source Modules</li>
        <li :class="{active: active == 'Export Modules'}" @click="set_active('Export Modules')">Export Modules</li>
      </ul>
    </div>

    <!-- Panel Loading -->
    <div class="panel-loading" v-if="loading">
      <font-awesome-icon icon="spinner" spin></font-awesome-icon>
    </div>

    <!-- Panel Content - Source Modules -->
    <div class="panel-content" v-else>
      <Results :status_type="'Available'" :modules="modules(false)" :type="active" :key="available_key" />
      <hr />
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { CatalogModule } from '@/components/dataclasses/CatalogModule'
import Results from '@/components/modules/MarketplacePage/Results.vue'

@Component({
  components: {
    Results
  }
})
export default class CatalogPane extends Vue {

  // Set state of module.
  loading = false
  active = ''
  available_key = 0
  installed_key = 1

  // Store modules.
  all_modules: CatalogModule[] = []

  // Store installed modules service names.
  installed_modules: string[] = []

  /**
   * Upon mounting load required data.
   */
  mounted() {
    this.load_modules()
    this.$EventBus.$on('load_modules', this.load_modules)
    this.$EventBus.$on('refresh', this.handle_refresh)
  }

  /**
   * Handle refresh requests from websocket
   * messages received.
   */
  handle_refresh(message: Record<string, string>) {
    const state = message.state
    const module = message.module
    if (state === 'created') {
      this.remove_module(module)
    }
  }

  /**
   * Remove module by module service name.
   */
  remove_module(service: string) {

    // Retrieve module index.
    let service_index = -1
    this.all_modules.forEach((module, index) => {
      if (module.id === service) {
        service_index = index
      }
    })

    // Splice module from array.
    console.log(service_index)
    if (service_index !== -1) {
      this.all_modules.splice(service_index, 1)
    }

    // Update key
    this.available_key++
    this.installed_key++
  }

  /**
   * Retrieve modules for marketplace and also
   * installed modules list from docker.
   */
  load_modules() {

    // Set state of modules and loading state.
    this.loading = true

    // Retrieve marketplace modules.
    const request = Vue.axios.create()
    delete request.defaults.headers.common['x-access-token']
    const marketplace_url = 'https://artifactory.frcpnt.com/artifactory/dim-marketplace/modules.json'
    request.get(marketplace_url).then((response) => {
      this.all_modules = []
      response.data.modules.forEach(module => {
        if (module !== null) {
          const new_module = new CatalogModule(
            module.id,
            module.name,
            module.description,
            module.type,
            module.accepted_data_types,
            module.image_ref,
            module.icon_url,
            module.volumes,
            module.env_vars
          )
          this.all_modules.push(new_module)
        }
      })
      this.load_installed()
    })

  }

  /**
   * Retrieve list of installed modules from
   * internal /api/list endpoint.
   */
  load_installed() {
    const list_url = '/api/docker'
    Vue.axios.get(list_url).then((response) => {
      response.data.containers.forEach(module => {
        const installed_module = module.replace('/', '')
        this.installed_modules.push(installed_module)
      })
      this.set_active('Source Modules')
      this.loading = false
    })
  }

  /**
   * Filter modules based on whether they're installed
   * or not.
   */
  modules(installed: boolean) {
    let modules: CatalogModule[] = []
    if (installed) {
      modules = this.all_modules.filter((module) => {
        return this.installed_modules.includes(module.id)
      })
    } else {
      modules = this.all_modules.filter((module) => {
        return !this.installed_modules.includes(module.id)
      })
    }
    return modules
  }

  /**
   * Sets the current active tab for marketplace
   * modules.
   */
  set_active(active: string) {
    this.active = active
    this.available_key++
    this.installed_key++
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.market-menu {
  list-style: none;
}

.market-menu li {
  float: left;
  text-transform: uppercase;
  color: $menutext;
  box-sizing: border-box;
  padding: 1.15em;
  position: relative;
  top: -1.2em;
  cursor: pointer;
}

.panel-header.market {
  height: 3.5em;
}

.active {
  background: $menu;
}

.market-menu li:hover {
  background-color: $menu;
}

hr {
  border: none;
  border-bottom: 1px solid $secondary;
}

</style>
