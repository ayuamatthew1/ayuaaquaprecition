import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/theme";

interface Props {
  riskLevel: "Low" | "Medium" | "High";
  alertCount: number;
  recommendation: string;
}

export default function AIRiskAnalysisCard({
  riskLevel,
  alertCount,
  recommendation,
}: Props) {
  const riskColor =
    riskLevel === "High"
      ? "#F44336"
      : riskLevel === "Medium"
        ? "#FFC107"
        : "#4CAF50";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="sparkles"
          size={24}
          color={riskColor}
        />

        <Text style={styles.title}>
          AI Risk Analysis
        </Text>
        <Link href="/(tabs)/alert">
          <Text style={styles.link}>View Details</Text>
        </Link>
      </View>

      <Text
        style={[
          styles.riskLevel,
          { color: riskColor },
        ]}
      >
        {riskLevel} Risk
      </Text>

      <Text style={styles.text}>
        Active Alerts: {alertCount}
      </Text>

      <Text style={styles.subtitle}>
        Recommended Action
      </Text>

      <Text style={styles.text}>
        {recommendation}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    width: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  title: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "600",
  },

  riskLevel: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },

  subtitle: {
    color: theme.colors.surface,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },

  text: {
    color: theme.colors.surface,
    lineHeight: 22,
  },

  link: {
    color: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: 5,
    borderRadius: 8,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    backgroundColor: theme.colors.surface,
    marginLeft: "auto",
  },
});