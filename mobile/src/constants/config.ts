import Constants from "expo-constants";
import { Platform } from "react-native";

const env = process.env as { EXPO_PUBLIC_API_URL?: string };

function resolveApiBaseUrl(): string {
  const explicit = env.EXPO_PUBLIC_API_URL?.trim();

  // If explicit URL is provided and not pointing to localhost, use it
  if (explicit && !explicit.includes("localhost") && !explicit.includes("127.0.0.1")) {
    return explicit;
  }

  // Auto-detect host IP from Expo Metro bundler on physical devices
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as Record<string, any>)?.manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as Record<string, any>)?.manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8000`;
    }
  }

  // Android emulator loopback alias
  if (Platform.OS === "android" && (!explicit || explicit.includes("localhost"))) {
    return "http://10.0.2.2:8000";
  }

  // Default to developer machine's LAN IP
  return explicit || "http://192.168.137.106:8000";
}

export const API_BASE_URL = resolveApiBaseUrl();
export const APP_NAME = "MEND-X";
export const APP_TAGLINE = "From Failure to Function";
