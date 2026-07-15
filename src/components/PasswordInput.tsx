import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export default function PasswordInput({
  label,
  error,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.wrapper,
          error && styles.errorBorder,
        ]}
      >
        <TextInput
          style={styles.input}
          secureTextEntry={!visible}
          placeholderTextColor="#888"
          {...props}
        />

        <TouchableOpacity
          onPress={() => setVisible(!visible)}
        >
          <Ionicons
            name={
              visible
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>

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
    color: theme.colors.primary,
    fontWeight: "600",
  },

  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
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