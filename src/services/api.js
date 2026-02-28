import axios from 'axios';

const api = axios.create({
  // Make sure this matches the URL from your Render "Events" tab!
  baseURL: 'https://lab6-backend-wxzv.onrender.com' 
});

export default api;