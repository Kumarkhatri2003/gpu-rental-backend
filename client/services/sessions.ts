import { api } from "./api";
import { SessionDetail, normalizeSessions, normalizeSession } from "@/types/session";
import { mockSessions, mockGpuList, delay } from "./mockData";

// In-memory fallback session state for mock/offline development
let devSessionsState: SessionDetail[] = normalizeSessions(mockSessions);

/**
 * Fetch all sessions for the authenticated renter from GET /sessions.
 * Normalizes backend responses and provides fallback for local dev.
 */
export const getSessions = async (): Promise<SessionDetail[]> => {
  try {
    const response = await api.get("/sessions");
    const data = response.data;
    const list = Array.isArray(data) ? data : data?.sessions || data?.data || [];
    return normalizeSessions(list);
  } catch (error) {
    console.warn("Backend /sessions is not reachable, using mock session store for development:", error);
    await delay(300);
    return [...devSessionsState];
  }
};

/**
 * Terminate an active GPU rental session via POST /sessions/{id}/stop.
 * Triggers settlement and updates session status.
 */
export const stopSession = async (
  id: string
): Promise<{ success: boolean; session?: SessionDetail; message?: string }> => {
  try {
    const response = await api.post(`/sessions/${id}/stop`);
    const normalized = response.data ? normalizeSession(response.data) : undefined;
    
    // Also update dev fallback store if needed
    devSessionsState = devSessionsState.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: "completed",
          connectionStatus: "disconnected",
          endTime: new Date().toISOString(),
        };
      }
      return s;
    });

    return {
      success: true,
      session: normalized,
      message: "Session stopped successfully.",
    };
  } catch (error: unknown) {
    // If backend is not available during dev, simulate stopping the mock session
    console.warn(`Backend POST /sessions/${id}/stop failed or not reachable, performing optimistic mock update:`, error);
    await delay(500);

    const existingIndex = devSessionsState.findIndex((s) => s.id === id);
    if (existingIndex !== -1) {
      const existing = devSessionsState[existingIndex];
      const endTime = new Date().toISOString();
      const startMs = new Date(existing.startTime).getTime();
      const endMs = new Date(endTime).getTime();
      const durationHours = Math.max(0.1, (endMs - startMs) / (1000 * 60 * 60));
      const totalCost = Number((durationHours * existing.pricePerHour).toFixed(2));

      const updatedSession: SessionDetail = {
        ...existing,
        status: "completed",
        connectionStatus: "disconnected",
        endTime,
        totalCost,
      };

      devSessionsState[existingIndex] = updatedSession;
      return {
        success: true,
        session: updatedSession,
        message: "Session stopped successfully.",
      };
    }

    throw error;
  }
};

/**
 * Fetch a single session by ID.
 */
export const getSessionById = async (id: string): Promise<SessionDetail | null> => {
  try {
    const response = await api.get(`/sessions/${id}`);
    return normalizeSession(response.data);
  } catch {
    const all = await getSessions();
    return all.find((s) => s.id === id) || null;
  }
};
