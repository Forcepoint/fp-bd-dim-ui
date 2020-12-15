<template>
  <div class="panel">
    <div class="panel-header">
      <h2>Logs</h2>
    </div>
    <div class="panel-content">
      <v-select label="service_name" v-model="selected_module" :options="modules" :getOptionLabel="option => option.module_display_name" class="log-select module-select"></v-select>
      <v-select label="log_level" v-model="selected_log_level" :options="log_levels" class="log-select level-select"></v-select>
      <div class="clear"></div>
      <br />
      <div class="log-content" v-if="logs.length > 0">
        <table class="logs">
          <tr>
            <th>Date/Time</th>
            <th>Module</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
          <tr class="log-message" v-for="(log, index) in logs" :key="index">
            <td class="log-date">{{ log.date }}<br />{{ log.time }}</td>
            <td class="log-module">{{ log.module_name }}</td>
            <td class="log-level" :class="{'error': log.log_level == 'error', 'warning': log.log_level == 'warning', 'fatal': log.log_level == 'fatal'}">{{ log.log_level }}</td>
            <td class="log-message">{{ log.message }}</td>
          </tr>
        </table>
        <paginate
        :page-count="pages"
        :container-class="'pagination'"
        :page-class="'page'"
        :click-handler="load_logs">
        </paginate>
        <div class="clear"></div>
      </div>
      <div class="panel-content" v-else-if="!loading && logs.length == 0">
        <div class="panel-empty">
          <h2>No logs found for selected module at selected level.</h2>
        </div>
      </div>
      <div class="clear" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Log } from '@/components/dataclasses/Log'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'

@Component
export default class LogPane extends Vue {

  // Values for dropdowns.
  modules: ConnectedModule[] = [new ConnectedModule('All Modules', '', '', '', '', '', true, true, 1, '')]
  log_levels = ['Info', 'Debug', 'Warning', 'Error', 'Fatal']

  // Selected Values.
  pages = 0
  selected_page = 1
  selected_module = this.modules[0]
  selected_log_level = this.log_levels[0]

  // Display Values
  logs: Log[] = []
  loading = true

  /**
   * Upon mounting, load modules list.
   */
  mounted() {
    this.load_modules()
    this.load_logs(this.selected_page)
  }

  /**
   * Retrieve list of modules for display in dropdown.
   */
  load_modules() {
    const url = '/api/modules'
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
        this.$EventBus.$emit('alert', { type: 3, value: 'An error occured retrieving the logs. Please try again later.' })
      }
    })
  }

  /**
   * Upon either the module or log level
   * value being updated, send a new request
   * for the logs.
   */
  @Watch('selected_module')
  @Watch('selected_log_level')
  update_logs() {
    this.load_logs()
  }

  /**
   * Retrieve logs for module.
   */
  load_logs(page = 1) {

    this.loading = true

    // Empty logs and set loading status
    this.logs.length = 0
    this.selected_page = page

    // Build URL for loading logs
    let url = ''
    if (this.selected_module.module_display_name === 'All Modules') {
      url = `/api/logs?level=${this.selected_log_level}&page=${page}`
    } else {
      url = `/api/logs?modulename=${this.selected_module.module_service_name}&level=${this.selected_log_level}&page=${page}`
    }

    // Retrieve logs
    Vue.axios.get(url).then((response) => {
      if (response.data == null) {
        return
      }
      const data = response.data
      this.pages = response.data.total_page_count
      data.events.forEach(entry => {
        const log = new Log(entry.module_name, entry.message, entry.time, entry.level)
        this.logs.push(log)
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
      }
    })

  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.logs {
  display: table;
}

.log-select {
  width: calc(50% - 0.25em);
  float: left;
  background-color: $secondary;
}

.log-select:nth-child(odd) {
  margin: 0 0.5em 0 0;
}

.log-level {
  text-transform: capitalize;
}

.log-datetime {
  text-align: center;
}

.error {
  color: #ff3b3b;
}

.warn {
  color: #ffd632;
}

.fatal {
  color: darkred;
}
</style>
