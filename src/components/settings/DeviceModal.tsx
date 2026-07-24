import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  firmwareVersion?: string | null;
  pond?: {
    id: string;
    name: string;
    farm?: {
      name: string;
    };
  } | null;
}

interface DeviceModalProps {
  visible: boolean;
  loading?: boolean;
  devices: Device[];

  onClose: () => void;
  onConnect: () => void;
  onRemove: (device: Device) => void;
}

export default function DeviceModal({
  visible,
  loading = false,
  devices,
  onClose,
  onConnect,
  onRemove,
}: DeviceModalProps) {
  const renderDevice = ({ item }: { item: Device }) => {
    const assigned = !!item.pond;

    return (
      <View style={styles.deviceCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.deviceName}>{item.name}</Text>

            <Text style={styles.serial}>
              SN: {item.serialNumber}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "ONLINE"
                    ? "#16a34a"
                    : "#dc2626",
              },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="battery-half-outline"
            size={16}
            color={theme.colors.surface}
          />

          <Text style={styles.infoText}>
            Battery: {item.batteryLevel ?? "--"}%
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="wifi-outline"
            size={16}
            color={theme.colors.surface}
          />

          <Text style={styles.infoText}>
            Signal: {item.signalStrength ?? "--"}%
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="git-network-outline"
            size={16}
            color={theme.colors.surface}
          />

          <Text style={styles.infoText}>
            Firmware: {item.firmwareVersion ?? "Unknown"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="water-outline"
            size={16}
            color={theme.colors.surface}
          />

          <Text style={styles.infoText}>
            {assigned
              ? `Assigned to ${item.pond?.name} `
              : "Unassigned"}
          </Text>
        </View>

        {assigned && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(item)}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.removeText}>
              Remove Device
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>
                  Connected Devices
                </Text>

                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={26}
                    color={theme.colors.surface}
                  />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                <FlatList
                  data={devices}
                  keyExtractor={(item) => item.id}
                  renderItem={renderDevice}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Text style={styles.emptyText}>
                        No devices found.
                      </Text>
                    </View>
                  }
                  showsVerticalScrollIndicator={false}
                />
              )}

              <TouchableOpacity
                style={styles.connectButton}
                onPress={onConnect}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.connectText}>
                  Connect New Device
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.surface,
  },

  loading: {
    paddingVertical: 40,
    alignItems: "center",
  },

  deviceCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  deviceName: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },

  serial: {
    color: "#ddd",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  infoText: {
    color: theme.colors.surface,
  },

  removeButton: {
    marginTop: 12,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  removeText: {
    color: "#fff",
    fontWeight: "600",
  },

  connectButton: {
    marginTop: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  connectText: {
    color: theme.colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },

  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    color: theme.colors.surface,
  },
});
