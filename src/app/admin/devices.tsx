import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Device {
  id: string;
  name: string;
  status: string;
  serialNumber: string;
  batteryLevel?: number;
  signalStrength?: number;
  lastSeenAt?: string;
  isListed: boolean;
  listedPrice?: number;
  pond: {
    id: string;
    name: string;
    farm: {
      name: string;
    };
  };
  sensorReadings?: Array<{
    temperature: number;
    ph: number;
    dissolvedOxygen: number;
    turbidity: number;
    recordedAt: string;
  }>;
}

export default function AdminDevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceSerial, setNewDeviceSerial] = useState("");
  const [newDevicePrice, setNewDevicePrice] = useState("");
  const { authenticatedFetch, user } = useAuth();

  const fetchDevices = async () => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await authenticatedFetch(`/api/admin/devices?${params}`);

      if (!response.ok) throw new Error("Failed to fetch devices");

      const json = await response.json();
      if (json.success && json.data) {
        setDevices(json.data.devices);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchDevices();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const handleCreateDevice = async () => {
    if (!newDeviceName.trim() || !newDeviceSerial.trim()) {
      Alert.alert("Missing details", "Device name and serial number are required.");
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDeviceName,
          serialNumber: newDeviceSerial,
          listedPrice: newDevicePrice ? Number(newDevicePrice) : undefined,
          isListed: Boolean(newDevicePrice),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        Alert.alert("Upload failed", result.message || "Unable to upload device.");
        throw new Error(result.message || "Unable to upload device.");
      }

      setCreateModalVisible(false);
      setNewDeviceName("");
      setNewDeviceSerial("");
      setNewDevicePrice("");
      fetchDevices();
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : "Unable to upload device.");
      console.error("Create device error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "#27ae60";
      case "OFFLINE":
        return "#95a5a6";
      case "MAINTENANCE":
        return "#f39c12";
      case "DISCONNECTED":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getSignalQuality = (signal?: number) => {
    if (!signal) return "No signal";
    if (signal >= 80) return "Excellent";
    if (signal >= 60) return "Good";
    if (signal >= 40) return "Fair";
    return "Poor";
  };

  const getBatteryStatus = (battery?: number) => {
    if (!battery) return "N/A";
    if (battery >= 80) return "Full";
    if (battery >= 50) return "Good";
    if (battery >= 20) return "Low";
    return "Critical";
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Device Management</Text>
          <Text style={styles.subtitle}>Monitor and manage IoT devices</Text>
        </View>
        {user?.role === "SUPER_ADMIN" ? (
          <TouchableOpacity style={styles.uploadButton} onPress={() => setCreateModalVisible(true)}>
            <MaterialCommunityIcons name="upload" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload device</Text>
          </TouchableOpacity>
        ) : null}

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
            {["ONLINE", "OFFLINE", "MAINTENANCE", "DISCONNECTED"].map((status) => (
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
              <ActivityIndicator size="large" color="#2980b9" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              {devices.map((device) => (
                <View key={device.id} style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.serialNumber}>S/N: {device.serialNumber}</Text>
                      {
                        device.isListed ? (
                          <Text style={styles.pondName}>Listed for sale</Text>
                        ) : (
                          <>
                            {
                              device.pond ? (
                                <Text style={styles.pondName}>
                                  {device.pond.farm.name} - {device.pond.name}
                                </Text>
                              ) : (
                                <Text style={styles.pondName}>Pond Not assigned</Text>
                              )
                            }
                          </>
                        )
                      }
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(device.status) || "#27ae60" }]}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(device.status) },
                        ]}
                      />
                      <Text style={styles.statusText}>{!device.isListed ? device.status : device.listedPrice}</Text>
                    </View>
                  </View>

                  <View style={styles.deviceStats}>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="battery" size={16} color="#f39c12" />
                      <Text style={styles.statText}>
                        {device.batteryLevel ? `${Math.round(device.batteryLevel)}%` : "N/A"}
                      </Text>
                      <Text style={styles.statLabel}>{getBatteryStatus(device.batteryLevel)}</Text>
                    </View>

                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="wifi" size={16} color="#3498db" />
                      <Text style={styles.statText}>
                        {device.signalStrength ? `${Math.round(device.signalStrength)}%` : "N/A"}
                      </Text>
                      <Text style={styles.statLabel}>{getSignalQuality(device.signalStrength)}</Text>
                    </View>
                  </View>

                  {device.sensorReadings && device.sensorReadings.length > 0 && (
                    <View style={styles.lastReading}>
                      <Text style={styles.lastReadingLabel}>Last Reading:</Text>
                      <View style={styles.readingData}>
                        <Text style={styles.readingValue}>
                          🌡️ {device.sensorReadings[0].temperature}°C
                        </Text>
                        <Text style={styles.readingValue}>
                          pH {device.sensorReadings[0].ph}
                        </Text>
                      </View>
                      <Text style={styles.readingTime}>
                        {new Date(device.sensorReadings[0].recordedAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}

                  {device.lastSeenAt && (
                    <Text style={styles.lastSeen}>
                      Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                    </Text>
                  )}
                </View>
              ))}

              {devices.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="wifi-off" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>No devices found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal animationType="slide" transparent visible={createModalVisible} onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload Device</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Device name"
              value={newDeviceName}
              onChangeText={setNewDeviceName}
              placeholderTextColor="#8e9aac"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Serial number"
              value={newDeviceSerial}
              onChangeText={setNewDeviceSerial}
              placeholderTextColor="#8e9aac"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Price (optional)"
              value={newDevicePrice}
              onChangeText={setNewDevicePrice}
              placeholderTextColor="#8e9aac"
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreateDevice}>
                <Text style={styles.primaryButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View >
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
    backgroundColor: "#2980b9",
    borderColor: "#2980b9",
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
  deviceCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  pondName: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  serialNumber: {
    fontSize: 11,
    color: "#95a5a6",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  deviceStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  statText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#7f8c8d",
    marginTop: 2,
  },
  lastReading: {
    backgroundColor: "#f0f8ff",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  lastReadingLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    fontWeight: "600",
    marginBottom: 4,
  },
  readingData: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
  },
  readingTime: {
    fontSize: 10,
    color: "#95a5a6",
  },
  lastSeen: {
    fontSize: 10,
    color: "#95a5a6",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2980b9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ecf0f1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#2c3e50",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#2980b9",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  secondaryButtonText: {
    color: "#2c3e50",
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
  },
});
