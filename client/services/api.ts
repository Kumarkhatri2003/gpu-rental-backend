import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on 401
      useAuthStore.getState().logout();
      toast.error("Session expired. Please log in again.");
      
      // Optionally redirect to login, but handle hydration/SSR issues carefully
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// --- API Methods ---
// These are currently mocked, wait for backend implementation to replace them with actual Axios calls.
import { mockWalletData, mockSessions, mockGpuList, delay } from "./mockData";

export const getDashboardStats = async () => {
  await delay(500); // Simulate network
  return {
    // We can add global stats if supported later. For now relying on sessions.
  };
};

export const getWalletBalance = async () => {
  await delay(500);
  return mockWalletData;
};

export const getSessions = async () => {
  await delay(500);
  return mockSessions;
};

export const getAvailableGpus = async () => {
  await delay(500);
  return mockGpuList.filter(gpu => gpu.status === "available");
};
