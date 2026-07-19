import { AlertSeverity, AlertStatus } from "@/prisma/generated/prisma/enums";
import { AdminAlertList } from "@/src/components/AdminAlertList";
import { AdminGate } from "@/src/components/AdminGate";
import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function AdminAlertsScreen() {
  const { authenticatedFetch } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | null>(null);
  const [statusFilter, setStatusFilter] = useState<AlertStatus>("ACTIVE");

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams({
        limit: "500",
        ...(severityFilter && { severity: severityFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await authenticatedFetch(`/api/admin/alerts?${params}`);

      if (!response.ok) throw new Error("Failed to fetch alerts");

      const json = await response.json();
      if (json.success && json.data) {
        setAlerts(json.data.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const handleUpdateAlert = async (alertId: string, action: string) => {
    try {
      const response = await authenticatedFetch(`/api/admin/alerts/${alertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Failed to update alert");

      fetchAlerts();
    } catch (error) {
      console.error("Error updating alert:", error);
    }
  };

  const handleBatchUpdate = async (alertIds: string[], action: string) => {
    try {
      const response = await authenticatedFetch("/api/admin/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertIds, action }),
      });

      if (!response.ok) throw new Error("Failed to batch update alerts");

      fetchAlerts();
    } catch (error) {
      console.error("Error batch updating alerts:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const highCount = alerts.filter((a) => a.severity === "HIGH").length;

  return (
    <AdminGate>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Alert Management</Text>
            <Text style={styles.subtitle}>Monitor and manage system alerts</Text>
          </View>
          {(criticalCount > 0 || highCount > 0) && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{criticalCount + highCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Filter by Severity:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.severityFilters}>
            <TouchableOpacity
              style={[
                styles.severityFilter,
                !severityFilter && styles.severityFilterActive,
              ]}
              onPress={() => setSeverityFilter(null)}
            >
              <Text
                style={[
                  styles.severityFilterText,
                  !severityFilter && styles.severityFilterTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {["CRITICAL", "HIGH", "WARNING", "INFO"].map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.severityFilter,
                  severityFilter === severity && styles.severityFilterActive,
                ]}
                onPress={() => setSeverityFilter(severity as AlertSeverity)}
              >
                <Text
                  style={[
                    styles.severityFilterText,
                    severityFilter === severity && styles.severityFilterTextActive,
                  ]}
                >
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Filter by Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            {["ACTIVE", "ACKNOWLEDGED", "RESOLVED"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilter,
                  statusFilter === status && styles.statusFilterActive,
                ]}
                onPress={() => setStatusFilter(status as AlertStatus)}
              >
                <Text
                  style={[
                    styles.statusFilterText,
                    statusFilter === status && styles.statusFilterTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e74c3c" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              <AdminAlertList
                alerts={alerts}
                loading={loading}
                onUpdateAlert={handleUpdateAlert}
                onBatchUpdate={handleBatchUpdate}
              />
              {alerts.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="alert" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>No alerts found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  alertBadge: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  alertBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 8,
  },
  severityFilters: {
    marginBottom: 8,
  },
  severityFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ecf0f1",
    marginRight: 8,
  },
  severityFilterActive: {
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
  },
  severityFilterText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "600",
  },
  severityFilterTextActive: {
    color: "#fff",
  },
  statusFilters: {},
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ecf0f1",
    marginRight: 8,
  },
  statusFilterActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  statusFilterText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "600",
  },
  statusFilterTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
  },
});
