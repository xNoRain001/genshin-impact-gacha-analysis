import axios from 'axios'

const request = axios.create()

request.defaults.baseURL = 'http://localhost:8080/api'

request.defaults.headers.post['Content-Type'] = 'multipart/form-data'

request.interceptors.request.use(config => {
  return config
}, error => {
  return Promise.reject(error)
})
request.interceptors.response.use(response => {
  return response.data
}, error => {
  return Promise.reject(error)
})

export default request