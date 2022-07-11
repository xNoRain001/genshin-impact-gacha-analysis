import axios from 'axios'

const request = axios.create()

request.defaults.baseURL = 'http://localhost:8080/api'

request.defaults.headers.post['Content-Type'] = 'multipart/form-data'

export default request