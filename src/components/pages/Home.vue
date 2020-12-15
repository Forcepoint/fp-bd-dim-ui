<template>
  <div id="main">
    <div class="row">
      <StatsPane />
    </div>
    <div class="row">
      <HealthPane />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HealthPane from '@/components/modules/HomePage/HealthPane.vue'
import StatsPane from '@/components/modules/HomePage/StatsPane.vue'

@Component({
  components: {
    StatsPane,
    HealthPane
  }
})
export default class Home extends Vue {
}
</script>
