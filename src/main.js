import { createApp } from 'vue'
import App from './App.vue'
import quasarUserOptions from './quasar-user-options'
import { Quasar } from 'quasar'
import './utils/chart'
import './index.css'

createApp(App).use(Quasar, quasarUserOptions).mount('#app')
