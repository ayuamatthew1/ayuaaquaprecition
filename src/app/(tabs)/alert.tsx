import { predictWaterQuality } from "@/src/ai/waterQualityPredictor";
import AlertComponent from "@/src/components/AlertComponent";
import { sensorData } from "@/src/data/sensorData";
import { theme } from "@/src/theme/theme";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function AlertsScreen() {
  const data = sensorData;
  const res = predictWaterQuality(data);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>Alerts & Recommendations</Text>
      {res.map((r, i) => (
        <AlertComponent
          key={i}
          recommendation={r.recommendations}
          alert={r.alert}
        />
      ))}
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
