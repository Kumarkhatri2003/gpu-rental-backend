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
    available: true
  },
  {
    name: "NVIDIA RTX 3090",
    memory: 24,
    price: 140,
    location: "Pokhara",
    available: true
  },
  {
    name: "NVIDIA RTX A6000",
    memory: 48,
    price: 250,
    location: "Kathmandu",
    available: true
  }
];
