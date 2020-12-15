<template>
  <div id="main">
    <div class="row">
      <BatchPane />
    </div>
    <div class="row">
      <LogPane />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BatchPane from '@/components/modules/LogsPage/BatchPane.vue'
import LogPane from '@/components/modules/LogsPage/LogPane.vue'

@Component({
  components: {
    BatchPane,
    LogPane
  }
})
export default class Logs extends Vue {
}
</script>
