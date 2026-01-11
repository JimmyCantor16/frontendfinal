import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'

createApp(App)
  .use(createPinia()) // para usar el storage
  .use(router)      // necesario para que las rutas funcionen
  .mount('#app');   // debe coincidir con div id="app"
