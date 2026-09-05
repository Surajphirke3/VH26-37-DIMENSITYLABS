const env = process.env as { EXPO_PUBLIC_API_URL?: string };

export const API_BASE_URL = env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
export const APP_NAME = "MEND-X";
export const APP_TAGLINE = "From Failure to Function";
