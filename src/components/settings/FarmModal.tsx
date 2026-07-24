import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "@/src/theme/theme";

export interface FarmFormData {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface FarmModalProps {
  visible: boolean;
  farm: FarmFormData;
  loading?: boolean;
  onClose: () => void;
  onSave: (farm: FarmFormData) => void;
}

export default function FarmModal({
  visible,
  farm,
  loading = false,
  onClose,
  onSave,
}: FarmModalProps) {
  const [form, setForm] = useState<FarmFormData>(farm);

  useEffect(() => {
    setForm(farm);
  }, [farm, visible]);

  const updateField = <K extends keyof FarmFormData>(
    key: K,
    value: FarmFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Farm Information</Text>

              <TextInput
                style={styles.input}
                placeholder="Farm Name"
                placeholderTextColor="#888"
                value={form.name}
                onChangeText={(text) => updateField("name", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#888"
                value={form.description ?? ""}
                onChangeText={(text) =>
                  updateField("description", text)
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#888"
                value={form.address ?? ""}
                onChangeText={(text) =>
                  updateField("address", text)
                }
              />

              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#888"
                value={form.city ?? ""}
                onChangeText={(text) => updateField("city", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#888"
                value={form.state ?? ""}
                onChangeText={(text) => updateField("state", text)}
              />

              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor="#888"
                value={form.country ?? ""}
                onChangeText={(text) =>
                  updateField("country", text)
                }
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    loading && styles.disabledButton,
                  ]}
                  disabled={loading}
                  onPress={() => onSave(form)}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={theme.colors.surface}
                    />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.surface,
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.surface,
    marginBottom: 14,
    backgroundColor: "#fff",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 12,
  },

  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    minWidth: 90,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  cancelText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },

  saveText: {
    color: theme.colors.surface,
    fontWeight: "600",
  },
});