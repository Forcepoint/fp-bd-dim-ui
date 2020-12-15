<template>
  <div class="options" v-if="Object.keys(intervals).length > 0">
    <span class="option-heading">
      REFRESH INTERVAL
    </span>
    <ul>
      <li v-for="(time, title) in intervals" class="option lowercase" :key="title" @click="set_refresh(title)" :class="{'selected': interval == title}">{{ title }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Refresh extends Vue {

  @Prop({ default: () => ({ '10s': 10000, '5m': 300000, '10m': 600000, '30m': 1800000 }) }) intervals!: { [interval: string]: number }
  @Prop({ default: '1m' }) selected!: string

  interval: string | undefined = this.selected

  /*
    * Set the interval for the currently displayed application.
    * @params {string} title - The selected interval.
    */
  set_refresh(title: string) {
    this.interval = title
    this.$emit('set_refresh', this.intervals[this.interval])
  }

}
</script>

<style lang="scss" scoped>

  @import '@/scss/variables.scss';

  .option-heading {
    float: left;
    color: $menutext;
    font-size: 0.9em;
    line-height: 1.25em;
    padding: 0 1em 0 0;
  }

  .options {
    float: left;
  }

  .options ul {
    text-decoration: none;
    list-style: none;
    float: left;
    position: relative;
  }

  .option {
    float: left;
    text-decoration: none;
    line-height: 1.25em;
    font-size: 0.9em;
    color: $menutext;
    padding: 0 1em 0 0;
  }

  .option:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .selected {
    text-decoration: underline;
  }

</style>
