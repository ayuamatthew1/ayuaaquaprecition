import { useAuth } from "@/src/context/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const isAuthRoute = segments[0] === "(auth)" || segments[0] === "password-reset";

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/login-screen");
    }

  }, [isAuthenticated, isAuthRoute, loading, router]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
