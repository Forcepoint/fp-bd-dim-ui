<template>
  <div class="stat">
    <p class="value">{{ abbreviate_number(value) }}</p>
    <p class="title">{{ name }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Stat extends Vue {
  @Prop(String) name: string | undefined
  @Prop(Number) value: number | undefined

  /**
   * Abbreviate numbers for display on
   * Statistics Panel.
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

.stat {
  width: 33%;
  float: left;
  text-align: center;
}

.value {
  width: 100%;
  float: left;
}

.title {
  width: 100%;
  float: left;
  font-size: 0.8em;
}

</style>
