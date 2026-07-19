import { FarmStatus } from "@/prisma/generated/prisma/enums";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Farm {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  status: FarmStatus;
  state: string | null;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  pondCount: number;
  subscription?: {
    plan: string;
    status: string;
    endsAt: string;
  } | null;
  createdAt: string;
}

interface AdminFarmListProps {
  farms: Farm[];
  loading?: boolean;
  onUpdateFarm?: (farmId: string, data: any) => Promise<void>;
  onViewDetails?: (farmId: string) => void;
}

export const AdminFarmList: React.FC<AdminFarmListProps> = ({
  farms,
  loading = false,
  onUpdateFarm,
  onViewDetails,
}) => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (farm: Farm, newStatus: FarmStatus) => {
    if (!onUpdateFarm) return;

    setUpdatingId(farm.id);
    try {
      await onUpdateFarm(farm.id, { status: newStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: FarmStatus) => {
    switch (status) {
      case "ACTIVE":
        return "#27ae60";
      case "INACTIVE":
        return "#95a5a6";
      case "MAINTENANCE":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
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

  const renderFarmItem = ({ item: farm }: { item: Farm }) => (
    <TouchableOpacity
      style={styles.farmItem}
      onPress={() => setSelectedFarm(farm)}
      disabled={updatingId === farm.id}
    >
      <View style={styles.farmHeader}>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>{farm.name}</Text>
          <Text style={styles.ownerName}>
            Owner: {farm.owner.firstName} {farm.owner.lastName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(farm.status) }]}>
          <Text style={styles.statusText}>{farm.status}</Text>
        </View>
      </View>

      {farm.description && (
        <Text style={styles.farmDescription} numberOfLines={2}>
          {farm.description}
        </Text>
      )}

      <View style={styles.farmStats}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="water" size={16} color="#2980b9" />
          <Text style={styles.statText}>{farm.pondCount} Ponds</Text>
        </View>

        {farm.subscription && (
          <View style={styles.stat}>
            <MaterialCommunityIcons name="credit-card" size={16} color="#f39c12" />
            <Text style={[styles.statText, { color: getSubscriptionStatusColor(farm.subscription.status) }]}>
              {farm.subscription.plan}
            </Text>
          </View>
        )}
      </View>

      {updatingId === farm.id && <ActivityIndicator style={{ marginTop: 8 }} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={farms}
        renderItem={renderFarmItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* Farm Details Modal */}
      <Modal
        visible={selectedFarm !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFarm(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedFarm(null)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Farm Details</Text>
              <TouchableOpacity
                onPress={() => {
                  if (onViewDetails && selectedFarm) {
                    onViewDetails(selectedFarm.id);
                    setSelectedFarm(null);
                  }
                }}
                style={styles.moreButton}
              >
                <MaterialCommunityIcons name="open-in-new" size={20} color="#3498db" />
              </TouchableOpacity>
            </View>

            {selectedFarm && (
              <View style={styles.farmDetails}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Farm Name</Text>
                  <Text style={styles.detailValue}>{selectedFarm.name}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Owner</Text>
                  <Text style={styles.detailValue}>
                    {selectedFarm.owner.firstName} {selectedFarm.owner.lastName}
                  </Text>
                  <Text style={styles.detailValue}>{selectedFarm.owner.email}</Text>
                </View>

                {selectedFarm.address && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {selectedFarm.address}, {selectedFarm.city}, {selectedFarm.state}
                    </Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.statusSelector}>
                    {(["ACTIVE", "INACTIVE", "MAINTENANCE"] as FarmStatus[]).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          {
                            backgroundColor:
                              selectedFarm.status === status ? getStatusColor(status) : "#ecf0f1",
                          },
                        ]}
                        onPress={() => handleStatusChange(selectedFarm, status)}
                        disabled={updatingId === selectedFarm.id}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            {
                              color: selectedFarm.status === status ? "#fff" : "#2c3e50",
                            },
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Statistics</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Ponds</Text>
                      <Text style={styles.statValue}>{selectedFarm.pondCount}</Text>
                    </View>
                    {selectedFarm.subscription && (
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Plan</Text>
                        <Text style={styles.statValue}>{selectedFarm.subscription.plan}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {selectedFarm.subscription && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Subscription</Text>
                    <View
                      style={[
                        styles.subscriptionBox,
                        {
                          borderLeftColor: getSubscriptionStatusColor(selectedFarm.subscription.status),
                        },
                      ]}
                    >
                      <View style={styles.subscriptionRow}>
                        <Text style={styles.subscriptionLabel}>Status:</Text>
                        <Text
                          style={[
                            styles.subscriptionValue,
                            { color: getSubscriptionStatusColor(selectedFarm.subscription.status) },
                          ]}
                        >
                          {selectedFarm.subscription.status}
                        </Text>
                      </View>
                      <View style={styles.subscriptionRow}>
                        <Text style={styles.subscriptionLabel}>Expires:</Text>
                        <Text style={styles.subscriptionValue}>
                          {new Date(selectedFarm.subscription.endsAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Created</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedFarm.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  farmItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  farmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
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
  farmDescription: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  farmStats: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#2c3e50",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  closeButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
  farmDetails: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  statusSelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    alignItems: "center",
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subscriptionBox: {
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 4,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  subscriptionLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  subscriptionValue: {
    fontSize: 12,
    color: "#2c3e50",
    fontWeight: "500",
  },
});
