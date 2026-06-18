import { predictWaterQuality } from "@/src/ai/waterQualityPredictor";
import AIRiskAnalysisCard from "@/src/components/AIAnalysisCard";
import SensorCard from "@/src/components/SensorCard";
import WaterQualitySummary from "@/src/components/WaterQualitySummary";
import { sensorData, sensors } from "@/src/data/sensorData";
import { calculateWaterQuality } from "@/src/utils/calculateWaterQuality";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme/theme";

export default function DashboardScreen() {

  const data = sensorData;

  const waterQuality = calculateWaterQuality(data);

  // const res = predictWaterQuality(data);

  // PREDICTION LOGIC
  const predictions = predictWaterQuality(data);

  const riskLevel = predictions.some(
    (p) => p.severity === "high"
  )
    ? "High"
    : predictions.some(
      (p) => p.severity === "medium"
    )
      ? "Medium"
      : "Low";


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ayua Aquaprecition</Text>
      <Text style={styles.subtitle}>Hatchery Monitoring Dashboard</Text>
      <Text style={styles.timestamp}>{new Date().toDateString()}</Text>
      <WaterQualitySummary
        score={waterQuality.score}
        status={waterQuality.status}
        color={waterQuality.color}
        updatedAt={data.timestamp}
      />

      <View style={{ marginBottom: 15, marginTop: 15 }}>
        <SensorCard
          title={sensors[0].title}
          value={sensors[0].value}
          unit={sensors[0].unit}
          idealRange={sensors[0].idealRange}
          status={sensors[0].status}
          icon={
            <Ionicons
              name={sensors[0].icon}
              size={24}
              color={theme.colors.surface}
            />
          }
        />
      </View>

      {/* Two-column layout for the remaining cards */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {sensors.slice(1).map((sensor) => (
          <View
            key={sensor.title}
            style={{
              width: "48%",
              marginBottom: 10,
            }}
          >
            <SensorCard
              title={sensor.title}
              value={sensor.value}
              unit={sensor.unit}
              idealRange={sensor.idealRange}
              status={sensor.status}
              icon={
                <Ionicons
                  name={sensor.icon}
                  size={24}
                  color={theme.colors.surface}
                />
              }
            />
          </View>
        ))}

        <AIRiskAnalysisCard
          riskLevel={riskLevel}
          alertCount={predictions.length}
          recommendation={predictions[0].recommendations}
        />
      </View>

      {/* <View style={styles.card}>
        <Ionicons name="water" size={24} color={theme.colors.surface} />
        <Text style={styles.metricTitle}>Dissolved Oxygen</Text>
        <Text style={styles.metricValue}>{data.dissolvedOxygen} mg/L</Text>
      </View>

      

      <View
        style={styles.cardContainer}
      >
        <View style={[styles.card, { flex: 1 }]}>
          <Ionicons name="bar-chart" size={24} color={theme.colors.surface} />
          <Text style={styles.metricTitle}>Ammonia</Text>
          <Text style={styles.metricValue}>{data.ammonia} mg/L</Text>
        </View>
      </View>


      <View
        style={styles.cardContainer}
      >
        <View style={[styles.card, { flex: 1 }]}>
          <Ionicons
            name="color-filter"
            size={24}
            color={theme.colors.surface}
          />
          <Text style={styles.metricTitle}>Turbidity</Text>
          <Text style={styles.metricValue}>{data.turbidity} NTU</Text>
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Ionicons
            name="flask"
            size={24}
            color={theme.colors.surface}
          />
          <Text style={styles.metricTitle}>pH Level</Text>
          <Text style={styles.metricValue}>{data.ph}</Text>
        </View> 
      </View>*/}
      {/* <View style={{ marginBottom: 40 }}>
        <AlertComponent
          recommendation={res[0].recommendations}
          alert={res[0].alert}
        />
      </View> */}
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
    // marginBottom: 24,
  },

  cardContainer: {
    flexDirection: "row",
    gap: 16,
  },

  card: {
    backgroundColor: theme.colors.secondary,
    padding: 10,
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
