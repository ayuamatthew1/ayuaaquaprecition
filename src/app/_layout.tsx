import { AuthGate } from "@/src/components/AuthGate";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
export default function RootLayout() {



  return (
    <AuthProvider>
      <AuthGate>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="admin"
              options={{ presentation: "card" }}
            />
          </Stack>
        </SafeAreaView>
      </AuthGate>
    </AuthProvider>
  );
}
