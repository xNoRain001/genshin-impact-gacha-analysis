<template>
  <div>
    <div class="p-5 w-5/12">
      <q-uploader
        class="w-full"
        hide-upload-btn
        max-files="1"
        :max-file-size="1024 * 1024"
        :max-total-size="1024 * 1024"
        accept="txt"
        @rejected="filedToValidation"
        @added="addedFile"
        label="上传 output_log.txt 文件"
      />
      <div class="mt-5 flex justify-between items-center">
        <q-select
          filled
          v-model="selectedMode"
          :options="modeOptions"
          style="min-width: 150px;"
          label="选择类型"
        />
        <q-btn
          @click="startUploadFile"
          color="primary"
          label="开始抽卡分析"
        />
      </div>
    </div>
    <div class="p-5">
      <q-table
        :rows="gachaTable.rows"
        :columns="gachaTable.columns"
      >
        
        <!-- 自定义顶部 -->
        <template v-slot:top>
          <div class="col-2 q-table__title">四星 / 五星</div>
        </template>
        
        <!-- 自定义表头 -->
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
        
        <!-- 自定义行 -->
        <template v-slot:body="props">
          <q-tr
            :props="props"
            style="font-size: 16px;"
          >
            <q-td key="itemType" :props="props">
              {{ props.row.itemType }}
            </q-td>
            <q-td
              key="name"
              :props="props" 
              class="text-bold"
              :class="props.row.rankType === '4' ? 'rank-type-4' : 'rank-type-5'"
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
  </div>      

</template>

<script>
import request from '../request/index'
import { suc, fail } from '../utils'

export default {
  name: 'GachaAnalysis',

  data () {
    return {
      logFile: null, // log.txt
      gachaRecords: [], // 抽卡记录
      gachaTable: {
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
      selectedMode: '角色活动祈愿',
      modeOptions: ['角色活动祈愿', '武器活动祈愿', '常驻祈愿'],
      gachaType: '301',
      gachaTypeMap: {
        '角色活动祈愿': '301',
        '武器活动祈愿': '302',
        '常驻祈愿': '200'
      },
      fiveStarItems: [],
      averageNumberOfFiveStartItems: null
    }
  },

  methods: {
    // 选取文件后被拒绝的回调
    filedToValidation () {
      fail('上传文件格式错误')
    },

    // 成功添加文件的回调
    addedFile (files) {
      this.logFile = files[0]
    },

    // 开始抽卡分析
    async startUploadFile () {

      // 确保存在 log.txt
      if (this.logFile === null) {
        fail('请上传文件')
        return
      }

      // 清除之前的抽卡记录
      this.resetGachaData()

      const formData = new FormData

      formData.append('file', this.logFile)
      formData.append('filename', 'logFile')

      try {

        // 上传文件，服务器分析出调用后续 API 的必须参数
        const { 
          status, 
          message, 
          // data: params 
        } = await request.post('/uploadLogFile', formData)

        if (status === 200) {
          suc('正在获取抽卡记录')

          // 更新卡池类型
          // params.gacha_type = this.gachaType

          // // 获取抽卡记录
          // const { data: gachaRecords } = await request.get('/getAllGachaRecords', {
          //     params
          //   }
          // )

          // this.gachaRecords = gachaRecords

          const gachaRecords = JSON.parse(localStorage.getItem('gachaRecords'))
          this.gachaRecords = gachaRecords
        } else {
          throw new Error(message)
        }
      } catch (error) {
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

    // 绘制饼图
    drawPieChart () {
      // ...
    },

    // 生成表格数据
    createGachaTableRows (gachaRecords) {
      let counter = 0

      for (let i = gachaRecords.length - 1; i >= 0; i--) {
        counter++

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

        const gachaType = this.selectedMode

        const formattedRecord = {
          itemType,
          name,
          gachaType,
          rankType,
          time
        }
        this.gachaTable.rows.unshift(formattedRecord)

        // 记录出现的五星物品和所用抽数
        if (rankType === '5') {
          formattedRecord.counter = counter
          this.fiveStarItems.unshift(formattedRecord)
          counter = 0
        }
      }
    },
    
    // 计算五星道具平均所用抽数
    computeAverageNumberOfFiveStartItems () {
      const formattedFiveStartItem = this.fiveStarItems.slice()
      formattedFiveStartItem.length--
      const total = formattedFiveStartItem.reduce((acc, cur) => {
        return acc + cur.counter
      }, 0)
      this.averageNumberOfFiveStartItems = total / formattedFiveStartItem.length
    },

    // 重置抽奖记录
    resetGachaData () {
      this.gachaRecords = []
      this.gachaTable.rows = []
      this.fiveStarItems = []
      this.averageNumberOfFiveStartItems = null
    }
  },

  watch: {
    selectedMode (newVal) {
      this.gachaType = this.gachaTypeMap[newVal]
    },

    gachaRecords (newVal) {
      if (newVal.length === 0) {
        return
      }

      // 生成表格数据
      this.createGachaTableRows(newVal)

      // 计算五星物品平均抽数
      this.computeAverageNumberOfFiveStartItems()

      // 绘制饼图
      this.drawPieChart()

      // 清除 log.txt
      this.clearFile()
    }
  }
}
</script>

<style>
.rank-type-4 {
  color: #A256E1;
}

.rank-type-5 {
  color: #BD6932;
}
</style>