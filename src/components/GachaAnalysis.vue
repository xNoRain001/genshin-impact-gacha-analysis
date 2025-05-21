<template>
  <div class="p-5">
    <q-linear-progress
      indeterminate  
      size="md"
      style="display: none"
      class="mb-5"
      ref="progressBar"
    />
    <div>
      <div class="w-5/12">
        <q-uploader
          class="w-full"
          hide-upload-btn
          max-files="1"
          :max-file-size="2 * 1024 * 1024"
          :max-total-size="2 * 1024 * 1024"
          accept="txt"
          @rejected="filedToValidation"
          @added="addedFile"
          label="上传 output_log.txt"
        />
        <div class="mt-5 flex justify-between items-center">
          <q-select
            filled
            v-model="selectedGachaType"
            :options="gachaTypeOptions"
            style="min-width: 150px;"
            label="抽卡类型"
          />
          <q-btn
            @click="startUploadFile"
            color="primary"
            label="开始抽卡分析"
          />
        </div>
      </div>
    </div>
    <div
      v-if="isShowTable"
      class="mt-5"
    >
      <q-table
        :rows="gachaTable.rows"
        :columns="gachaTable.columns"
        title="抽卡记录"
      >
        <template v-slot:top-right>
          <q-select
            filled
            v-model="selectedTimeMode"
            :options="timeModeOptions"
            class="mr-5"
            style="min-width: 150px;"
            label="时间"
          />
          <q-select
            filled
            v-model="selectedRankType"
            :options="rankTypeOptions"
            class="mr-5"
            style="min-width: 150px;"
            label="星级"
          />
          <q-input
            filled
            v-model="keyword"
            placeholder="搜索"
          >
            <template v-slot:append>
              <q-icon v-if="keyword === ''" name="search" />
              <q-icon v-else @click="clearKeyword" class="cursor-pointer" name="close" />
            </template>
          </q-input>
        </template>
        
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 18px;"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        
        <template v-slot:body="props">
          <q-tr
            :props="props"
            style="font-size: 16px !important;"
          >
            <q-td key="itemType" :props="props">
              {{ props.row.itemType }}
            </q-td>
            <q-td
              key="name"
              :props="props" 
              class="text-bold"
              :class="props.row.rankType === '3' 
                ? 'rank-type-3' 
                : props.row.rankType === '4'
                  ? 'rank-type-4'
                  : 'rank-type-5'
              "
            >
              {{ props.row.name }}
            </q-td>
            <q-td key="gachaType" :props="props">
              {{ props.row.gachaType }}
            </q-td>
            <q-td key="time" :props="props">
              {{ props.row.time }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div
      v-if="isShowBarChart"
      class="mt-5 p-3"
      style="box-shadow: 0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%);"
    >
      <div class="flex items-center justify-evenly text-base">
        <q-select
          filled
          v-model="selectedBarChartSort"
          :options="barChartSortOptions"
          class="w-1/12"
          style="min-width: 150px;"
          label="排序"
        />
        <q-separator vertical inset />
        <div>总：{{ totalCost }}</div>
        <q-separator vertical inset />
        <div>出金：{{ formattedFiveStartItems.length }} 个</div>
        <q-separator vertical inset />
        <div>平均：{{ averageCost }}</div>
        <q-separator vertical inset />
        <div>最欧：{{ leastCost }}</div>
        <q-separator vertical inset />
        <div>最非：{{ mostCost }}</div>
        <q-separator v-if="gachaType !== '200'" vertical inset />
        <div v-if="gachaType !== '200'">歪率：{{ missingRate }}</div>
      </div>
      <div class="flex">
        <Chart
          :class="isShowPieChart ? 'w-1/2' : 'w-full'"
          style="height: 400px;"
          :options="barChartOptions"
          />
        <Chart
          v-if="isShowPieChart"
          class="w-1/2"
          style="height: 400px;"
          :options="pieChartOptions"
        />
      </div>
    </div>
  </div>      
</template>

<script>
import request from '../request/index'
import Chart from './Chart.vue'
import { suc, fail } from '../utils'

export default {
  name: 'GachaAnalysis',

  components: {
    Chart
  },

  data () {
    return {
      logFile: null, // log.txt
      gachaRecords: [],
      gachaTable: {
        sourceRows: [],
        rows: [],
        columns: [
          { 
            name: 'itemType', 
            label: '类型', 
            field: 'itemType', 
            align: 'center' 
          },
          { 
            name: 'name', 
            label: '名称', 
            field: 'name', 
            align: 'center' 
          },
          { 
            name: 'gachaType', 
            label: '祈愿类型', 
            field: 'gachaType', 
            align: 'center' 
          },
          { 
            name: 'time', 
            label: '祈愿时间', 
            field: 'time', 
            align: 'center' 
          }
        ]
      },
      selectedGachaType: '角色活动祈愿',
      gachaTypeOptions: ['角色活动祈愿', '武器活动祈愿', '常驻祈愿'],
      gachaType: '301',
      gachaTypeMap: {
        '角色活动祈愿': '301',
        '武器活动祈愿': '302',
        '常驻祈愿': '200'
      },
      fiveStarItems: [],
      formattedFiveStartItems: [],
      fiveStarItemsOfResident: ['迪卢克', '刻晴', '琴', '七七', '莫娜'],
      averageCost: null,
      selectedRankType: '四星和五星',
      rankTypeOptions: ['四星和五星', '四星', '五星'],
      rankTypeMap: {
        '四星': '4',
        '五星': '5'
      },
      keyword: '',
      missingRate: null,
      mostCost: null,
      leastCost: null,
      totalCost: null,
      missingCount: null,
      barChartOptions: {
        // grid: {
        //   left: '10%',
        //   right: '5%'
        // },
        dataZoom: {
          // start: 10,
          type: 'inside'
        },
        xAxis: {
          data: [],
          axisLabel: {
            color: 'black',
            fontSize: 16
          },
          axisTick: {
            alignWithLabel: true
          },
        },
        yAxis: {
          min: 0,
          max: 90,
          splitNumber: 9,
          axisLabel: {
            color: 'black',
            fontSize: 16
          },
          splitLine: {
            show: false
          }
        },
        series: {
          type: 'bar',
          data: [],
          label: {
            show: true
          },
          barWidth: 40,
        }
      },
      pieChartOptions: {
        // grid: {
        //   left: '0%',
        //   right: '5%'
        // },
        legend: {
          orient: "vertical",
          left: "10%",
          top: "10%",
          data: ["常驻", "UP"]
        },
        series: [
          {
            type: "pie",
            data: [],
            label: {
              formatter: '{b}: {d}%'
            }
          }
        ]
      },
      selectedTimeMode: '由近至远',
      timeModeOptions: ['由近至远', '由远至近'],
      barChartSortOptions: [
        '抽数从少到多', '抽数从多到少', '时间由近至远', '时间由远至近'
      ],
      selectedBarChartSort: '时间由近至远',
      isShowTable: false,
      isShowBarChart: false,
      isShowPieChart: false
    }
  },

  methods: {
    clearKeyword () {
      this.keyword = ''
    },

    // 选取文件后被拒绝的回调
    filedToValidation () {
      fail('上传文件格式错误')
    },

    // 成功添加文件的回调
    addedFile (files) {
      this.logFile = files[0]
    },

    // 上传文件获取必须参数
    async startUploadFile () {

      // 确保存在 log.txt
      if (this.logFile === null) {
        fail('请上传文件')
        return
      }

      // 清除之前的相关数据
      this.resetData()

      const formData = new FormData

      formData.append('file', this.logFile)
      formData.append('filename', 'logFile')

      try {

        // 上传文件，服务器分析出调用后续 API 的必须参数
        const { 
          status, 
          message, 
          data: params 
        } = await request.post('/upload-log-file', formData)

        if (status === 200) {
          this.getGachaRecords(params)
        } else {
          throw new Error(message)
        }
      } catch (error) {
        fail(error.message)
      }
    },

    // 开启进度条
    openProgressBar () {
      this.$refs.progressBar.$el.style.display = 'block'
    },

    // 关闭进度条
    closeProgressBar () {
      this.$refs.progressBar.$el.style.display = 'none'
    },

    // 获取抽卡记录
    async getGachaRecords (params) {
      const closeNotify = suc('正在获取抽卡记录')
      
      try {
        this.openProgressBar()
        
        // 用户选择的卡池类型
        params.gacha_type = this.gachaType

        // 获取抽卡记录
        // const data = await request.get('/get-all-gacha-records', {
        //     params
        //   }
        // )

        // const { status, message } = data

        // if (status !== 200) {
        //   throw new Error(message)
        // }

        // const { data: gachaRecords } = data

        const gachaRecords = JSON.parse(localStorage.getItem(this.gachaType))

        // 保存抽卡记录
        this.gachaRecords = gachaRecords

        closeNotify()
        this.closeProgressBar()
        suc('成功获取抽卡记录')
      } catch (error) {
        closeNotify()
        this.closeProgressBar()
        fail(error.message)
      }
    },

    // 清除文件
    clearFile () {
      this.logFile = null
      const uploader = document.querySelector('.q-uploader')
      const clearBtn = uploader.querySelector('i')
      clearBtn.click()
    },

    // 绘制柱状图
    drawBarChart () {
      const names = this.formattedFiveStartItems.map(item => {
        return item.name
      })
      const cost = this.formattedFiveStartItems.map(item => {
        return item.cost
      })
      this.barChartOptions.xAxis.data = names
      this.barChartOptions.series.data = cost
    },

    // 生成表格数据
    createGachaTableRows () {
      const { gachaRecords } = this

      for (let i = gachaRecords.length - 1; i >= 0; i--) {
        const record = gachaRecords[i]

        // 去除三星武器
        if (record.rank_type === '3') {
          continue
        }

        const {
          item_type: itemType, 
          name, 
          rank_type: rankType,
          time 
        } = record
        const gachaType = this.selectedGachaType
        const formattedRecord = {
          itemType,
          name,
          gachaType,
          rankType,
          time
        }

        this.gachaTable.rows.unshift(formattedRecord)
      }

      // 拷贝一份，用于后续搜索
      this.gachaTable.sourceRows = this.gachaTable.rows
    },

    // 获取五星道具所用抽数
    getFiveStartItems () {
      let count = 0
      const { gachaRecords } = this

      for (let i = gachaRecords.length - 1; i >= 0; i--) {
        count++
        
        const record = gachaRecords[i]
        const {
          item_type: itemType,
          name, 
          rank_type: rankType,
          time 
        } = record
        const fiveStartItem = {
          itemType,
          name,
          rankType,
          time
        }

        if (rankType === '5') {

          // 判断是否是常驻
          fiveStartItem.isResident = this.fiveStarItemsOfResident.includes(name)
          fiveStartItem.cost = count
          this.fiveStarItems.unshift(fiveStartItem)
          count = 0
        }
      }
    },

    // 可能需要去除最后一金
    getformattedFiveStartItems () {
      let { fiveStarItems } = this

      // 除非最后一金用了 90 抽，否则去除掉，保证结果准确性。
      if (fiveStarItems[fiveStarItems.length - 1].count === 90) {
        this.formattedFiveStartItems = fiveStarItems.slice()
      } else {
        this.formattedFiveStartItems = fiveStarItems.slice(0, -1)
      }
    },
    
    // 计算五星道具平均所用抽数
    computeAverageCost () {
      const { formattedFiveStartItems } = this
      const total = formattedFiveStartItems.reduce((acc, cur) => {
        return acc + cur.cost
      }, 0)

      this.averageCost = `${ (total / formattedFiveStartItems.length).toFixed(2) } 抽`
      
    },

    // 计算歪率
    computeMissingRate () {
      const { missingCount, formattedFiveStartItems } = this

      this.missingRate = `
        ${ (missingCount / formattedFiveStartItems.length).toFixed(2) }%
      `
    },

    // 计算总抽数
    computeTotalCost () {
      const { formattedFiveStartItems } = this
      const totalCost = formattedFiveStartItems.reduce((acc, cur) => {
        return acc + cur.cost
      }, 0)

      this.totalCost = `${ totalCost } 抽`
    },

    // 计算最欧
    computeMostCost () {
      const { formattedFiveStartItems } = this
      const clonedFormattedFiveStartItems = formattedFiveStartItems.slice()
      formattedFiveStartItems.sort((a, b) => a.cost - b.cost)
      this.leastCost = `
        ${ formattedFiveStartItems[0].name } ${ formattedFiveStartItems[0].cost } 抽
      ` 

      // 还原回最开始的顺序
      this.formattedFiveStartItems = clonedFormattedFiveStartItems
    },

    // 计算最非
    computeLeastCost () {
      const { formattedFiveStartItems } = this
      const clonedFormattedFiveStartItems = this.formattedFiveStartItems.slice()
      formattedFiveStartItems.sort((a, b) => b.cost - a.cost)
      this.mostCost = `
        ${ formattedFiveStartItems[0].name } ${ formattedFiveStartItems[0].cost } 抽
      ` 
      this.formattedFiveStartItems = clonedFormattedFiveStartItems
    },

    // 计算歪的个数
    computeMissingCount () {
      const { formattedFiveStartItems } = this
      let missingCount = 0

      for (let i = 0, l = formattedFiveStartItems.length; i < l; i++) {
        if (formattedFiveStartItems[i].isResident) {
          missingCount++
        }
      }

      this.missingCount = missingCount
    },

    // 重置有关数据
    resetData () {
      this.selectedTimeMode = '由近至远'
      this.selectedRankType = '四星和五星'
      this.keyword = ''
      this.gachaRecords = []
      this.gachaTable.sourceRows = []
      this.gachaTable.rows = []
      this.fiveStarItems = []
      this.formattedFiveStartItems = []
      this.totalCost = null
      this.averageCost = null
      this.mostCost = null
      this.leastCost = null
      this.missingCount = null
      this.missingRate = null

      this.isShowTable = false
      this.isShowBarChart = false
      this.isShowPieChart = false

      this.barChartOptions.xAxis.data = []
      this.barChartOptions.series.data = []

      this.pieChartOptions.series[0].data = []
    },

    // 重置表格数据
    resetGachaTableData () {

    },

    drawPieChart () {
      this.pieChartOptions.series[0].data.push(
        {
          name: '常驻',
          value: this.missingCount
        },
        {
          name: 'UP',
          value: this.formattedFiveStartItems.length - this.missingCount
        }
      )
    }
  },

  watch: {
    selectedBarChartSort (newVal) {
      const { formattedFiveStartItems } = this

      if (newVal === '抽数从少到多') {
        formattedFiveStartItems.sort((a, b) => {
          return a.cost - b.cost
        })
      }
      else if (newVal === '抽数从多到少') {
        formattedFiveStartItems.sort((a, b) => {
          return b.cost - a.cost
        })
      }
      else if (newVal === '时间由近至远') {
        formattedFiveStartItems.sort((a, b) => {
          return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
        })
      } else {
        formattedFiveStartItems.sort((a, b) => {
          return (new Date(a.time)).getTime() - (new Date(b.time)).getTime()
        })
      }

      const names = formattedFiveStartItems.map(item => {
        return item.name
      })
      const cost = formattedFiveStartItems.map(item => {
        return item.cost
      })
      this.barChartOptions.xAxis.data = names
      this.barChartOptions.series.data = cost
    },

    selectedTimeMode (newVal) {
      if (newVal === '由远至近') {
        this.gachaTable.rows.sort((a, b) => {
          return (new Date(a.time)).getTime() - (new Date(b.time)).getTime()
        })
      } else {
        this.gachaTable.rows.sort((a, b) => {
          return (new Date(b.time)).getTime() - (new Date(a.time)).getTime()
        })
      }
    },

    keyword (newVal) {
      const { sourceRows } = this.gachaTable

      if (sourceRows.length === 0) {
        return
      }

      if (newVal === '') {
        if (this.gachaTable.sourceRows.length) {
          this.gachaTable.rows = this.gachaTable.sourceRows
        }
        return
      }

      this.gachaTable.rows = this.gachaTable.sourceRows.filter(row => {
        return row.name.includes(newVal)
      })
    },

    selectedRankType (newVal) {
      if (newVal === '四星和五星') {
        this.gachaTable.rows = this.gachaTable.sourceRows
        return
      }

      const rankType = this.rankTypeMap[newVal]
      this.gachaTable.rows = this.gachaTable.sourceRows.filter(row => {
        return row.rankType === rankType
      })
    },

    selectedGachaType (newVal) {
      this.gachaType = this.gachaTypeMap[newVal]
    },

    gachaRecords (newVal) {
      if (newVal.length === 0) {
        return
      }

      if (this.gachaType === '301') {
        // 生成表格数据
        this.createGachaTableRows()
        
        // 展示表格
        this.isShowTable = true

        // 获取五星道具
        this.getFiveStartItems()

        // 可能需要去除最后一金
        this.getformattedFiveStartItems()
        
        // 计算五星道具平均抽数
        this.computeAverageCost()

        // 计算总抽数
        this.computeTotalCost()

        // 计算最非
        this.computeMostCost()

        // 计算最欧
        this.computeLeastCost()

        // 计算歪数
        this.computeMissingCount()

        // 计算歪率
        this.computeMissingRate()

        // 绘制柱状图
        this.drawBarChart()

        // 绘制饼图
        this.drawPieChart()

        // 展示图表
        this.isShowBarChart = true
        this.isShowPieChart = true

        // 清除 log.txt
        this.clearFile()
      } 
      else if (this.gachaType === '302') {
        // ...
      }
      else {
        // 生成表格数据
        this.createGachaTableRows()
        
        // 展示表格
        this.isShowTable = true

        // 获取五星道具
        this.getFiveStartItems()

        // 可能需要去除最后一金
        this.getformattedFiveStartItems()
        
        // 计算五星道具平均抽数
        this.computeAverageCost()

        // 计算总抽数
        this.computeTotalCost()

        // 计算最非
        this.computeMostCost()

        // 计算最欧
        this.computeLeastCost()

        // 绘制柱状图
        this.drawBarChart()

        // 展示图表
        this.isShowBarChart = true

        // 清除 log.txt
        this.clearFile()
      }

      
    }
  }
}
</script>

<style>
.rank-type-3 {
  color: #8E8E8E;
}

.rank-type-4 {
  color: #A256E1;
}

.rank-type-5 {
  color: #BD6932;
}
</style>