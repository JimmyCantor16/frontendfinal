import api from './api';

export default {
  getUsers() {
    return api.get('/users');
  }
};
