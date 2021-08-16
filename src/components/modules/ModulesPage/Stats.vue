<template>
  <div>
    <div class="module-stats">

      <!-- Blocked IP Addressed -->
      <Stat :name="'Blocked IPs'" :value="stats.num_blocked_ips" />

      <!-- Blocked Domains -->
      <Stat :name="'Blocked Domains'" :value="stats.num_blocked_domains" />

      <!-- Blocked URLs -->
      <Stat :name="'Blocked URLs'" :value="stats.num_blocked_urls" />

    </div>
    <div class="clear"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import { Statistics } from '@/components/dataclasses/Statistics'
import Stat from '@/components/modules/ModulesPage/Stat.vue'

@Component({
  components: {
    Stat
  }
})
export default class Stats extends Vue {

  @Prop(ConnectedModule) module!: ConnectedModule

  loading = false
  stats = new Statistics()
  icon_data = ''

  /**
   * Upon mounting retrieve statistics for module.
   */
  mounted() {
    this.retrieve_stats()
  }

  /**
   * Retrieve statistics for current module.
   */
  retrieve_stats() {
    this.loading = true

    const url = `/api/stats?servicename=${this.module.module_service_name}`
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving the modules statistics. Please try again later.' })
      }
    })
  }

}
</script>
