import { predictWaterQuality } from "@/src/ai/waterQualityPredictor";
import AlertCenter from "@/src/components/AlertCenter";
import { sensorData } from "@/src/data/sensorData";
import { theme } from "@/src/theme/theme";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function AlertsScreen() {
  const data = sensorData;
  const predictions = predictWaterQuality(data);

  const sortedAlerts = [...predictions].sort((a, b) => {
    const order = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return order[b.severity] - order[a.severity];
  });

  return (
    <ScrollView style={styles.container}>
      <AlertCenter alerts={sortedAlerts} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 10,
    backgroundColor: theme.colors.background,
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 15,
    textAlign: "center",
    color: theme.colors.text,
  },
});
