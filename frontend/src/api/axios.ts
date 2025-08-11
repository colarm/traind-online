import axios, { AxiosInstance, AxiosResponse } from "axios";

// Create an Axios instance with default config
const httpClient: AxiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://traind.online/api"
      : "http://localhost:5173/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
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
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access - please log in");
    } else if (error.response?.status === 403) {
      console.error("Access denied");
    }
    return Promise.reject(error);
  }
);

export default httpClient;
