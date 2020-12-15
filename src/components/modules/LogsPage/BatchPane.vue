<template>
  <div class="panel">

    <!-- Panel Header -->
    <div class="panel-header">
      <h2>Batch Status</h2>
    </div>

    <!-- Panel Content -->
    <div class="panel-content">

      <!-- Pending - Shown for pending batches -->
      <Status :status_type="'pending'" />

      <!-- Failed - Shown for failed batches. -->
      <Status :status_type="'failed'" />

      <div class="clear"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Status from '@/components/modules/LogsPage/Status.vue'

@Component({
  components: {
    Status
  }
})
export default class BatchPane extends Vue {
}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.status-card {
  width: calc(50% - 0.5em);
  float: left;
  margin: 0 1em 0 0;
}

.status-card:nth-child(even) {
  float: left;
  margin: 0 0 0 0 !important;
}

.status-icon {
  float: right;
  position: relative;
  font-size: 1.5em;
  top: -0.9em;
}

.status-title {
  box-sizing: border-box;
  padding: 1.5em;
  text-transform: uppercase;
  font-weight: bold;
  color: $main;
}

.status-content {
  box-sizing: border-box;
  padding: 1.5em;
  color: #000000;
}

tr {
  background: none;
}

</style>
