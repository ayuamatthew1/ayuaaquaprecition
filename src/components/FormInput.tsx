import { theme } from "@/src/theme/theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export default function FormInput({
  label,
  error,
  ...props
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        placeholderTextColor="#888"
        style={[
          styles.input,
          error && styles.errorBorder,
        ]}
        {...props}
      />

      {!!error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: theme.colors.surface,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
  },

  errorBorder: {
    borderColor: "#e53935",
  },

  error: {
    marginTop: 5,
    color: "#e53935",
    fontSize: 12,
  },
});