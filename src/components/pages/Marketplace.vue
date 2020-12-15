<template>
  <div id="main">
    <div class="row">
      <ModulesPane />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ModulesPane from '@/components/modules/MarketplacePage/ModulesPane.vue'

@Component({
  components: {
    ModulesPane
  }
})
export default class Login extends Vue {}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

</style>
