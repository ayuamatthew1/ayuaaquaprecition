import { Platform } from "react-native";

export function getApiUrl(path: string) {
  if (Platform.OS === "web") return path;

  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is required for native API requests.");
  }

  return `${baseUrl}${path}`;
}
