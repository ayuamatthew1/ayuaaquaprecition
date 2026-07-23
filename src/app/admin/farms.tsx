import { AdminFarmList } from "@/src/components/adminComponents/AdminFarmList";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminFarmsScreen() {
  const router = useRouter();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { authenticatedFetch } = useAuth()

  const fetchFarms = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await authenticatedFetch(`/api/admin/farms?${params}`);

      if (!response.ok) throw new Error("Failed to fetch farms");

      const json = await response.json();
      if (json.success && json.data) {
        setFarms(json.data.farms);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [page, statusFilter]);

  const handleUpdateFarm = async (farmId: string, data: any) => {
    try {
      const response = await authenticatedFetch(`/api/admin/farms/${farmId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update farm");

      fetchFarms();
    } catch (error) {
      console.error("Error updating farm:", error);
    }
  };

  const handleViewDetails = (farmId: string) => {
    router.push(`admin/farm/${farmId}` as any);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFarms();
  };

  const filteredFarms = farms.filter(
    (farm) =>
      farm.name.toLowerCase().includes(filter.toLowerCase()) ||
      farm.owner.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Farms Management</Text>
          <Text style={styles.subtitle}>Monitor and manage all farms</Text>
        </View>

        <View style={styles.filters}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color="#7f8c8d" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search farms..."
              value={filter}
              onChangeText={setFilter}
              placeholderTextColor="#bdc3c7"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                !statusFilter && styles.statusFilterActive,
              ]}
              onPress={() => setStatusFilter(null)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  !statusFilter && styles.statusFilterTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {["ACTIVE", "INACTIVE", "MAINTENANCE"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilter,
                  statusFilter === status && styles.statusFilterActive,
                ]}
                onPress={() => setStatusFilter(status)}
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
              <ActivityIndicator size="large" color="#27ae60" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              <AdminFarmList
                farms={filteredFarms}
                loading={loading}
                onUpdateFarm={handleUpdateFarm}
                onViewDetails={handleViewDetails}
              />
              {filteredFarms.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="fish" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>No farms found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
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
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#2c3e50",
    fontSize: 14,
  },
  statusFilters: {
    marginTop: 8,
  },
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
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
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
