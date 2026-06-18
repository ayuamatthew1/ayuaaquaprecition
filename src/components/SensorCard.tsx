import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/theme";

type Status = "good" | "warning" | "danger";

interface SensorCardProps {
  title: string;
  value: number | string;
  unit?: string;
  idealRange: string;
  status: Status;
  icon: React.ReactNode;
}

const statusColors = {
  good: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336",
};

export default function SensorCard({
  title,
  value,
  unit,
  idealRange,
  status,
  icon,
}: SensorCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {icon}
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColors[status] },
          ]}
        >
          <Text style={styles.badgeText}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>
        {value}
        {unit ? ` ${unit}` : ""}
      </Text>

      <Text style={styles.ideal}>Ideal: {idealRange}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 14,
  },

  title: {
    color: theme.colors.surface,
    fontSize: 16,
    marginTop: 10,
  },

  value: {
    color: theme.colors.surface,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 8,
  },

  ideal: {
    color: "#d9d9d9",
    marginTop: 8,
    fontSize: 12,
  },
});