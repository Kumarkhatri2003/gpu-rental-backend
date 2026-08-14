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
    gpuId: "gpu-1", // Maps to RTX 4090
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: null,
    status: "active",
    totalCost: 268.80
  },
  {
    id: "sess-2",
    renterId: "user-1",
    gpuId: "gpu-2", // Maps to RTX 3090
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalCost: 240
  },
  {
    id: "sess-3",
    renterId: "user-1",
    gpuId: "gpu-4",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    totalCost: 120
  }
];

export const mockGpuList: GPU[] = [
  {
    id: "gpu-1",
    hostId: "host-101",
    model: "NVIDIA RTX 4090",
    vram: 24,
    pricePerHour: 180,
    status: "available",
    location: "Kathmandu",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-2",
    hostId: "host-102",
    model: "NVIDIA RTX 3090",
    vram: 24,
    pricePerHour: 120,
    status: "available",
    location: "Pokhara",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-3",
    hostId: "host-103",
    model: "NVIDIA RTX 4080",
    vram: 16,
    pricePerHour: 140,
    status: "available",
    location: "Kathmandu",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-4",
    hostId: "host-104",
    model: "NVIDIA RTX A6000",
    vram: 48,
    pricePerHour: 260,
    status: "available",
    location: "Lalitpur",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-5",
    hostId: "host-105",
    model: "NVIDIA A100",
    vram: 80,
    pricePerHour: 480,
    status: "available",
    location: "Kathmandu",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-6",
    hostId: "host-106",
    model: "NVIDIA RTX 3080",
    vram: 10,
    pricePerHour: 75,
    status: "available",
    location: "Pokhara",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-7",
    hostId: "host-107",
    model: "NVIDIA H100",
    vram: 80,
    pricePerHour: 850,
    status: "rented",
    location: "Kathmandu",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-8",
    hostId: "host-108",
    model: "NVIDIA RTX 4070 Ti",
    vram: 12,
    pricePerHour: 95,
    status: "available",
    location: "Biratnagar",
    createdAt: new Date().toISOString()
  },
  {
    id: "gpu-9",
    hostId: "host-109",
    model: "NVIDIA RTX 4090",
    vram: 24,
    pricePerHour: 175,
    status: "available",
    location: "Lalitpur",
    createdAt: new Date().toISOString()
  }
];

// Helper to simulate network delay for mock endpoints
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
