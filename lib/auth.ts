
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.backendUrl || "";

export const BEARER_TOKEN_KEY = "civic_bearer_token";

// Platform-specific storage: localStorage for web, SecureStore for native
const storage = Platform.OS === "web"
  ? {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn("[Auth] localStorage.getItem failed:", error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn("[Auth] localStorage.setItem failed:", error);
        }
      },
      deleteItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn("[Auth] localStorage.removeItem failed:", error);
        }
      },
    }
  : SecureStore;

// Only initialize auth client if backend URL is configured
let authClient: ReturnType<typeof createAuthClient> | null = null;

try {
  if (API_URL && API_URL.length > 0) {
    console.log("[Auth] Initializing auth client with backend URL:", API_URL);
    authClient = createAuthClient({
      baseURL: API_URL,
      plugins: [
        expoClient({
          scheme: "kenyacivic",
          storagePrefix: "kenyacivic",
          storage,
        }),
      ],
      // On web, use cookies (credentials: include)
      ...(Platform.OS === "web" && {
        fetchOptions: {
          credentials: "include" as RequestCredentials,
        },
      }),
    });
  } else {
    console.warn("[Auth] Backend URL not configured. Auth client not initialized.");
  }
} catch (error) {
  console.error("[Auth] Failed to initialize auth client:", error);
}

// Export a safe auth client that throws helpful errors if not initialized
export { authClient };

export async function setBearerToken(token: string) {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(BEARER_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(BEARER_TOKEN_KEY, token);
    }
    console.log("[Auth] Bearer token stored successfully");
  } catch (error) {
    console.error("[Auth] Failed to store bearer token:", error);
  }
}

export async function clearAuthTokens() {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(BEARER_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(BEARER_TOKEN_KEY);
    }
    console.log("[Auth] Auth tokens cleared successfully");
  } catch (error) {
    console.error("[Auth] Failed to clear auth tokens:", error);
  }
}

export { API_URL };
