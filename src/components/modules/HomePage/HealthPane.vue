<template>
  <div class="panel">

    <!-- Panel Header -->
    <div class="panel-header">
      <h2>Module Health</h2>
      <div class="panel-control">
        <Refresh :selected="selected" @set_refresh="set_refresh"></Refresh>
        <font-awesome-icon icon="sync" class="control-icon" @click="retrieve_modules"></font-awesome-icon>
      </div>
    </div>

    <!-- Panel Loading -->
    <div class="panel-loading" v-if="loading">
      <font-awesome-icon icon="spinner" spin></font-awesome-icon>
    </div>

    <!-- Panel Content -->
    <div class="panel-content" v-if="modules_added">

      <!-- Chart for displaying module health -->
      <Chart :chartSeries="[healthy.length, unhealthy.length, down.length]" />

      <div class="statuses">

        <!-- Unhealthy - Shown if modules not updating -->
        <Status :status_type="'unhealthy'" :modules="unhealthy" v-if="unhealthy.length > 0" />

        <!-- Down - Shown if modules are down -->
        <Status :status_type="'down'" :modules="down" v-if="down.length > 0" />

        <!-- Healthy - Shown if modules are healthy -->
        <Status :status_type="'healthy'" :modules="healthy" :all_healthy="unhealthy.length == 0 && down.length == 0" v-if="healthy.length > 0" />

      </div>
      <div class="clear"></div>
    </div>

    <!-- Panel Content - Empty -->
    <div class="panel-content" v-else-if="!loading && !modules_added">
      <div class="panel-empty">
        <h2>No modules have been added.</h2>
        <p>Please install a module from the Dynamic Intelligence Manager marketplace.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import Chart from '@/components/modules/HomePage/Chart.vue'
import Refresh from '@/components/modules/Global/Refresh.vue'
import Status from '@/components/modules/HomePage/Status.vue'

@Component({
  components: {
    Chart,
    Refresh,
    Status
  }
})
export default class HealthPane extends Vue {

  loading = true

  // Set Refresh Options
  set_interval = window.setInterval(this.retrieve_modules, 86400000)
  selected = ''

  // Store Modules
  healthy: ConnectedModule[] = []
  unhealthy: ConnectedModule[] = []
  down: ConnectedModule[] = []

  modules_added = false

  /**
   * Upon mounting send request for module statuses.
   */
  mounted() {
    this.retrieve_modules()
  }

  /**
   * Retrieve module statuses. Sends
   * GET request to the '/api/modules'
   * endpoint and stores the response.
   */
  retrieve_modules() {

    this.loading = true

    // Clear values in statuses.
    this.healthy = []
    this.unhealthy = []
    this.down = []

    // Retrieve health statuses
    const url = '/api/modules'
    Vue.axios.get(url).then((response) => {
      if (response.data == null) {
        this.modules_added = false
        this.loading = false
        return
      } else {
        this.modules_added = true
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
        if (new_module.status === 1) {
          this.healthy.push(new_module)
        } else if (new_module.status === 0) {
          this.unhealthy.push(new_module)
        } else {
          this.down.push(new_module)
        }
      })
      this.loading = false
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error loading the module health. Please try again later.' })
      }
    })

  }

  /**
   * Upon auto refresh interval being set
   * clear preset interval and start new
   * refresh interval.
   */
  set_refresh(interval: number) {
    window.clearInterval(this.set_interval)
    this.set_interval = window.setInterval(this.retrieve_modules, interval)
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.statuses {
  width: calc(50% - 2px);
  box-sizing: border-box;
  padding: 0 0 0 1.5em;
  float: right;
}

</style>
