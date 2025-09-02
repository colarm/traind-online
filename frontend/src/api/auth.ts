import httpClient from "./axios";

export async function login(credentials: { email: string; password: string }) {
  try {
    const response = await httpClient.post("/auth/login", credentials);
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Login failed" };
  }
}

export async function register(userDetails: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const response = await httpClient.post("/auth/register", userDetails);
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Registration failed" };
  }
}

export async function logout() {
  try {
    await httpClient.post("/auth/logout");
    return { success: true };
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Logout failed" };
  }
}

export async function checkStatus() {
  try {
    const response = await httpClient.get("/auth/status");
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Status check failed" };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await httpClient.post("/auth/request-password-reset", {
      email,
    });
    return response.data;
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || "Password reset request failed",
    };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    const response = await httpClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Password reset failed" };
  }
}
