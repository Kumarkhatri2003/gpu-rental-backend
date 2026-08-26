import { GPU } from "./index";

export type SessionStatus =
  | "pending"
  | "preparing"
  | "active"
  | "stopping"
  | "completed"
  | "stopped"
  | "failed"
  | "cancelled";

export type ConnectionStatus =
  | "ready"
  | "connected"
  | "disconnected"
  | "provisioning"
  | "connecting"
  | "offline";

export interface SessionDetail {
  id: string;
  renterId: string;
  hostId?: string;
  gpuId: string;
  gpuName: string;
  gpuModel?: string;
  vram?: number;
  pricePerHour: number;
  startTime: string;
  endTime: string | null;
  status: SessionStatus;
  connectionStatus?: ConnectionStatus;
  sshHost?: string;
  sshPort?: number;
  sshUser?: string;
  gpuUtilization?: number;
  totalCost: number | null;
  createdAt?: string;
}

export interface Session extends SessionDetail {}

/**
 * Normalizes raw session response data from the backend into canonical SessionDetail.
 * Gracefully handles snake_case, camelCase, nested objects, and missing fields.
 */
export function normalizeSession(
  raw: Record<string, unknown> | null | undefined,
  gpuDict?: Record<string, GPU>
): SessionDetail {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      renterId: "",
      gpuId: "",
      gpuName: "Unknown GPU",
      pricePerHour: 0,
      startTime: new Date().toISOString(),
      endTime: null,
      status: "completed",
      totalCost: 0,
    };
  }

  const rawGpu = (typeof raw.gpu === "object" && raw.gpu !== null ? raw.gpu : {}) as Record<string, unknown>;
  const rawGpuId = String(raw.gpu_id ?? raw.gpuId ?? rawGpu.id ?? "");
  const fallbackGpu = gpuDict && rawGpuId ? gpuDict[rawGpuId] : undefined;

  const gpuName =
    (raw.gpu_name as string) ||
    (raw.gpu_model as string) ||
    (rawGpu.name as string) ||
    (rawGpu.model as string) ||
    fallbackGpu?.model ||
    "NVIDIA GPU";

  const gpuModel =
    (raw.gpu_model as string) ||
    (rawGpu.model as string) ||
    fallbackGpu?.model ||
    gpuName;

  const vram =
    Number(raw.vram ?? raw.gpu_vram ?? raw.memory ?? rawGpu.vram ?? rawGpu.memory ?? fallbackGpu?.vram) ||
    undefined;

  const pricePerHour =
    Number(
      raw.price_per_hour ??
        raw.pricePerHour ??
        raw.price ??
        rawGpu.pricePerHour ??
        rawGpu.price_per_hour ??
        rawGpu.price ??
        fallbackGpu?.pricePerHour
    ) || 0;

  // Normalize Status
  let rawStatus = String(raw.status || "completed").toLowerCase();
  if (rawStatus === "running") rawStatus = "active";
  if (rawStatus === "provisioning" || rawStatus === "starting") rawStatus = "preparing";
  if (rawStatus === "canceled") rawStatus = "cancelled";

  const status = (
    ["pending", "preparing", "active", "stopping", "completed", "stopped", "failed", "cancelled"].includes(rawStatus)
      ? rawStatus
      : "completed"
  ) as SessionStatus;

  // Normalize Connection Status
  let connectionStatus: ConnectionStatus | undefined = undefined;
  if (raw.connection_status || raw.connectionStatus) {
    const rawConn = String(raw.connection_status || raw.connectionStatus).toLowerCase();
    if (["ready", "connected", "disconnected", "provisioning", "connecting", "offline"].includes(rawConn)) {
      connectionStatus = rawConn as ConnectionStatus;
    }
  } else if (status === "active") {
    connectionStatus = "ready";
  } else if (status === "pending" || status === "preparing") {
    connectionStatus = "provisioning";
  }

  // SSH details
  const sshHost = (raw.ssh_host ?? raw.sshHost ?? raw.host ?? (rawGpu.sshHost as string)) as string | undefined;
  const rawSshPort = raw.ssh_port ?? raw.sshPort ?? (rawGpu.sshPort as number);
  const sshPort = rawSshPort ? Number(rawSshPort) : undefined;
  const sshUser = (raw.ssh_user ?? raw.sshUser ?? raw.ssh_username ?? "renter") as string;

  // Utilization
  const rawUtil = raw.gpu_utilization ?? raw.gpuUtilization ?? raw.utilization;
  const gpuUtilization = rawUtil !== undefined ? Number(rawUtil) : undefined;

  const startTime = String(raw.start_time ?? raw.startTime ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString());
  const endTime = raw.end_time || raw.endTime ? String(raw.end_time ?? raw.endTime) : null;

  // Calculate or parse total cost
  let totalCost: number | null = null;
  if (raw.total_cost !== undefined && raw.total_cost !== null) {
    totalCost = Number(raw.total_cost);
  } else if (raw.totalCost !== undefined && raw.totalCost !== null) {
    totalCost = Number(raw.totalCost);
  } else if (startTime && pricePerHour > 0) {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
    totalCost = Number((hours * pricePerHour).toFixed(2));
  }

  return {
    id: String(raw.id ?? ""),
    renterId: String(raw.renter_id ?? raw.renterId ?? ""),
    hostId: raw.host_id || raw.hostId ? String(raw.host_id ?? raw.hostId) : undefined,
    gpuId: rawGpuId,
    gpuName,
    gpuModel,
    vram,
    pricePerHour,
    startTime,
    endTime,
    status,
    connectionStatus,
    sshHost,
    sshPort,
    sshUser,
    gpuUtilization,
    totalCost,
    createdAt: raw.created_at || raw.createdAt ? String(raw.created_at ?? raw.createdAt) : undefined,
  };
}

export function normalizeSessions(
  rawList: unknown,
  gpuDict?: Record<string, GPU>
): SessionDetail[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => normalizeSession(item as Record<string, unknown>, gpuDict));
}
