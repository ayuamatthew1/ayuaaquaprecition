import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { AuthGate } from "@/src/components/AuthGate";
export default function RootLayout() {



  return (
    <AuthProvider>
      <AuthGate>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </SafeAreaView>
      </AuthGate>
    </AuthProvider>
  );
}
