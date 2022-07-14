<template>
  <div ref="container"></div>
</template>

<script>
import * as echarts from 'echarts/core'

export default {
  name: 'Chart',

  props: {
    options: Object
  },

  mounted () {
    this.init()
  },

  data () {
    return {
      chart: null
    }
  },

  methods: {
    init () {
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.container)
      }

      this.chart.setOption(this.options)
    }
  },

  watch: {
    options: {
      deep: true,
      handler () {
        this.init()
      }
    }
  }
}
</script>

<style>
  
</style>