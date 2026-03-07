import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lab6-backend-wzrv.onrender.com' 
});

export default api;