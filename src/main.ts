import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.mount('#app')
