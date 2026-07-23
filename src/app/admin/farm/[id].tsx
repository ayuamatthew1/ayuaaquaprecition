import { AdminGate } from "@/src/components/adminComponents/AdminGate";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminFarmDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFarmDetails = async () => {
    try {
      const response = await fetch(`/api/admin/farms/${id}/overview`, {
        headers: {
          Authorization: `Bearer ${await getStoredToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch farm details");

      const json = await response.json();
      if (json.success && json.data) {
        setFarm(json.data);
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStoredToken = async () => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("auth_access_token") || "";
    }
    return "";
  };

  useEffect(() => {
    if (id) {
      fetchFarmDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <AdminGate>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </AdminGate>
    );
  }

  if (!farm) {
    return (
      <AdminGate>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.title}>Farm Details</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Text>Farm not found</Text>
          </View>
        </View>
      </AdminGate>
    );
  }

  return (
    <AdminGate>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>{farm.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Ponds</Text>
                <Text style={styles.statValue}>{farm.stats?.totalPonds || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Active Ponds</Text>
                <Text style={styles.statValue}>{farm.stats?.activePonds || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Online Devices</Text>
                <Text style={styles.statValue}>{farm.stats?.onlineDevices || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Active Alerts</Text>
                <Text style={styles.statValue}>{farm.stats?.activeAlerts || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Information</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Owner</Text>
              <Text style={styles.infoValue}>
                {farm.owner?.firstName} {farm.owner?.lastName}
              </Text>
            </View>
            {farm.description && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue}>{farm.description}</Text>
              </View>
            )}
            {farm.address && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {farm.address}, {farm.city}, {farm.state}
                </Text>
              </View>
            )}
          </View>

          {farm.ponds && farm.ponds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ponds ({farm.ponds.length})</Text>
              {farm.ponds.map((pond: any) => (
                <View key={pond.id} style={styles.pondCard}>
                  <View style={styles.pondHeader}>
                    <Text style={styles.pondName}>{pond.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: pond.status === "ACTIVE" ? "#27ae60" : "#95a5a6",
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{pond.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.pondType}>Type: {pond.type}</Text>
                  <View style={styles.pondStats}>
                    <Text style={styles.pondStat}>🐟 {pond.fishBatches?.[0]?.quantity || 0}</Text>
                    <Text style={styles.pondStat}>💧 {pond.capacity}L</Text>
                    <Text style={styles.pondStat}>
                      {pond.device?.status === "ONLINE" ? "📡 Online" : "📡 Offline"}
                    </Text>
                  </View>
                </View>
              ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  infoBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  infoLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  pondCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  pondHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pondName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  pondType: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  pondStats: {
    flexDirection: "row",
    gap: 12,
  },
  pondStat: {
    fontSize: 12,
    color: "#2c3e50",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
