<template>
  <div id="main">
    <ElementsPane />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ElementsPane from '@/components/modules/ElementsPage/ElementsPane.vue'

@Component({
  components: {
    ElementsPane
  }
})
export default class Elements extends Vue {
}
</script>
