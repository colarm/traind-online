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

export default httpClient;
