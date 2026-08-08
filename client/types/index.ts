export interface User {
  id: string;
  email: string;
  name: string;
  role: "host" | "renter";
  createdAt: string;
  updatedAt: string;
}

export interface GPU {
  id: string;
  hostId: string;
  model: string;
  vram: number;
  pricePerHour: number;
  status: "available" | "rented" | "offline";
  specs: {
    cudaCores: number;
    memoryType: string;
    pcieGen: string;
  };
  createdAt: string;
}

export interface Session {
  id: string;
  renterId: string;
  gpuId: string;
  startTime: string;
  endTime: string | null;
  status: "active" | "completed" | "cancelled";
  totalCost: number | null;
}
