import httpClient from "./axios";

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<any> {
  try {
    const response = await httpClient.post("/auth/login", credentials);
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Login failed" };
  }
}

export async function register(userDetails: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<any> {
  try {
    const response = await httpClient.post("/auth/register", userDetails);
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Registration failed" };
  }
}

export async function logout(): Promise<any> {
  try {
    await httpClient.post("/auth/logout");
    return { success: true };
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Logout failed" };
  }
}

export async function checkStatus(): Promise<any> {
  try {
    const response = await httpClient.get("/auth/status");
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Status check failed" };
  }
}
