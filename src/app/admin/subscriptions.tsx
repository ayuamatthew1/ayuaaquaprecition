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

interface Subscription {
  id: string;
  plan: string;
  status: string;
  billingCycle: string;
  startsAt: string;
  endsAt: string;
  daysRemaining: number;
  farm: {
    id: string;
    name: string;
    owner: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function AdminSubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { authenticatedFetch } = useAuth()

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams({
        limit: "20",
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await authenticatedFetch(`/api/admin/subscriptions?${params}`);

      if (!response.ok) throw new Error("Failed to fetch subscriptions");

      const json = await response.json();
      if (json.success && json.data) {
        setSubscriptions(json.data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#27ae60";
      case "TRIAL":
        return "#3498db";
      case "EXPIRED":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return "#e74c3c"; // Expired
    if (days < 7) return "#e67e22"; // Warning
    return "#27ae60"; // Good
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>Manage user subscriptions and billing</Text>
        </View>

        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Filter by Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                !statusFilter && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(null)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  !statusFilter && styles.filterButtonTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.filterButtonActive,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    statusFilter === status && styles.filterButtonTextActive,
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
              <ActivityIndicator size="large" color="#f39c12" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              {subscriptions.map((subscription) => (
                <View key={subscription.id} style={styles.subscriptionCard}>
                  <View style={styles.subscriptionHeader}>
                    <View style={styles.subscriptionInfo}>
                      <Text style={styles.farmName}>{subscription.farm.name}</Text>
                      <Text style={styles.ownerName}>
                        {subscription.farm.owner.firstName} {subscription.farm.owner.lastName}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) }]}>
                      <Text style={styles.statusText}>{subscription.status}</Text>
                    </View>
                  </View>

                  <View style={styles.subscriptionDetails}>
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>Plan:</Text>
                      <Text style={styles.detailValue}>{subscription.plan}</Text>
                    </View>
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>Cycle:</Text>
                      <Text style={styles.detailValue}>{subscription.billingCycle}</Text>
                    </View>
                  </View>

                  <View style={styles.daysRemaining}>
                    <MaterialCommunityIcons
                      name={subscription.daysRemaining < 0 ? "alert" : "information"}
                      size={20}
                      color={getDaysRemainingColor(subscription.daysRemaining)}
                    />
                    <Text
                      style={[
                        styles.daysRemainingText,
                        { color: getDaysRemainingColor(subscription.daysRemaining) },
                      ]}
                    >
                      {subscription.daysRemaining < 0
                        ? `Expired ${Math.abs(subscription.daysRemaining)} days ago`
                        : `${subscription.daysRemaining} days remaining`}
                    </Text>
                  </View>

                  <Text style={styles.expiryDate}>
                    Expires: {new Date(subscription.endsAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}

              {subscriptions.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="credit-card-off" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>No subscriptions found</Text>
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
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ecf0f1",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#f39c12",
    borderColor: "#f39c12",
  },
  filterButtonText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "600",
  },
  filterButtonTextActive: {
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
  subscriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  subscriptionDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2c3e50",
  },
  daysRemaining: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  daysRemainingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expiryDate: {
    fontSize: 11,
    color: "#95a5a6",
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
