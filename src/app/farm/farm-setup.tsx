import { useAuth } from "@/src/context/AuthContext";
import { theme } from "@/src/theme/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FarmSetupScreen() {
  const router = useRouter();
  const { authenticatedFetch } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showError = (text: string) => {
    if (Platform.OS === "web") setMessage(text);
    else Alert.alert("Farm setup", text);
  };

  const createFarm = async () => {
    if (name.trim().length < 2) {
      showError("Enter a farm name with at least 2 characters.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const response = await authenticatedFetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, state, country }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message ?? "Unable to create farm.");

      router.replace("/");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to create farm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.badge}><Text style={styles.badgeText}>Optional but required step</Text></View>
      <Text style={styles.title}>Set up your farm</Text>
      <Text style={styles.subtitle}>Add your first farm now so you can create ponds, connect devices, and receive monitoring data.</Text>

      <Text style={styles.label}>Farm name *</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Ayua Hatchery" placeholderTextColor="#78909c" style={styles.input} />
      <Text style={styles.label}>City</Text>
      <TextInput value={city} onChangeText={setCity} placeholder="e.g. Makurdi" placeholderTextColor="#78909c" style={styles.input} />
      <Text style={styles.label}>State</Text>
      <TextInput value={state} onChangeText={setState} placeholder="e.g. Benue" placeholderTextColor="#78909c" style={styles.input} />
      <Text style={styles.label}>Country</Text>
      <TextInput value={country} onChangeText={setCountry} placeholder="Country" placeholderTextColor="#78909c" style={styles.input} />

      {message ? <Text style={styles.error}>{message}</Text> : null}
      <TouchableOpacity style={[styles.primaryButton, loading && styles.disabled]} onPress={() => void createFarm()} disabled={loading}>
        {loading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.primaryButtonText}>Create farm</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.skipButton} onPress={() => router.replace("/")} disabled={loading}>
        <Text style={styles.skipButtonText}>I&apos;ll do this later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: theme.colors.background },
  badge: { alignSelf: "flex-start", borderRadius: 20, backgroundColor: "#0b5a76", paddingHorizontal: 10, paddingVertical: 5, marginBottom: 14 },
  badgeText: { color: theme.colors.accent2, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: theme.colors.surface, fontSize: 30, fontWeight: "700" },
  subtitle: { color: theme.colors.text, lineHeight: 21, marginTop: 10, marginBottom: 28 },
  label: { color: theme.colors.surface, fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: theme.colors.surface, borderRadius: 10, color: theme.colors.background, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16 },
  error: { color: theme.colors.errorBackground, backgroundColor: theme.colors.errorText, padding: 10, borderRadius: 8, marginBottom: 12 },
  primaryButton: { alignItems: "center", backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
  primaryButtonText: { color: theme.colors.surface, fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.7 },
  skipButton: { alignItems: "center", paddingVertical: 18 },
  skipButtonText: { color: theme.colors.accent2, fontWeight: "700" },
});
