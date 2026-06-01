import { predictWaterQuality } from "@/src/ai/waterQualityPredictor";
import AlertComponent from "@/src/components/AlertComponent";
import { sensorData } from "@/src/data/sensorData";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme/theme";

export default function DashboardScreen() {
  const data = sensorData;

  const res = predictWaterQuality(data);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ayua Aquaprecition</Text>
      <Text style={styles.subtitle}>Hatchery Monitoring Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.metricTitle}>Dissolved Oxygen</Text>
        <Text style={styles.metricValue}>{data.dissolvedOxygen}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricTitle}>Temperature</Text>
        <Text style={styles.metricValue}>{data.temperature}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricTitle}>pH Level</Text>
        <Text style={styles.metricValue}>{data.ph}</Text>
      </View>
      <View style={{ marginBottom: 40 }}>
        <AlertComponent
          recommendation={res[0].recommendations}
          alert={res[0].alert}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.surface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.surface,
    marginBottom: 24,
  },

  card: {
    backgroundColor: theme.colors.secondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },

  metricTitle: {
    fontSize: 16,
    color: theme.colors.surface,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.surface,
  },
});
