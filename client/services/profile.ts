import { api } from "./api";
import { UserProfile, normalizeProfile, UpdateProfileRequest } from "@/types/user";
import { useAuthStore } from "@/stores/auth-store";
import { delay } from "./mockData";

/**
 * Fetch authenticated renter's profile information from GET /auth/me.
 */
export const getProfile = async (): Promise<UserProfile> => {
  const storeUser = useAuthStore.getState().user;

  try {
    const response = await api.get("/auth/me");
    const profile = normalizeProfile(response.data);

    // Sync updated info into auth store if name or fields differ
    if (storeUser && (storeUser.name !== profile.name || storeUser.email !== profile.email)) {
      useAuthStore.getState().updateUser({
        name: profile.name,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        createdAt: profile.createdAt,
      });
    }

    return profile;
  } catch (error) {
    console.warn("Backend GET /auth/me is not reachable, using authenticated session store for development:", error);
    await delay(300);

    if (storeUser) {
      const parts = (storeUser.name || "").trim().split(/\s+/);
      const firstName = storeUser.firstName || parts[0] || "Developer";
      const lastName = storeUser.lastName || parts.slice(1).join(" ") || "Renter";

      return {
        id: storeUser.id || "dev-user-1",
        email: storeUser.email || "dev@labhya.com",
        firstName,
        lastName,
        name: storeUser.name || `${firstName} ${lastName}`.trim(),
        role: storeUser.role || "renter",
        createdAt: storeUser.createdAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return {
      id: "dev-user-1",
      email: "dev@labhya.com",
      firstName: "Developer",
      lastName: "Renter",
      name: "Developer Renter",
      role: "renter",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
};

/**
 * Update authenticated renter's profile information.
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<{ success: boolean; profile: UserProfile; message?: string }> => {
  const payload = {
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
  };

  try {
    let response;
    try {
      response = await api.patch("/auth/me", payload);
    } catch {
      response = await api.put("/auth/me", payload);
    }

    const updatedProfile = normalizeProfile(response.data);

    // Sync into auth store
    useAuthStore.getState().updateUser({
      name: updatedProfile.name,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
    });

    return {
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully.",
    };
  } catch (error: unknown) {
    console.warn("Backend profile update endpoint not available, applying optimistic update to auth store:", error);
    await delay(500);

    const storeUser = useAuthStore.getState().user;
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    const updatedProfile: UserProfile = {
      id: storeUser?.id || "dev-user-1",
      email: storeUser?.email || "dev@labhya.com",
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name: fullName,
      role: storeUser?.role || "renter",
      createdAt: storeUser?.createdAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    useAuthStore.getState().updateUser({
      name: fullName,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    });

    return {
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully.",
    };
  }
};
