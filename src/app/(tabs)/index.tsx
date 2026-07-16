import { predictWaterQuality } from "@/src/ai/waterQualityPredictor";
import AIRiskAnalysisCard from "@/src/components/AIAnalysisCard";
import SensorCard from "@/src/components/SensorCard";
import WaterQualitySummary from "@/src/components/WaterQualitySummary";
import { useAuth } from "@/src/context/AuthContext";
import { calculateWaterQuality } from "@/src/utils/calculateWaterQuality";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme/theme";

type DashboardReading = {
  id: string;
  deviceId: string;
  pondId: string;
  pondName: string;
  temperature: number;
  ph: number;
  dissolvedOxygen: number;
  turbidity: number;
  ammonia: number | null;
  recordedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export default function DashboardScreen() {
  const { authenticatedFetch } = useAuth();
  const [reading, setReading] = useState<DashboardReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await authenticatedFetch("/api/dashboard");
      const result: ApiResponse<DashboardReading | null> = await response.json();
      console.log("Dashboard API response:", result);
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to load dashboard data.");
      }

      setReading(result.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={theme.colors.surface} /></View>;
  }

  if (error || !reading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>{error ? "Dashboard unavailable" : "No sensor readings yet"}</Text>
        <Text style={styles.emptyText}>
          {error ?? "Connect a device to one of your ponds and send a reading to populate this dashboard."}
        </Text>

        {!error && (
          <TouchableOpacity style={styles.createButton} onPress={() => router.push("/ponds/create")}>
            <Ionicons name="add" size={20} color={theme.colors.surface} />
            <Text style={styles.createButtonText}>Create pond</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const data = { ...reading, timestamp: new Date(reading.recordedAt) };
  const waterQuality = calculateWaterQuality(data);
  const predictions = predictWaterQuality(data);
  const riskLevel = predictions.some((prediction) => prediction.severity === "HIGH")
    ? "High"
    : predictions.some((prediction) => prediction.severity === "MEDIUM")
      ? "Medium"
      : "Low";
  const recommendation = predictions[0]?.recommendation ?? "All monitored water parameters are within their configured ranges.";

  const sensors = [
    {
      title: "Dissolved Oxygen",
      value: data.dissolvedOxygen,
      unit: "mg/L",
      idealRange: "> 5 mg/L",
      status: data.dissolvedOxygen >= 5 ? "good" : "danger",
      icon: "water",
    },
    {
      title: "Temperature",
      value: data.temperature,
      unit: "°C",
      idealRange: "24-30 °C",
      status: data.temperature >= 24 && data.temperature <= 30 ? "good" : "warning",
      icon: "thermometer",
    },
    {
      title: "Ammonia",
      value: data.ammonia ?? "—",
      unit: data.ammonia === null ? "" : "mg/L",
      idealRange: "< 0.02 mg/L",
      status: data.ammonia === null ? "warning" : data.ammonia <= 0.02 ? "good" : data.ammonia <= 0.05 ? "warning" : "danger",
      icon: "bar-chart",
    },
    {
      title: "Turbidity",
      value: data.turbidity,
      unit: "NTU",
      idealRange: "< 25 NTU",
      status: data.turbidity < 25 ? "good" : data.turbidity < 50 ? "warning" : "danger",
      icon: "color-filter",
    },
    {
      title: "pH Level",
      value: data.ph,
      unit: "",
      idealRange: "6.5–8.5",
      status: data.ph >= 6.5 && data.ph <= 8.5 ? "good" : "warning",
      icon: "flask",
    },
  ] as const;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Ayua Aquaprecition</Text>
          <Text style={styles.subtitle}>{reading.pondName} Monitoring Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.createIconButton} onPress={() => router.push("/ponds/create")} accessibilityLabel="Create pond">
          <Ionicons name="add" size={24} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>
      <Text style={styles.timestamp}>{data.timestamp.toDateString()}</Text>
      <WaterQualitySummary
        score={waterQuality.score}
        status={waterQuality.status}
        color={waterQuality.color}
        updatedAt={data.timestamp}
      />

      <View style={styles.primaryCard}>
        <SensorCard
          title={sensors[0].title}
          value={sensors[0].value}
          unit={sensors[0].unit}
          idealRange={sensors[0].idealRange}
          status={sensors[0].status}
          icon={<Ionicons name={sensors[0].icon} size={24} color={theme.colors.surface} />}
        />
      </View>

      <View style={styles.grid}>
        {sensors.slice(1).map((sensor) => (
          <View key={sensor.title} style={styles.gridItem}>
            <SensorCard
              title={sensor.title}
              value={sensor.value}
              unit={sensor.unit}
              idealRange={sensor.idealRange}
              status={sensor.status}
              icon={<Ionicons name={sensor.icon} size={24} color={theme.colors.surface} />}
            />
          </View>
        ))}
        <AIRiskAnalysisCard
          riskLevel={riskLevel}
          alertCount={predictions.length}
          recommendation={recommendation}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  emptyTitle: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: theme.colors.surface,
    opacity: 0.75,
    textAlign: "center",
    lineHeight: 21,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  createButtonText: {
    color: theme.colors.surface,
    fontWeight: "700",
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  createIconButton: {
    backgroundColor: theme.colors.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  timestamp: {
    fontSize: 14,
    color: theme.colors.accent2,
    marginBottom: 24,
    fontWeight: "700",
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
  },
  primaryCard: {
    marginBottom: 15,
    marginTop: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "48%",
    marginBottom: 10,
  },
});
