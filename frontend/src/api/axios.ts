/**
 * HTTP client configuration using Axios
 * Handles API communication with automatic environment switching
 */

import axios, { AxiosInstance } from "axios";

/**
 * Configured Axios instance with base URL and timeout settings
 */
const httpClient: AxiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://traind.online/api" // Production API
      : "http://localhost:5173/api", // Development API
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export default httpClient;
