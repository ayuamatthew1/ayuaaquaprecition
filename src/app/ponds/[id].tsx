import { predictWaterQuality } from "@/src/ai/waterQualityPredictor";
import WaterQualityChart from "@/src/components/WaterQualityChart";
import { recentAlerts } from "@/src/data/alerts";
import { devices } from "@/src/data/device";
import { feedingSchedules } from "@/src/data/feedingSchedules";
import { ponds } from "@/src/data/ponds";
import { sensorReadings } from "@/src/data/sensorReading";
import { theme } from "@/src/theme/theme";
import { calculateWaterQuality } from "@/src/utils/calculateWaterQuality";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PondDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [selectedMetric, setSelectedMetric] = useState<
    | "temperature"
    | "dissolvedOxygen"
    | "ph"
    | "turbidity"
    | "ammonia"
  >("temperature");

  const pond = ponds.find((p) => p.id === id);

  if (!pond) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Pond not found
        </Text>
      </View>
    );
  }

  const device = devices.find(
    (d) => d.id === pond.deviceId
  );

  const pondReadings = sensorReadings.filter((reading) =>
    reading.deviceId === device?.id
  ).sort(
    (a, b) =>
      a.timestamp.getTime() -
      b.timestamp.getTime()
  );

  const metricValues = pondReadings.map(
    (reading) => reading[selectedMetric]
  );

  const average =
    metricValues.reduce(
      (sum, value) => sum + value,
      0
    ) / metricValues.length;

  const highest = Math.max(...metricValues);

  const lowest = Math.min(...metricValues);

  const firstValue = metricValues[0];
  const lastValue =
    metricValues[metricValues.length - 1];

  let trend = "Stable";
  let trendIcon = "→";

  if (lastValue > firstValue) {
    trend = "Increasing";
    trendIcon = "↑";
  }

  if (lastValue < firstValue) {
    trend = "Decreasing";
    trendIcon = "↓";
  }

  const sensor =
    pondReadings[
    pondReadings.length - 1
    ];

  const pondSchedules = feedingSchedules.filter(
    (schedule) => schedule.pondId === pond.id
  );

  const alerts = sensor ? predictWaterQuality(sensor) : [];

  const waterQualityScore = calculateWaterQuality({
    temperature: sensor?.temperature ?? 0,
    dissolvedOxygen: sensor?.dissolvedOxygen ?? 0,
    ammonia: sensor?.ammonia ?? 0,
    turbidity: sensor?.turbidity ?? 0,
    ph: sensor?.ph ?? 0,
  });

  const metricConfig = {
    temperature: {
      title: "Temperature Trend",
      unit: "°C",
    },

    dissolvedOxygen: {
      title: "Dissolved Oxygen Trend",
      unit: " mg/L",
    },

    ph: {
      title: "pH Trend",
      unit: "",
    },

    turbidity: {
      title: "Turbidity Trend",
      unit: " NTU",
    },

    ammonia: {
      title: "Ammonia Trend",
      unit: " mg/L",
    },
  };

  const deviceHealth = device?.status === "ONLINE"
    ? Math.round(
      (device.batteryLevel +
        (device.signalStrength === "STRONG"
          ? 100
          : device.signalStrength === "GOOD"
            ? 80
            : device.signalStrength === "FAIR"
              ? 60
              : 40)) / 2
    ) : 0;

  const pondAlerts = recentAlerts.filter(
    (alert) => alert.pondId === pond.id
  );

  const batteryColor =
    device?.batteryLevel! >= 70
      ? "#4CAF50"
      : device?.batteryLevel! >= 40
        ? "#FFC107"
        : "#F44336";

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <Text style={styles.title}>
        {pond.name}
      </Text>

      <Text style={styles.subtitle}>
        {pond.species}
      </Text>

      {/* Pond Overview */}

      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <Ionicons
            name="fish"
            size={24}
            color={theme.colors.surface}
          />

          <View>
            <Text style={styles.overviewLabel}>
              Fish Population
            </Text>

            <Text style={styles.overviewValue}>
              {pond.fishCount.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.overviewRow}>
          <Ionicons
            name="water"
            size={24}
            color={theme.colors.surface}
          />

          <View>
            <Text style={styles.overviewLabel}>
              Water Volume
            </Text>

            <Text style={styles.overviewValue}>
              {pond.waterVolume.toLocaleString()} L
            </Text>
          </View>
        </View>
      </View>

      {/* Device Information */}

      <Text style={styles.sectionHeading}>
        Device Information
      </Text>
      <View style={styles.deviceCard}>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>
            Serial Number
          </Text>

          <Text style={styles.deviceValue}>
            {device?.serialNumber}
          </Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>
            Status
          </Text>

          <Text
            style={{
              color:
                device?.status === "ONLINE"
                  ? "#4CAF50"
                  : "#F44336",
              fontWeight: "700",
            }}
          >
            {device?.status}
          </Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>
            Battery
          </Text>

          <Text
            style={{
              color: batteryColor,
              fontWeight: "700",
            }}
          >
            {device?.batteryLevel}%
          </Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>
            Signal
          </Text>

          <Text style={styles.deviceValue}>
            {device?.signalStrength}
          </Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>
            Firmware
          </Text>

          <Text style={styles.deviceValue}>
            v{device?.firmwareVersion}
          </Text>
        </View>

        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>
            Device Health
          </Text>

          <Text
            style={{
              color:
                deviceHealth >= 80
                  ? "#4CAF50"
                  : deviceHealth >= 60
                    ? "#FFC107"
                    : "#F44336",

              fontWeight: "700",
            }}
          >
            {deviceHealth}%
          </Text>
        </View>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.sectionTitle}>
          Water Quality Score
        </Text>

        <Text style={[styles.score, { color: waterQualityScore.color }]}>
          {waterQualityScore.score}%
        </Text>

        <Text style={[styles.scoreStatus, { color: waterQualityScore.color }]}>
          {waterQualityScore.score >= 90 ? "Excellent" :
            waterQualityScore.score >= 70 ? "Good" :
              waterQualityScore.score >= 50 ? "Warning" : "Critical"
          }
        </Text>
      </View>

      {/* Water Parameters */}

      <Text style={styles.sectionHeading}>
        Current Water Parameters
      </Text>

      {/* Temperature */}

      <View style={styles.metricCard}>
        <Ionicons
          name="thermometer"
          size={24}
          color={theme.colors.surface}
        />

        <Text style={styles.metricTitle}>
          Temperature
        </Text>

        <Text style={styles.metricValue}>
          {sensor?.temperature} °C
        </Text>
      </View>

      {/* Row 1 */}

      <View style={styles.metricRow}>
        <View
          style={[
            styles.metricCard,
            { flex: 1 },
          ]}
        >
          <Ionicons
            name="water"
            size={24}
            color={theme.colors.surface}
          />

          <Text style={styles.metricTitle}>
            Dissolved Oxygen
          </Text>

          <Text style={styles.metricValue}>
            {sensor?.dissolvedOxygen} mg/L
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { flex: 1 },
          ]}
        >
          <Ionicons
            name="flask"
            size={24}
            color={theme.colors.surface}
          />

          <Text style={styles.metricTitle}>
            pH Level
          </Text>

          <Text style={styles.metricValue}>
            {sensor?.ph}
          </Text>
        </View>
      </View>

      {/* Row 2 */}

      <View style={styles.metricRow}>
        <View
          style={[
            styles.metricCard,
            { flex: 1 },
          ]}
        >
          <Ionicons
            name="color-filter"
            size={24}
            color={theme.colors.surface}
          />

          <Text style={styles.metricTitle}>
            Turbidity
          </Text>

          <Text style={styles.metricValue}>
            {sensor?.turbidity} NTU
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { flex: 1 },
          ]}
        >
          <Ionicons
            name="bar-chart"
            size={24}
            color={theme.colors.surface}
          />

          <Text style={styles.metricTitle}>
            Ammonia
          </Text>

          <Text style={styles.metricValue}>
            {sensor?.ammonia} mg/L
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />

      <Text style={styles.sectionHeading}>
        Today's Feeding Schedule
      </Text>

      {/* Ponds Section */}

      {pondSchedules.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No feeding schedules created.
          </Text>
        </View>
      )}

      {pondSchedules.map((schedule) => (
        <View
          key={schedule.id}
          style={styles.feedCard}
        >
          <View style={styles.feedHeader}>
            <Text style={styles.feedTime}>
              {schedule.time}
            </Text>

            <Text
              style={[
                styles.feedStatus,
                {
                  color: schedule.isCompleted
                    ? "#4CAF50"
                    : "#FFC107",
                },
              ]}
            >
              {schedule.isCompleted
                ? "Completed"
                : "Upcoming"}
            </Text>
          </View>

          <Text style={styles.feedType}>
            {schedule.feedType}
          </Text>

          <Text style={styles.feedQuantity}>
            {schedule.quantity} {schedule.unit}
          </Text>

          <Text style={styles.feedDays}>
            {schedule.repeatDays.join(", ")}
          </Text>
        </View>
      ))}

      {/* AI Recommendations */}

      <Text style={styles.sectionHeading}>
        AI Recommendations
      </Text>

      {alerts.length === 0 && (
        <View style={styles.aiCard}>
          <Ionicons
            name="checkmark-circle"
            size={30}
            color="#4CAF50"
          />

          <Text style={styles.aiTitle}>
            Water Quality is Excellent
          </Text>

          <Text style={styles.aiText}>
            All monitored parameters are within
            recommended ranges.
          </Text>
        </View>
      )}

      {alerts.map((item, index) => (
        <View
          key={index}
          style={styles.aiCard}
        >
          <View style={styles.aiHeader}>
            <Ionicons
              name="warning"
              size={22}
              color={
                item.severity === "HIGH"
                  ? "#F44336"
                  : "#FFC107"
              }
            />

            <Text style={styles.aiTitle}>
              {item.alert}
            </Text>
          </View>

          <Text style={styles.aiText}>
            {item.recommendation}
          </Text>

          <View
            style={[
              styles.severityBadge,
              {
                backgroundColor:
                  item.severity === "HIGH"
                    ? "#F44336"
                    : "#FFC107",
              },
            ]}
          >
            <Text style={styles.severityText}>
              {item.severity} RISK
            </Text>
          </View>
        </View>
      ))}

      {/* Metric Selection */}
      <Text style={styles.sectionHeading}>
        Water Quality Trends
      </Text>
      <View style={styles.metricSelector}>
        <TouchableOpacity
          style={[
            styles.metricChip,
            selectedMetric === "temperature" &&
            styles.activeMetricChip,
          ]}
          onPress={() =>
            setSelectedMetric("temperature")
          }
        >
          <Text
            style={[
              styles.metricChipText,
              selectedMetric === "temperature" &&
              styles.activeMetricChipText,
            ]}
          >
            Temp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metricChip,
            selectedMetric ===
            "dissolvedOxygen" &&
            styles.activeMetricChip,
          ]}
          onPress={() =>
            setSelectedMetric(
              "dissolvedOxygen"
            )
          }
        >
          <Text
            style={[
              styles.metricChipText,
              selectedMetric ===
              "dissolvedOxygen" &&
              styles.activeMetricChipText,
            ]}
          >
            DO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metricChip,
            selectedMetric === "ph" &&
            styles.activeMetricChip,
          ]}
          onPress={() =>
            setSelectedMetric("ph")
          }
        >
          <Text
            style={[
              styles.metricChipText,
              selectedMetric === "ph" &&
              styles.activeMetricChipText,
            ]}
          >
            pH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metricChip,
            selectedMetric ===
            "turbidity" &&
            styles.activeMetricChip,
          ]}
          onPress={() =>
            setSelectedMetric(
              "turbidity"
            )
          }
        >
          <Text
            style={[
              styles.metricChipText,
              selectedMetric ===
              "turbidity" &&
              styles.activeMetricChipText,
            ]}
          >
            Turbidity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.metricChip,
            selectedMetric ===
            "ammonia" &&
            styles.activeMetricChip,
          ]}
          onPress={() =>
            setSelectedMetric(
              "ammonia"
            )
          }
        >
          <Text
            style={[
              styles.metricChipText,
              selectedMetric ===
              "ammonia" &&
              styles.activeMetricChipText,
            ]}
          >
            Ammonia
          </Text>
        </TouchableOpacity>
      </View>

      <WaterQualityChart
        title={
          metricConfig[selectedMetric]
            .title
        }
        readings={pondReadings}
        metric={selectedMetric}
        unit={
          metricConfig[selectedMetric]
            .unit
        }
      />

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>
          Analytics Summary
        </Text>

        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>
              Average
            </Text>

            <Text style={styles.analyticsValue}>
              {average.toFixed(1)}
              {
                metricConfig[selectedMetric]
                  .unit
              }
            </Text>
          </View>

          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>
              Highest
            </Text>

            <Text style={styles.analyticsValue}>
              {highest.toFixed(1)}
              {
                metricConfig[selectedMetric]
                  .unit
              }
            </Text>
          </View>

          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>
              Lowest
            </Text>

            <Text style={styles.analyticsValue}>
              {lowest.toFixed(1)}
              {
                metricConfig[selectedMetric]
                  .unit
              }
            </Text>
          </View>

          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsLabel}>
              Trend
            </Text>

            <Text
              style={[
                styles.analyticsValue,
                {
                  color:
                    trend === "Increasing"
                      ? "#4CAF50"
                      : trend ===
                        "Decreasing"
                        ? "#F44336"
                        : "#FFC107",
                },
              ]}
            >
              {trendIcon} {trend}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeading}>
        Recent Alerts
      </Text>

      {pondAlerts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No recent alerts.
          </Text>
        </View>
      ) : (
        pondAlerts.map((alert) => (
          <View
            key={alert.id}
            style={styles.alertCard}
          >
            <View style={styles.alertHeader}>
              <Text
                style={[
                  styles.alertSeverity,
                  {
                    color:
                      alert.severity === "HIGH"
                        ? "#F44336"
                        : alert.severity ===
                          "MEDIUM"
                          ? "#FFC107"
                          : "#4CAF50",
                  },
                ]}
              >
                {alert.severity}
              </Text>

              <Text style={styles.alertDate}>
                {alert.createdAt.toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.alertTitle}>
              {alert.title}
            </Text>

            <Text
              style={styles.alertDescription}
            >
              {alert.description}
            </Text>

            <Text
              style={{
                color: alert.resolved
                  ? "#4CAF50"
                  : "#F44336",
                marginTop: 10,
                fontWeight: "700",
              }}
            >
              {alert.resolved
                ? "Resolved"
                : "Active"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.surface,
  },

  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 24,
  },

  overviewCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  overviewLabel: {
    color: "#bbb",
    fontSize: 14,
  },

  overviewValue: {
    color: theme.colors.surface,
    fontSize: 22,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 20,
  },

  sectionHeading: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  deviceCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  deviceLabel: {
    color: "#bbb",
  },

  deviceValue: {
    color: theme.colors.surface,
    fontWeight: "600",
  },

  scoreCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "600",
  },

  score: {
    fontSize: 48,
    fontWeight: "700",
    color: "#1eeb25",
    marginTop: 12,
  },

  scoreStatus: {
    color: "#1eeb25",
    fontWeight: "700",
  },

  metricRow: {
    flexDirection: "row",
    gap: 16,
  },

  metricCard: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  metricTitle: {
    color: theme.colors.surface,
    marginTop: 10,
  },

  metricValue: {
    color: theme.colors.surface,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },

  error: {
    color: theme.colors.surface,
    fontSize: 20,
  },

  feedCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  feedTime: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },

  feedStatus: {
    fontWeight: "700",
  },

  feedType: {
    color: theme.colors.surface,
    marginTop: 12,
    fontSize: 16,
  },

  feedQuantity: {
    color: theme.colors.surface,
    fontWeight: "700",
    fontSize: 22,
    marginTop: 4,
  },

  feedDays: {
    color: "#aaa",
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: theme.colors.secondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },

  emptyText: {
    color: "#aaa",
    textAlign: "center",
  },

  aiCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  aiTitle: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },

  aiText: {
    color: "#ccc",
    marginTop: 12,
    lineHeight: 22,
  },

  severityBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  severityText: {
    color: "#fff",
    fontWeight: "700",
  },

  metricSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  metricChip: {
    backgroundColor:
      theme.colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeMetricChip: {
    backgroundColor:
      theme.colors.primary,
  },

  metricChipText: {
    color: theme.colors.surface,
    fontWeight: "600",
  },

  activeMetricChipText: {
    color: "#fff",
  },

  analyticsCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 36,
  },

  analyticsTitle: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  analyticsItem: {
    width: "48%",
  },

  analyticsLabel: {
    color: "#999",
    fontSize: 14,
  },

  analyticsValue: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  alertCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  alertSeverity: {
    fontWeight: "700",
  },

  alertDate: {
    color: "#999",
  },

  alertTitle: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  alertDescription: {
    color: "#ccc",
    marginTop: 6,
    lineHeight: 22,
  },
});