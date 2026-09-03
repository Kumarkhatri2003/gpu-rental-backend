export interface MarketplaceGPU {
  id: string | number;
  hostId: string | number;
  name: string;
  vram: number;
  pricePerHour: number;
  availability: "available" | "busy" | "offline" | string;
  location: string;
}

export interface GpuFilters {
  search: string;
  models: string[];
  minVram: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  locations: string[];
  availableOnly: boolean;
}

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "vram-asc"
  | "vram-desc";

export function normalizeGpu(raw: Record<string, unknown> | null | undefined): MarketplaceGPU {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      hostId: "",
      name: "Unknown GPU",
      vram: 0,
      pricePerHour: 0,
      availability: "offline",
      location: "Unknown",
    };
  }

  // Handle availability
  let availability = "available";
  if (typeof raw.gpu_availability === "boolean") {
    availability = raw.gpu_availability ? "available" : "busy";
  } else if (typeof raw.gpu_availability === "string") {
    availability = raw.gpu_availability.toLowerCase();
  } else if (typeof raw.status === "string") {
    availability = raw.status.toLowerCase();
  } else if (raw.available !== undefined) {
    availability = raw.available ? "available" : "busy";
  }

  const rawName = (raw.gpu_name || raw.model || raw.name) as string | undefined;
  const rawLocation = (raw.gpu_location || raw.location) as string | undefined;
  const rawId = (raw.id ?? "") as string | number;
  const rawHostId = (raw.host_id ?? raw.hostId ?? "") as string | number;

  const rawMemory = raw.gpu_memory ?? raw.vram ?? raw.memory ?? 0;
  const rawPrice = raw.gpu_price ?? raw.pricePerHour ?? raw.price ?? 0;

  return {
    id: rawId,
    hostId: rawHostId,
    name: rawName || "Unknown GPU",
    vram: Number(rawMemory),
    pricePerHour: Number(rawPrice),
    availability,
    location: rawLocation || "Unknown",
  };
}

export function normalizeGpus(rawList: unknown): MarketplaceGPU[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => normalizeGpu(item as Record<string, unknown>));
}

export interface GpuPreviewData {
  name: string;
  memory: number;
  price: number;
  location: string;
  available: boolean;
}

export const previewGpus: GpuPreviewData[] = [
  {
    name: "NVIDIA RTX 4090",
    memory: 24,
    price: 180,
    location: "Kathmandu",
    available: true,
  },
  {
    name: "NVIDIA RTX 3090",
    memory: 24,
    price: 140,
    location: "Pokhara",
    available: true,
  },
  {
    name: "NVIDIA RTX A6000",
    memory: 48,
    price: 250,
    location: "Kathmandu",
    available: true,
  },
];
