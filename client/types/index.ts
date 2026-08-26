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
  specs?: {
    cudaCores?: number;
    memoryType?: string;
    pcieGen?: string;
  };
  location?: string;
  createdAt?: string;
}

export * from "./gpu";
export * from "./session";
export * from "./wallet";
export * from "./user";



