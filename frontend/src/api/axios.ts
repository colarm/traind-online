import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create an Axios instance with default config
const httpClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5173/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request/response interceptors here
httpClient.interceptors.request.use(
  (config) => {
    // Example: Attach token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default httpClient;