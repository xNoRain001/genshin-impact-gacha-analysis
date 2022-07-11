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
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        
        <!-- 自定义行 -->
        <template v-slot:body="props">
          <q-tr :props="props">
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
      selectedMode: '限定角色池',
      modeOptions: ['限定角色池', '武器池', '常驻池'],
      gachaType: '301',
      gachaTypeMap: {
        '限定角色池': '301',
        '武器池': '302',
        '常驻池': '200'
      }
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
      this.gachaRecords = []
      this.gachaTable.rows = []

      const formData = new FormData

      formData.append('file', this.logFile)
      formData.append('filename', 'logFile')

      try {

        // 上传文件，服务器分析出调用后续 API 的必须参数
        const { 
          status, 
          message, 
          data: params 
        } = await request.post('/uploadLogFile', formData)

        if (status === 200) {
          suc('正在获取抽卡记录')

          // 更新卡池类型
          params.gacha_type = this.gachaType

          // 获取抽卡记录
          const { data: gachaRecords } = await request.get('/getAllGachaRecords', {
              params
            }
          )

          this.gachaRecords = gachaRecords
          
          // // 生成表格数据
          this.createGachaTable(gachaRecords)

          // 清除 log.txt
          this.clearFile()
        } else {
          throw new Error(message)
        }
      } catch (error) {
        fail(error.message)
      }
    },

    // 生成表格数据
    createGachaTable (gachaRecords) {
      console.log(gachaRecords)
      for (let i = 0, l = gachaRecords.length; i < l; i++) {
        const record = gachaRecords[i]

        // 去除三星武器
        if (record.rank_type === '3') {
          continue
        }

        const {
          item_type: itemType, 
          name, 
          gacha_type, 
          rank_type: rankType,
          time 
        } = record

        const gachaType = gacha_type === '301'
          ? '角色活动祈愿'
          : gacha_type === '302'
              ? '武器活动祈愿'
              : '常驻祈愿'

        this.gachaTable.rows.push({
          itemType,
          name,
          gachaType,
          rankType,
          time
        })
      }
    },

    // 清除文件
    clearFile () {
      this.logFile = null
      const uploader = document.querySelector('.q-uploader')
      const clearBtn = uploader.querySelector('i')
      clearBtn.click()
    }
  },

  watch: {
    selectedMode (newVal) {
      this.gachaType = this.gachaTypeMap[newVal]
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