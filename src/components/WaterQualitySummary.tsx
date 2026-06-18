import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  score: number;
  status: string;
  color: string;
  updatedAt: Date;
}

export default function WaterQualitySummary({
  score,
  status,
  color,
  updatedAt,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="shield-checkmark"
          size={30}
          color={color}
        />

        <View>
          <Text style={styles.title}>
            Water Quality Status
          </Text>

          <Text
            style={[
              styles.status,
              {
                color,
              },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.score}>
        {score}/100
      </Text>

      <Text style={styles.scoreLabel}>
        Health Score
      </Text>

      <Text style={styles.timestamp}>
        Updated:
      </Text>

      <Text style={styles.timestampValue}>
        {updatedAt.toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.secondary,
    padding: 20,
    borderRadius: 20,
    marginVertical: 20,
    // borderBottomStyle: 12, 'solid', 'white',
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  title: {
    color: theme.colors.surface,
    fontSize: 16,
  },

  status: {
    fontSize: 24,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#ffffff50",
    marginVertical: 16,
  },

  score: {
    color: theme.colors.surface,
    fontSize: 42,
    fontWeight: "700",
  },

  scoreLabel: {
    color: theme.colors.surface,
    opacity: 0.7,
  },

  timestamp: {
    color: theme.colors.surface,
    marginTop: 12,
    opacity: 0.7,
  },

  timestampValue: {
    color: theme.colors.surface,
    fontWeight: "600",
  },
});