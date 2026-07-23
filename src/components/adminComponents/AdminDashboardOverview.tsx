import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.label}>{label}</Text>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
  );
};

interface DashboardOverviewProps {
  stats: {
    totalUsers?: number;
    activeFarms?: number;
    totalPonds?: number;
    onlineDevices?: number;
    criticalAlerts?: number;
    totalSubscriptions?: number;
  };
  loading?: boolean;
  onStatPress?: (stat: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  loading = false,
  onStatPress,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Dashboard Overview</Text>

      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.cardWrapper}>
            <StatCard
              label="Total Users"
              value={stats.totalUsers || 0}
              icon="account-multiple"
              color="#3498db"
              onPress={() => onStatPress?.("users")}
            />
          </View>
          <View style={styles.cardWrapper}>
            <StatCard
              label="Active Farms"
              value={stats.activeFarms || 0}
              icon="farm"
              color="#27ae60"
              onPress={() => onStatPress?.("farms")}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.cardWrapper}>
            <StatCard
              label="Total Ponds"
              value={stats.totalPonds || 0}
              icon="water"
              color="#2980b9"
              onPress={() => onStatPress?.("ponds")}
            />
          </View>
          <View style={styles.cardWrapper}>
            <StatCard
              label="Online Devices"
              value={stats.onlineDevices || 0}
              icon="wifi"
              color="#16a085"
              onPress={() => onStatPress?.("devices")}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.cardWrapper}>
            <StatCard
              label="Critical Alerts"
              value={stats.criticalAlerts || 0}
              icon="alert-circle"
              color={stats.criticalAlerts && stats.criticalAlerts > 0 ? "#e74c3c" : "#95a5a6"}
              onPress={() => onStatPress?.("alerts")}
            />
          </View>
          <View style={styles.cardWrapper}>
            <StatCard
              label="Active Subscriptions"
              value={stats.totalSubscriptions || 0}
              icon="credit-card"
              color="#f39c12"
              onPress={() => onStatPress?.("subscriptions")}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  grid: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
    flex: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
