import { Session, GPU } from "@/types";

export interface WalletData {
  balance: number;
  currency: string;
}

export const mockWalletData: WalletData = {
  balance: 2450.00,
  currency: "NPR"
};

export const mockSessions: Session[] = [
  {
    id: "sess-1",
    renterId: "user-1",
    gpuId: "gpu-1", // Will map to RTX 4090
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: null,
    status: "active",
    totalCost: 268.80
  },
  {
    id: "sess-2",
    renterId: "user-1",
    gpuId: "gpu-2", // Will map to RTX 3090
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalCost: 240
  },
  {
    id: "sess-3",
    renterId: "user-1",
    gpuId: "gpu-3",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalCost: 120
  }
];

export const mockGpuList: GPU[] = [
  {
    id: "gpu-1",
    hostId: "host-1",
    model: "RTX 4090",
    vram: 24,
    pricePerHour: 120,
    status: "rented",
    specs: {
      cudaCores: 16384,
      memoryType: "GDDR6X",
      pcieGen: "4.0"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-2",
    hostId: "host-2",
    model: "RTX 3090",
    vram: 24,
    pricePerHour: 85,
    status: "available",
    specs: {
      cudaCores: 10496,
      memoryType: "GDDR6X",
      pcieGen: "4.0"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-3",
    hostId: "host-1",
    model: "A6000",
    vram: 48,
    pricePerHour: 160,
    status: "available",
    specs: {
      cudaCores: 10752,
      memoryType: "GDDR6",
      pcieGen: "4.0"
    },
    createdAt: new Date().toISOString()
  }
];

// Helper to simulate network delay for mock endpoints
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
