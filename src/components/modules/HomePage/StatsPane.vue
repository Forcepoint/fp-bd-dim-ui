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
      <div class="flex-column">
        <div class="flex-row">
          <Stat
            :name="'Blocked IP Addresses'"
            :value="stats.num_blocked_ips"
            :loading="loading"
          />
          <Stat
            :name="'Blocked Domains'"
            :value="stats.num_blocked_domains"
            :loading="loading"
          />
          <Stat
            :name="'Blocked URLs'"
            :value="stats.num_blocked_urls"
            :loading="loading"
          />
        </div>
        <div class="flex-row">
          <Stat
            :name="'Blocked Ranges'"
            :value="stats.num_blocked_ranges"
            :loading="loading"
          />
          <Stat
            :name="'Blocked Snorts'"
            :value="stats.num_blocked_snorts"
            :loading="loading"
          />
        </div>
      </div>
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
      this.stats.set(response.data)
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

<style lang="scss" scoped>

  @import '@/scss/variables.scss';

  .flex-row {
    display: flex;
    gap: 0.5em;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
  }

</style>
