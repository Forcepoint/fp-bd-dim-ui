<template>
  <div class="statistic-pane">
    <div class="panel-content" v-if="loading">
      <font-awesome-icon icon="spinner" spin></font-awesome-icon>
    </div>
    <div class="panel-content" v-else>
      <p class="stat-value">{{ abbreviate_number(value) }}</p>
      <p class="stat-title">{{ name }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Stat extends Vue {
  @Prop(String) name: string | undefined
  @Prop(Number) value: number | undefined
  @Prop(Boolean) loading: boolean | undefined

  /**
   * Abbreviate numbers.
   */
  abbreviate_number(num: number) {
    // @ts-ignore-next-line
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, notation: 'compact', compactDisplay: 'short' }).format(num)
  }
}
</script>

<style lang="scss" scoped>

  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
  @import '@/scss/variables.scss';

  .statistic-pane {
    display: block;
    width: 100%;
    flex: 1;
    float: left;
    box-sizing: border-box;
    padding: 1em 0;
    text-align: center;
    border-radius: 2px;
    background-color: $secondary;
  }

  .stat-value {
    color: $green4;
    font-size: 2.25em;
    font-weight: 300;
    font-family: 'Roboto', sans-serif;
  }

  .stat-title {
    color: $main;
    text-transform: uppercase;
  }

</style>
