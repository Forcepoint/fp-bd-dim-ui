<template>
  <div class="panel">

    <!-- Panel Header -->
    <div class="panel-header">
      <h2>Intelligence</h2>
    </div>

    <!-- Panel Loading -->
    <div class="panel-loading" v-if="loading">
      <font-awesome-icon icon="spinner" spin></font-awesome-icon>
    </div>

    <!-- Panel Content -->
    <div class="panel-content">
      <Stat
        :name="'Blocked IP Addresses'"
        :value="stats.num_blocked_ips"
        :loading="loading"
        class="left-pane"
      />
      <Stat
        :name="'Blocked Domains'"
        :value="stats.num_blocked_domains"
        :loading="loading"
        class="middle-pane"
      />
      <Stat
        :name="'Blocked URLs'"
        :value="stats.num_blocked_urls"
        :loading="loading"
        class="right-pane"
      />
      <div class="clear"></div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Statistics } from '@/components/dataclasses/Statistics'
import Stat from '@/components/modules/HomePage/Stat.vue'

@Component({
  components: {
    Stat
  }
})
export default class StatsPane extends Vue {

  // Data
  loading = true
  stats = new Statistics()

  /**
   * Upon mounting retrieve stats.
   */
  mounted () {
    this.retrieve_statistics()
  }

  /**
   * Retrieve DIM statistics. Sends
   * GET request to the '/api/stats'
   * endpoint and stores the response.
   */
  retrieve_statistics() {

    this.loading = true

    // Retrieve statistics
    const url = '/api/stats'
    Vue.axios.get(url).then((response) => {
      this.stats.set(
        response.data.num_sources,
        response.data.num_blocked_ips,
        response.data.num_blocked_domains,
        response.data.num_blocked_urls,
        response.data.last_update
      )
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving the statistics for the homepage.' })
      }
    })

  }

}
</script>
