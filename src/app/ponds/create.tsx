import FormInput from "@/src/components/FormInput";
import { useAuth } from "@/src/context/AuthContext";
import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const pondTypes = ["EARTHEN", "CONCRETE", "TARPAULIN", "FIBER", "PLASTIC"] as const;
type PondType = (typeof pondTypes)[number];

type ApiResponse = {
  success: boolean;
  message?: string;
};

export default function CreatePondScreen() {
  const { authenticatedFetch } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<PondType>("CONCRETE");
  const [capacity, setCapacity] = useState("");
  const [waterVolume, setWaterVolume] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createPond = async () => {
    const parsedCapacity = capacity.trim() ? Number(capacity) : undefined;
    const parsedWaterVolume = waterVolume.trim() ? Number(waterVolume) : undefined;

    if (!name.trim()) {
      setError("Enter a name for this pond.");
      return;
    }
    if (parsedCapacity !== undefined && (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0)) {
      setError("Capacity must be a positive number.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await authenticatedFetch("/api/ponds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, capacity: parsedCapacity, waterVolume: parsedWaterVolume }),
      });
      const result: ApiResponse = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to create pond.");
      }

      Alert.alert("Pond created", "Your pond is ready. Connect a monitoring device to begin receiving readings.");
      router.replace("/ponds");

    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create pond.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color={theme.colors.surface} />
      </TouchableOpacity>

      <Text style={styles.title}>Create a pond</Text>
      <Text style={styles.subtitle}>Add your first pond now, then connect its monitoring device when ready.</Text>

      <FormInput
        label="Pond name"
        placeholder="e.g. Nursery Pond A"
        value={name}
        onChangeText={setName}
        error={error && !name.trim() ? error : undefined}
      />

      <FormInput
        label="Pond Capacity "
        placeholder="How many fish can this pond contain"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="decimal-pad"
        error={capacity.trim() ? error : undefined}
      />

      <FormInput
        label="Water volume"
        placeholder="eg 10000..."
        value={waterVolume}
        onChangeText={setWaterVolume}
        keyboardType="decimal-pad"
        error={capacity.trim() ? error : undefined}
      />

      {error && name.trim() && !capacity.trim() && <Text style={styles.error}>{error}</Text>}


      <Text style={styles.label}>Pond type</Text>
      <View style={styles.typeGrid}>
        {pondTypes.map((pondType) => (
          <TouchableOpacity
            key={pondType}
            onPress={() => setType(pondType)}
            style={[styles.typeButton, type === pondType && styles.typeButtonSelected]}
          >
            <Text style={[styles.typeText, type === pondType && styles.typeTextSelected]}>
              {pondType.charAt(0) + pondType.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>



      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        disabled={submitting}
        onPress={() => void createPond()}
      >
        {submitting ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.submitText}>Create pond</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.surface,
  },
  subtitle: {
    color: theme.colors.text,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    color: theme.colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.surface,
    fontWeight: "600",
  },
  typeTextSelected: {
    color: theme.colors.surface,
  },
  error: {
    color: "#ff9f9f",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
