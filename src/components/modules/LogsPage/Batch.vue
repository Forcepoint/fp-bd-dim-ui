<template>
  <tr>
    <td>Batch ID: {{ batch.update_batch_id }}</td>
    <td>Module: {{ module.module_display_name }}</td>
  </tr>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Batch as BatchData } from '@/components/dataclasses/Batch'
import { ConnectedModule } from '@/components/dataclasses/ConnectedModule'

@Component
export default class Batch extends Vue {
  @Prop(Batch) batch!: BatchData
  @Prop(ConnectedModule) module!: ConnectedModule
}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.batch-status {
  text-transform: capitalize;
}

</style>
