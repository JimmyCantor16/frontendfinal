import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { initInactivityControl } from '@/plugins/inactivity'

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app');

  if (localStorage.getItem('token')) {
    initInactivityControl()
  }
  
