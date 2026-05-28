import { StyleSheet, Text, View } from "react-native";
interface AlertComponentProps {
  alert: string;
  recommendation: string;
}

export default function AlertComponent({
  alert,
  recommendation,
}: AlertComponentProps) {
  return (
    <View style={styles.alertContainer}>
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>Alert</Text>
        <Text style={styles.alertText}>{alert}</Text>
      </View>
      <View style={styles.recomCard}>
        <Text style={styles.recomTitle}>Recommendations</Text>
        <Text style={styles.recomText}>{recommendation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: "#ffdad6",
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#93000a",
    marginBottom: 8,
  },

  alertText: {
    color: "#93000a",
    fontSize: 16,
  },

  recomCard: {
    backgroundColor: "#e9e9d2",
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
  },
  recomTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#02c629",
    marginBottom: 8,
  },
  recomText: {
    color: "#25cf18",
    fontSize: 16,
  },
  alertContainer: {
    backgroundColor: "#9acca4",
    padding: 8,
    borderRadius: 16,
    marginBottom: 10,
  },
});
