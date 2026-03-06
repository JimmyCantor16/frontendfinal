import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@core/router'
import vuetify from '@core/plugins/vuetify'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

router.isReady().then(() => {
    app.mount('#app')
})
