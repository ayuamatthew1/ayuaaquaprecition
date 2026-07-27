import PondCard from "@/src/components/pondComponents/PondCard";
import { useAuth } from "@/src/context/AuthContext";
import { theme } from "@/src/theme/theme";
import { FishItem } from "@/src/types/fishItem";
import { PondWithFishBatch } from "@/src/types/pondsWithFish";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


type UserDevice = {
  id: string;
  name: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export default function PondsScreen() {
  const { authenticatedFetch } = useAuth();

  const [ponds, setPonds] = useState<PondWithFishBatch[]>([]);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPonds = useCallback(async () => {
    try {
      setLoading(true);

      const [pondResponse, deviceResponse] = await Promise.all([
        authenticatedFetch("/api/ponds"),
        authenticatedFetch("/api/devices/user-devices"),
      ]);

      const pondResult: ApiResponse<{ ponds: PondWithFishBatch[] }> =
        await pondResponse.json().catch(() => ({
          success: false,
          message: "Invalid response from ponds endpoint.",
        }));

      const deviceResult: ApiResponse<{ devices: UserDevice[] }> =
        await deviceResponse.json().catch(() => ({
          success: false,
          message: "Invalid response from devices endpoint.",
        }));

      console.log("Pond Results:", pondResult.data?.ponds);
      console.log("Device Results:", deviceResult.data);

      if (!pondResponse.ok || !pondResult.success) {
        throw new Error(pondResult.message || "Unable to load ponds.");
      }

      if (!deviceResponse.ok || !deviceResult.success) {
        throw new Error(deviceResult.message || "Unable to load devices.");
      }


      setPonds(pondResult.data?.ponds ?? []);

      setDevices(deviceResult.data?.devices ?? []);

    } catch (error) {
      Alert.alert(
        "Could not load ponds",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    void loadPonds();
  }, [loadPonds]);

  const handleCreateFishBatch = async (fish: FishItem) => {
    if (!fish.species || !fish.quantity) {
      Alert.alert(
        "Invalid Data",
        "Fish species and quantity are required."
      );
      return;
    }

    if (!Number.isInteger(fish.quantity) || fish.quantity <= 0) {
      Alert.alert(
        "Invalid Quantity",
        "Please enter a positive whole number."
      );
      return;
    }

    try {
      const response = await authenticatedFetch(
        `/api/ponds/${fish.pondId}/fish-batches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fish),
        }
      );

      const result = await response.json().catch(() => ({
        success: false,
        message: "Invalid server response.",
      }));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create fish batch.");
      }

      Alert.alert(
        "Success",
        `${fish.species} has been added successfully.`
      );

      void loadPonds();
    } catch (error) {
      Alert.alert(
        "Create Failed",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const handleAddDevice = async (
    pondId: string,
    deviceId: string,
  ) => {

    if (!deviceId) {
      Alert.alert("Invalid device Id", "Device id is required.");
      return;
    }

    if (!pondId) {
      Alert.alert("Invalid pond Id", "Pond id is required.");
      return;
    }

    console.log({
      pondId,
      deviceId,
    });

    try {
      const response = await authenticatedFetch(
        `/api/ponds/${pondId}/device`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pondId, deviceId }),
        }
      );

      const result = await response.json().catch(() => ({
        success: false,
        message: "Invalid server response.",
      }));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add device.");
      }

      Alert.alert("Success", "Device linked successfully.");

      void loadPonds();
    } catch (error) {
      Alert.alert(
        "Add Device Failed",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const simulateReading = async (sensor:
    {
      deviceId: string,
      temperature: number,
      ph: number,
      dissolvedOxygen: number,
      turbidity: number,
      ammonia: number,
    }
  ) => {
    const data = {
      deviceId: sensor.deviceId,
      temperature: sensor.temperature,
      ph: sensor.ph,
      dissolvedOxygen: sensor.dissolvedOxygen,
      turbidity: sensor.turbidity,
      ammonia: sensor.ammonia
    }
    console.log('Simalating...')
    try {

      const response = await authenticatedFetch("/api/sensor-readings", {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const resData = await response.json().catch(() => ({
        success: false,
        message: "Invalid Response."
      }));

      console.log("Response Status: ", response.status)
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Unable to Simulate readings, Please try again");
      }
      Alert.alert("Success", resData.message || "Readings Simulated successfully.");

    } catch (error) {
      console.error("Front End Error: ", error)
      const message = error instanceof Error ? error.message : "Unable to simulate reading."
      Alert.alert('Simulation Failed', message)
    }
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Ponds</Text>
        <Text style={styles.subtitle}>Manage all hatchery ponds</Text>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
            <Text style={styles.loadingText}>
              Loading ponds...
            </Text>
          </View>
        ) : ponds.length === 0 ? (
          <Text style={styles.emptyState}>
            No ponds yet. Create one to get started.
          </Text>
        ) : (
          ponds.map((pond) => (
            <PondCard
              key={pond.id}
              deviceId={pond.device?.id}
              pondId={pond.id}
              name={pond.name}
              species={pond.fishBatches[0]?.species ?? "No fish"}
              fishCount={pond.fishBatches[0]?.quantity ?? 0}
              hasFish={pond.fishBatches.length > 0}
              waterVolume={pond.waterVolume || 0}
              hasDevice={pond.device === null ? false : true}
              unAssignedDevices={devices}
              onCreateFishBatch={handleCreateFishBatch}
              onAddDevice={handleAddDevice}
              simulateReading={simulateReading}
              onPress={() =>
                router.push({
                  pathname: "/ponds/[id]",
                  params: { id: pond.id },
                })
              }
            />
          ))
        )}

      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/ponds/create")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.surface,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadingText: {
    color: theme.colors.surface,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignContent: "center",
    color: theme.colors.surface,
    textAlign: "center",
    marginTop: 16,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});