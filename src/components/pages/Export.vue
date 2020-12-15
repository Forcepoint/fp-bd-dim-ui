<template>
  <div id="main">
    <div class="row">
      <ModulePane :module_type="'egress'" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ModulePane from '@/components/modules/ModulesPage/ModulePane.vue'

@Component({
  components: {
    ModulePane
  }
})
export default class Export extends Vue {

  // Store key for panel refresh.
  key = 0

  /**
   * Register refresh_modules event to
   * trigger modules pane reload upon
   * request.
   */
  mounted() {
    this.$EventBus.$on('refresh_modules', () => { this.key += 1 })
  }

}
</script>
