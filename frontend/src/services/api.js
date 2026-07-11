import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000, // AI extraction on larger CSVs can take a while
});

export default api;
