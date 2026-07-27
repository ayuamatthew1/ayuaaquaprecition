import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme/theme";
import AddDeviceModal from "./AddDeviceModal";
import AddFishModal from "./AddFishModal";

interface Device { id: string, name: string }
interface Props {
  pondId: string;
  deviceId?: string;
  name: string;
  species: string;
  fishCount: number;
  waterVolume: number;
  hasFish: boolean;
  hasDevice: boolean;
  unAssignedDevices: Device[]
  onPress: () => void;
  simulateReading: (sensors:
    {
      deviceId: string,
      temperature: number,
      ph: number,
      dissolvedOxygen: number,
      turbidity: number,
      ammonia: number,
    }
  ) => void | Promise<void>
  onCreateFishBatch: (fishBatch: {
    pondId: string;
    species: string
    breed: string;
    quantity: number;
    source?: string;
    averageWight?: number;
  }) => void | Promise<void>;
  onAddDevice: (pondId: string, deviceId: string,) => void | Promise<void>;
}

export default function PondCard({
  pondId,
  deviceId,
  name,
  species,
  fishCount,
  waterVolume,
  hasFish,
  hasDevice,
  unAssignedDevices,
  simulateReading,
  onPress,
  onCreateFishBatch,
  onAddDevice,
}: Props) {

  const [showAddFishModal, setShowFishModal] = useState(false)
  const [showAddDeviceModal, setShowDeviceModal] = useState(false)

  const handleSimulateReading = async () => {
    if (!deviceId) {
      Alert.alert("failed", "Device Id is required.");
      return;
    }
    await simulateReading(
      {
        deviceId,
        temperature: parseFloat((Math.random() * (40 - 18) + 18).toFixed(2)),
        ph: parseFloat((Math.random() * (10 - 4) + 4).toFixed(2)),
        dissolvedOxygen: parseFloat((Math.random() * (40 - 5) + 3).toFixed(2)),
        turbidity: parseFloat((Math.random() * (30 - 5) + 5).toFixed(2)),
        ammonia: parseFloat((Math.random() * (0.1 - 0.05) + 0.01).toFixed(2)),
      }
    )
  }
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={styles.header}>
          <Ionicons name="water" size={28} color={theme.colors.secondary} />
          <Text style={styles.title}>{name}</Text>
        </View>

        <>
          {
            hasFish ? (
              <>
                <Text style={styles.label}>Species: {species}</Text>
                <Text style={styles.label}>Fish Count: {fishCount}</Text>
              </>
            ) : <Text>No fishes yet</Text>
          }
          <Text style={styles.label}>
            Water Volume: {waterVolume ? waterVolume.toLocaleString() + " L" : "Not Specified"}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.viewMore}>View Details</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.surface} />
          </View>
        </>
      </TouchableOpacity>
      <View style={styles.actionRow}>
        {!hasFish && (
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowFishModal(true)}>
            <Ionicons name="add-circle-outline" size={16} color={theme.colors.surface} />
            <Text style={styles.actionText}>Add Fish</Text>
          </TouchableOpacity>
        )}

        {!hasDevice && (
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowDeviceModal(true)}>
            <Ionicons name="hardware-chip-outline" size={16} color={theme.colors.surface} />
            <Text style={styles.actionText}>Add Device</Text>
          </TouchableOpacity>
        )}
        {(hasDevice && hasFish) && (
          <TouchableOpacity style={styles.actionButton} onPress={handleSimulateReading}>
            <Ionicons name="hardware-chip-outline" size={16} color={theme.colors.surface} />
            <Text style={styles.actionText}>Simulate readings</Text>
          </TouchableOpacity>
        )}
      </View>

      <AddFishModal
        visible={showAddFishModal}
        pondId={pondId}
        onClose={() => setShowFishModal(false)}
        onSave={onCreateFishBatch}
      />

      <AddDeviceModal
        pondId={pondId}
        visible={showAddDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        onSave={onAddDevice}
        devices={unAssignedDevices}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  title: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    color: theme.colors.surface,
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  viewMore: {
    color: theme.colors.background,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: theme.colors.surface,
    fontWeight: "600",
  },
});