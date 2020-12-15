<template>
  <div class="chart">
    <apexchart width="100%" type="donut" :options="chartOptions" :series="chartSeries"></apexchart>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Chart extends Vue {
  @Prop({ type: Array, default: [0, 0, 0], required: true }) chartSeries!: number[]

  // Chart Configuration
  chartOptions = {
    labels: ['Healthy', 'Unhealthy', 'Down'],
    colors: ['#A2CAB7', '#f7d660', '#f76060'],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true
            }
          }
        }
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex]
      }
    }
  }

}
</script>

<style lang="scss" scoped>

@import '@/scss/variables.scss';

.chart {
  width: 50%;
  float: left;
  border-right: 1px solid $secondary;
}

</style>
