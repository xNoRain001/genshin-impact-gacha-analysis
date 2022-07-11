<template>
  <div>
    <div class="m-5">
      <q-uploader
        class="w-3/12"
        hide-upload-btn
        :max-files="1"
        :max-file-size="1024 * 1024"
        accept="txt"
        @rejected="filedToValidation"
        @added="addFile"
        label="上传 output_log.txt 文件"
      />
      <div class="flex justify-between mt-5 w-3/12">
        <q-btn @click="startUploadFile" color="primary" label="开始抽卡分析" />
        <q-btn color="secondary" label="重新上传文件" />
      </div>
    </div>
  </div>      

</template>

<style>
</style>

<script>
import request from '../request/index'
import { fail } from '../utils'

export default {
  name: 'GachaAnalysis',

  data () {
    return {
      logFile: null
    }
  },

  methods: {
    filedToValidation () {
      fail('文件格式错误')
    },

    addFile (files) {
      this.logFile = files[0]
    },

    async startUploadFile () {
      const formData = new FormData
      formData.append('file', this.logFile)
      formData.append('filename', 'logFile')
      try {
        const data = await request.post('/uploadLogFile', formData)
        console.log(data)
      } catch (error) {
        fail(error.message)
      }
    }
  }
}
</script>
