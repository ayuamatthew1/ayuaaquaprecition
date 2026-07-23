import { AdminGate } from "@/src/components/adminComponents/AdminGate";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AdminAnalyticsScreen() {
  return (
    <AdminGate>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics & Reports</Text>
          <Text style={styles.subtitle}>System analytics and insights</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.comingSoon}>
            <MaterialCommunityIcons name="chart-line" size={64} color="#9b59b6" />
            <Text style={styles.comingSoonTitle}>Analytics Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              Advanced analytics and reporting features will be available soon.
            </Text>
          </View>
        </View>
      </View>
    </AdminGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  content: {
    flex: 1,
  },
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
});
