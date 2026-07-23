import { DashboardOverview } from "@/src/components/adminComponents/AdminDashboardOverview";
import { useAdminAccess } from "@/src/components/adminComponents/AdminGate";
import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DashboardStats {
  totalUsers?: number;
  activeFarms?: number;
  totalPonds?: number;
  onlineDevices?: number;
  criticalAlerts?: number;
  totalSubscriptions?: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { hasAccess, user, isLoading } = useAdminAccess();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { authenticatedFetch } = useAuth()

  const fetchDashboardData = async () => {
    try {
      const response = await authenticatedFetch("/api/admin/dashboard");

      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const json = await response.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchDashboardData();
    }
  }, [hasAccess]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleStatPress = (stat: string) => {
    const routes: Record<string, string> = {
      users: "admin/users",
      farms: "admin/farms",
      ponds: "admin/ponds",
      devices: "admin/devices",
      alerts: "admin/alerts",
      subscriptions: "admin/subscriptions",
    };

    if (routes[stat]) {
      router.push(routes[stat] as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.container} />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, {user?.firstName}! 👋
            </Text>
            <Text style={styles.role}>{user?.role} Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("(tabs)/settings" as any)}
          >
            <MaterialCommunityIcons name="account-circle" size={32} color="#3498db" />
          </TouchableOpacity>
        </View>

        <DashboardOverview stats={stats} loading={loading} onStatPress={handleStatPress} />

        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <QuickAccessButton
              icon="account-multiple"
              label="Users"
              color="#3498db"
              onPress={() => router.push("admin/users" as any)}
            />
            <QuickAccessButton
              icon="farm"
              label="Farms"
              color="#27ae60"
              onPress={() => router.push("admin/farms" as any)}
            />
            <QuickAccessButton
              icon="alert-circle"
              label="Alerts"
              color="#e74c3c"
              onPress={() => router.push("admin/alerts" as any)}
            />
            <QuickAccessButton
              icon="wifi"
              label="Devices"
              color="#2980b9"
              onPress={() => router.push("admin/devices" as any)}
            />
            <QuickAccessButton
              icon="credit-card"
              label="Subscriptions"
              color="#f39c12"
              onPress={() => router.push("admin/subscriptions" as any)}
            />
            <QuickAccessButton
              icon="chart-line"
              label="Analytics"
              color="#9b59b6"
              onPress={() => router.push("admin/analytics" as any)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface QuickAccessButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({
  icon,
  label,
  color,
  onPress,
}) => (
  <TouchableOpacity style={styles.quickAccessButton} onPress={onPress}>
    <View style={[styles.quickAccessIconBox, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon as any} size={28} color="#fff" />
    </View>
    <Text style={styles.quickAccessLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  profileButton: {
    padding: 8,
  },
  quickAccessSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  quickAccessButton: {
    width: "31%",
    alignItems: "center",
  },
  quickAccessIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
});
