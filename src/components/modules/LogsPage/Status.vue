<template>
  <div class="status-card" :class="{red: status_type == 'failed', amber: status_type == 'pending'}">

    <!-- Batch Status Title -->
    <div class="batch-status-title" @click="open = !open">
      <div>{{ status_type }} ({{ statuses.length }})</div>
      <font-awesome-icon icon="caret-left" class="batch-status-icon" :class="{'open': open}"></font-awesome-icon>
    </div>

    <!-- Batch Status Details -->
    <div class="batch-status-content" v-if="open">

      <!-- Shown if statuses -->
      <div v-if="statuses.length > 0">
        Elements are sent to the export modules in the form of batches. The following batches are currently in the {{ status_type }} state:
        <table>
          <Batch v-for="(batch, index) in statuses" :key="index" :batch="batch" :module="modules[batch.service_name]" />
        </table>
        <paginate
        v-model="selected_page"
        :next-class="'next'"
        :prev-class="'prev'"
        :page-count="page_count"
        :container-class="'pagination'"
        :page-class="'page'"
        :click-handler="retrieve_statuses"
        v-if="page_count > 1">
        </paginate>
        <div class="clear" />
      </div>

      <!-- Shown if statuses is empty -->
      <div v-else>
        Elements are sent to the export modules in the form of batches. There are no batches in the {{ status_type }} state.
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Batch as BatchData } from '@/components/dataclasses/Batch'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'
import Batch from '@/components/modules/LogsPage/Batch.vue'

@Component({
  components: {
    Batch
  }
})
export default class Status extends Vue {
  @Prop(String) status_type!: string

  modules = {}
  open = false
  statuses: BatchData[] = []
  selected_page = 1
  page_count = 0

  /**
   * Run upon mounting.
   * Methods called:
   *  - retrieve_data()
   */
  mounted() {
    this.retrieve_data()
  }

  /**
   * Retrieve the list of ingress modules,
   * and then the currently pending and failed
   * batches of elements for display.
   */
  retrieve_data() {

    // Send request to retrieve modules.
    const url = '/api/modules?moduleType=egress'
    Vue.axios.get(url).then(response => {
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
        this.modules[module.module_service_name] = new_module
      })
      // Once modules have been retrieved, retrieve statuses.
      this.retrieve_statuses(1)
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
        this.$EventBus.$emit('alert', { type: 3, value: 'An error occured retrieving the pending and failed batches. Please try again later.' })
      }
    })

  }

  /**
   * Retrieve the list of currently pending
   * and failed element batches.
   */
  retrieve_statuses(page: number) {

    this.selected_page = page
    this.statuses = []

    // Send request to retrieve batch statuses
    const url = `/api/batch?status=${this.status_type}&page=${this.selected_page}`
    Vue.axios.get(url).then(response => {
      if (response.data == null) {
        return
      }
      response.data.items.forEach(element => {
        const batch = new BatchData(
          element.ID,
          element.CreatedAt,
          element.UpdatedAt,
          element.DeletedAt,
          element.service_name,
          element.status,
          element.update_batch_id,
          element.module_metedata_id
        )
        this.statuses.push(batch)
      })
      this.page_count = response.data.total_page_count
    }).catch((error) => {
      console.log(error.response)
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
        this.$EventBus.$emit('alert', { type: 3, value: 'There was an error retrieving the batch statuses. Please try again later.' })
      }
    })

  }
}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.batch-status-icon {
  float: right;
  position: relative;
  font-size: 1.5em;
  top: -0.9em;
}

.batch-status-title {
  box-sizing: border-box;
  padding: 1.5em;
  text-transform: uppercase;
  font-weight: bold;
  color: $main;
  cursor: pointer;
}

.batch-status-content {
  box-sizing: border-box;
  padding: 1.5em;
  color: #000000;
}

table {
  border: 0;
  margin: 1em 0 0 0;
  display: table;
}

tr {
  background: none;
}

tr:nth-child(odd) {
  background: $red3;
}

.amber tr {
  background-color: $amber2;
}

.amber tr:nth-child(odd) {
  background-color: $amber3;
}

.open {
  transform: rotate(-90deg);
}

.red {
  background-color: $red2;
}

.red .batch-status-title {
  background-color: $red3;
}

.red .batch-status-icon {
  color: $red !important;
}

.amber {
  background-color: $amber2;
}

.amber .batch-status-title {
  background-color: $amber3;
}

.amber .batch-status-icon {
  color: $amber !important;
}

.amber .active {
  background-color: $amber2 !important;
}

.page {
  padding: 0 !important;
}

</style>
