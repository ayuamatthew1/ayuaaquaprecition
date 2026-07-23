import { AlertSeverity, AlertStatus } from "@/prisma/generated/prisma/enums";
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

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  pond: {
    id: string;
    name: string;
    farm: {
      name: string;
    };
  };
  sensorReading?: {
    temperature: number;
    ph: number;
    dissolvedOxygen: number;
    turbidity: number;
    recordedAt: string;
  } | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface AdminAlertListProps {
  alerts: Alert[];
  loading?: boolean;
  onUpdateAlert?: (alertId: string, action: string) => Promise<void>;
  onBatchUpdate?: (alertIds: string[], action: string) => Promise<void>;
}

export const AdminAlertList: React.FC<AdminAlertListProps> = ({
  alerts,
  loading = false,
  onUpdateAlert,
  onBatchUpdate,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleAlertSelection = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleBatchAction = async (action: string) => {
    if (!onBatchUpdate || selectedAlerts.size === 0) return;

    try {
      await onBatchUpdate(Array.from(selectedAlerts), action);
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error("Batch update failed:", error);
    }
  };

  const handleUpdateAlert = async (alertId: string, action: string) => {
    if (!onUpdateAlert) return;

    setUpdatingId(alertId);
    try {
      await onUpdateAlert(alertId, action);
    } finally {
      setUpdatingId(null);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "#e74c3c";
      case "HIGH":
        return "#e67e22";
      case "WARNING":
        return "#f39c12";
      case "INFO":
        return "#3498db";
      default:
        return "#95a5a6";
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "alert-octagon";
      case "HIGH":
        return "alert";
      case "WARNING":
        return "alert-circle";
      case "INFO":
        return "information";
      default:
        return "help-circle";
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case "ACTIVE":
        return "clock";
      case "ACKNOWLEDGED":
        return "check";
      case "RESOLVED":
        return "check-all";
      default:
        return "help-circle";
    }
  };

  const renderAlertItem = ({ item: alert }: { item: Alert }) => (
    <View style={styles.alertItemContainer}>
      <TouchableOpacity
        style={styles.alertCheckbox}
        onPress={() => toggleAlertSelection(alert.id)}
      >
        <View
          style={[
            styles.checkbox,
            selectedAlerts.has(alert.id) && styles.checkboxChecked,
          ]}
        >
          {selectedAlerts.has(alert.id) && (
            <MaterialCommunityIcons name="check" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.alertItem}
        onPress={() => setSelectedAlert(alert)}
        disabled={updatingId === alert.id}
      >
        <View style={styles.alertHeader}>
          <View style={styles.severityIcon}>
            <MaterialCommunityIcons
              name={getSeverityIcon(alert.severity) as any}
              size={20}
              color={getSeverityColor(alert.severity)}
            />
          </View>
          <View style={styles.alertTitleSection}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertPond}>
              {alert.pond.farm.name} - {alert.pond.name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
            <Text style={styles.statusText}>{alert.severity}</Text>
          </View>
        </View>

        <Text style={styles.alertMessage} numberOfLines={2}>
          {alert.message}
        </Text>

        <View style={styles.alertMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name={getStatusIcon(alert.status) as any} size={14} color="#7f8c8d" />
            <Text style={styles.metaText}>{alert.status}</Text>
          </View>
          <Text style={styles.timeText}>
            {new Date(alert.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {updatingId === alert.id && <ActivityIndicator style={{ marginTop: 8 }} />}
      </TouchableOpacity>
    </View>
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
      {selectedAlerts.size > 0 && (
        <View style={styles.batchActions}>
          <Text style={styles.batchText}>{selectedAlerts.size} selected</Text>
          <View style={styles.batchButtonGroup}>
            <TouchableOpacity
              style={styles.batchButton}
              onPress={() => handleBatchAction("acknowledge")}
            >
              <Text style={styles.batchButtonText}>Acknowledge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.batchButton}
              onPress={() => handleBatchAction("resolve")}
            >
              <Text style={styles.batchButtonText}>Resolve</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* Alert Details Modal */}
      <Modal
        visible={selectedAlert !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAlert(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedAlert(null)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Alert Details</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedAlert && (
              <View style={styles.alertDetails}>
                <View
                  style={[
                    styles.alertHeaderBox,
                    { backgroundColor: getSeverityColor(selectedAlert.severity) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getSeverityIcon(selectedAlert.severity) as any}
                    size={32}
                    color="#fff"
                  />
                  <Text style={styles.alertHeaderTitle}>{selectedAlert.title}</Text>
                  <Text style={styles.alertHeaderSeverity}>{selectedAlert.severity}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Message</Text>
                  <Text style={styles.detailValue}>{selectedAlert.message}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{selectedAlert.pond.farm.name}</Text>
                  <Text style={styles.detailValue}>{selectedAlert.pond.name}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{selectedAlert.status}</Text>
                </View>

                {selectedAlert.sensorReading && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Sensor Data</Text>
                    <View style={styles.sensorGrid}>
                      <View style={styles.sensorBox}>
                        <Text style={styles.sensorLabel}>Temperature</Text>
                        <Text style={styles.sensorValue}>
                          {selectedAlert.sensorReading.temperature}°C
                        </Text>
                      </View>
                      <View style={styles.sensorBox}>
                        <Text style={styles.sensorLabel}>pH</Text>
                        <Text style={styles.sensorValue}>{selectedAlert.sensorReading.ph}</Text>
                      </View>
                      <View style={styles.sensorBox}>
                        <Text style={styles.sensorLabel}>DO</Text>
                        <Text style={styles.sensorValue}>
                          {selectedAlert.sensorReading.dissolvedOxygen} mg/l
                        </Text>
                      </View>
                      <View style={styles.sensorBox}>
                        <Text style={styles.sensorLabel}>Turbidity</Text>
                        <Text style={styles.sensorValue}>
                          {selectedAlert.sensorReading.turbidity} NTU
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  {selectedAlert.status === "ACTIVE" && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acknowledgeButton]}
                        onPress={() => {
                          handleUpdateAlert(selectedAlert.id, "acknowledge");
                          setSelectedAlert(null);
                        }}
                      >
                        <MaterialCommunityIcons name="check" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Acknowledge</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.resolveButton]}
                        onPress={() => {
                          handleUpdateAlert(selectedAlert.id, "resolve");
                          setSelectedAlert(null);
                        }}
                      >
                        <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Resolve</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedAlert.status === "ACKNOWLEDGED" && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.resolveButton]}
                        onPress={() => {
                          handleUpdateAlert(selectedAlert.id, "resolve");
                          setSelectedAlert(null);
                        }}
                      >
                        <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Resolve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.reopenButton]}
                        onPress={() => {
                          handleUpdateAlert(selectedAlert.id, "reopen");
                          setSelectedAlert(null);
                        }}
                      >
                        <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Reopen</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedAlert.status === "RESOLVED" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reopenButton]}
                      onPress={() => {
                        handleUpdateAlert(selectedAlert.id, "reopen");
                        setSelectedAlert(null);
                      }}
                    >
                      <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Reopen</Text>
                    </TouchableOpacity>
                  )}
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
  batchActions: {
    backgroundColor: "#ecf0f1",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  batchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  batchButtonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  batchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#3498db",
    borderRadius: 4,
  },
  batchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  alertItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  alertCheckbox: {
    padding: 8,
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#bdc3c7",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  alertItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  severityIcon: {
    paddingTop: 2,
  },
  alertTitleSection: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  alertPond: {
    fontSize: 11,
    color: "#7f8c8d",
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
  alertMessage: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  alertMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#7f8c8d",
  },
  timeText: {
    fontSize: 11,
    color: "#95a5a6",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
    textAlign: "center",
  },
  alertDetails: {
    padding: 16,
  },
  alertHeaderBox: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  alertHeaderTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
  },
  alertHeaderSeverity: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: 2,
  },
  sensorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sensorBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  sensorLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  acknowledgeButton: {
    backgroundColor: "#f39c12",
  },
  resolveButton: {
    backgroundColor: "#27ae60",
  },
  reopenButton: {
    backgroundColor: "#e67e22",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
