import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Severity = "LOW" | "MEDIUM" | "HIGH";

interface AlertItemProps {
  alert: string;
  recommendation: string;
  severity: Severity;
}

const severityConfig = {
  LOW: {
    color: "#4CAF50",
    icon: "checkmark-circle",
    label: "Low",
  },
  MEDIUM: {
    color: "#FFC107",
    icon: "warning",
    label: "Medium",
  },
  HIGH: {
    color: "#F44336",
    icon: "alert-circle",
    label: "High",
  },
} as const;

export default function AlertItem({
  alert,
  recommendation,
  severity,
}: AlertItemProps) {
  const config = severityConfig[severity];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={config.icon as any}
          size={22}
          color={config.color}
        />

        <View
          style={[
            styles.badge,
            { backgroundColor: config.color },
          ]}
        >
          <Text style={styles.badgeText}>
            {config.label}
          </Text>
        </View>
      </View>

      <Text style={styles.alert}>
        {alert}
      </Text>

      <Text style={styles.recommendation}>
        {recommendation}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  alert: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  recommendation: {
    color: theme.colors.surface,
    opacity: 0.8,
    lineHeight: 20,
  },
});