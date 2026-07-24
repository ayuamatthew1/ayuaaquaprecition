import { AuthGate } from "@/src/components/AuthGate";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
export default function RootLayout() {



  return (
    <AuthProvider>
      <AuthGate>
        <KeyboardProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="admin" />
            </Stack>
          </SafeAreaView>
        </KeyboardProvider>
      </AuthGate>
    </AuthProvider>
  );
}
