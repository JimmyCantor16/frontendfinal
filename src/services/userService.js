import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // la misma URL que Laravel
  headers: { 'Content-Type': 'application/json' }
});

export default {
  getUsers() {
    return apiClient.get('/users', {
      headers: { 'Cache-Control': 'no-cache' } // evita problemas de caché
    });
  }
};
