<template>
  <div class="panel">

    <!-- Panel Header -->
    <div class="panel-header elements">
      <ul class="elements-menu">
        <li :class="{active: active == 'Safelist'}" @click="set_active('Safelist')">Safelist</li>
        <li :class="{active: active == 'Blocklist'}" @click="set_active('Blocklist')">Blocklist</li>
      </ul>
      <span class="add-element" @click="add_active = !add_active">
        Add Element
        <font-awesome-icon icon="plus-circle" class="add-element-icon"></font-awesome-icon>
      </span>
    </div>

    <!-- Panel Content -->
    <div class="panel-content">
      <div class="elements-controls">
        <input type="text" placeholder="Type to search..." v-model="search_term" />
      </div>

      <!-- Display Alerts for Elements -->
      <Alert :alert_title="'alert_element'" />

      <!-- Add Element Panel -->
      <Add :key="add" :list="active" :active="add_active" />

      <!-- Results -->
      <Results :search_term="search_term" :type="active" :module="selected_module.module_service_name" :key="key" />

    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import Add from '@/components/modules/ElementsPage/Add.vue'
import Alert from '@/components/modules/Global/Alert.vue'
import Results from '@/components/modules/ElementsPage/Results.vue'

@Component({
  components: {
    Alert,
    Add,
    Results
  }
})
export default class ElementsPane extends Vue {

  // Search term and active panel.
  search_term = ''
  active = 'Safelist'
  add_active = false

  // Modules
  modules: ConnectedModule[] = [new ConnectedModule('All Modules', '', '', '', '', '', true, true, 1, '')]
  selected_module = this.modules[0]

  // Keys used for Panel Reloading
  key = 0
  add = 1000

  /**
   * Upon mounting load required data.
   */
  mounted() {
    this.retrieve_modules()
  }

  /**
   * To force a re-render of the panel, increment the key.
   * Feels hacky, but it works.
   */
  @Watch('selected_module')
  @Watch('search_term')
  @Debounce(200)
  render_panel() {
    this.key += 1
  }

  /**
   * Set active panel using either
   * 'Blocklist' or 'Safelist' as
   * the value for pane.
   */
  set_active(pane: string) {
    this.active = pane
    this.key += 1
    this.add += 1
  }

  /**
   * Retrieve list of modules for display in
   * dropdown.
   */
  retrieve_modules() {

    // Send GET request to endpoint for modules.
    const url = '/api/modules?moduleType=ingress'
    Vue.axios.get(url).then((response) => {
      if (response.data == null) {
        return
      }
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
        this.modules.push(new_module)
      })
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving the modules for the dropdown. Please try again later.' })
      }
    })
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

input {
  background-color: $secondary;
  border: none;
  padding: 1.15em;
  margin: 0 0 1.5em 0;
  width: 20em;
}

input:hover {
  background-color: $quatenary;
}

.add-element {
  float: right;
  color: $menutext;
  cursor: pointer;
  box-sizing: border-box;
  text-transform: uppercase;
}

.add-element-icon {
  float: right;
  color: $menutext;
  cursor: pointer;
  box-sizing: border-box;
  margin: -0.05em 0.65em 0 0.5em;
  font-size: 1.2em;
}

.module-select {
  width: 20em;
  float: right;
  background: $secondary;
}

.add-element:hover {
  color: #000000;
}

.panel {
  margin: 0 0 1.5em 0;
}

.elements-menu {
  list-style: none;
}

.elements-menu li {
  float: left;
  text-transform: uppercase;
  color: $menutext;
  box-sizing: border-box;
  padding: 1.15em;
  position: relative;
  top: -1.2em;
  cursor: pointer;
}

.panel-header.elements {
  height: 3.5em;
}

.active {
  background: $menu;
}

.elements-menu li:hover {
  background-color: $menu;
}

</style>
