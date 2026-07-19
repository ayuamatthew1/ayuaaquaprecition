import { AdminGate } from "@/src/components/AdminGate";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function AdminPondsScreen() {
  const [ponds, setPonds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPonds = async () => {
    try {
      // This would typically fetch all ponds across all farms
      // For now, we'll show a simplified view
      setPonds([]);
    } catch (error) {
      console.error("Error fetching ponds:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPonds();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPonds();
  };

  return (
    <AdminGate>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pond Management</Text>
          <Text style={styles.subtitle}>Monitor all ponds across farms</Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2980b9" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              <View style={styles.comingSoon}>
                <MaterialCommunityIcons name="water-opacity" size={64} color="#2980b9" />
                <Text style={styles.comingSoonTitle}>Pond View Coming Soon</Text>
                <Text style={styles.comingSoonText}>
                  Use the Farms view to see pond details for each farm.
                </Text>
              </View>
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
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonText: {
    fontSize: 13,
    color: "#7f8c8d",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
