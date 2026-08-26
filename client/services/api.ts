import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { MarketplaceGPU, normalizeGpus, normalizeGpu } from "@/types/gpu";

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
    }
    
    return Promise.reject(error);
  }
);

// --- API Methods ---
import { mockWalletData, mockSessions, mockGpuList, delay } from "./mockData";

export const getDashboardStats = async () => {
  await delay(500); // Simulate network
  return {
    // We can add global stats if supported later. For now relying on sessions.
  };
};

export { getWalletBalance, depositFunds, getWalletTransactions } from "./wallet";
export { getSessions, stopSession, getSessionById } from "./sessions";

export const getAvailableGpus = async () => {
  await delay(500);
  return mockGpuList.filter(gpu => gpu.status === "available");
};

/**
 * Fetch all available marketplace GPUs from the public backend endpoint.
 * Normalizes snake_case or camelCase backend schemas into canonical MarketplaceGPU objects.
 */
export const getGPUs = async (): Promise<MarketplaceGPU[]> => {
  try {
    const response = await api.get("/gpus");
    return normalizeGpus(response.data);
  } catch (error) {
    console.warn("Backend /gpus is not reachable, using mock GPU inventory for development:", error);
    await delay(300);
    return normalizeGpus(mockGpuList);
  }
};

/**
 * Fetch a single GPU by ID from the backend endpoint.
 */
export const getGpuById = async (id: string | number): Promise<MarketplaceGPU | null> => {
  try {
    const response = await api.get(`/gpus/${id}`);
    return normalizeGpu(response.data);
  } catch {
    const all = await getGPUs();
    return all.find((g) => String(g.id) === String(id)) || null;
  }
};
