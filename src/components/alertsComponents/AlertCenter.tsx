import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AlertItem from "./AlertItem";
import { theme } from "@/src/theme/theme";

interface Alert {
  alert: string;
  recommendation: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

interface Props {
  alerts: Alert[];
}

export default function AlertCenter({
  alerts,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        AI Alerts & Recommendations
      </Text>

      {alerts.map((item, index) => (
        <AlertItem
          key={index}
          alert={item.alert}
          recommendation={item.recommendation}
          severity={item.severity}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 40,
  },

  title: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
});