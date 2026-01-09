import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

createApp(App)
  .use(router)      // necesario para que las rutas funcionen
  .mount('#app');   // debe coincidir con div id="app"
