import { useAuth } from "@/src/context/AuthContext";
import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DeviceListing = {
  id: string;
  name: string;
  serialNumber: string;
  firmwareVersion?: string | null;
  listedPrice?: number | null;
  status: string;
  notes?: string | null;
};

type UserDevice = {
  id: string;
  name: string;
  serialNumber: string;
  firmwareVersion?: string | null;
  status: string;
  pond?: {
    id: string;
    name: string;
    farm: { name: string };
  } | null;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export default function DevicesScreen() {
  const { authenticatedFetch } = useAuth();
  const [listings, setListings] = useState<DeviceListing[]>([]);
  const [ownedDevices, setOwnedDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listingsResponse, ownedResponse] = await Promise.all([
        authenticatedFetch("/api/devices/listings"),
        authenticatedFetch("/api/users/me/devices"),
      ]);

      const listingsResult: ApiResponse<{ devices: DeviceListing[] }> = await listingsResponse.json();
      const ownedResult: ApiResponse<{ devices: UserDevice[] }> = await ownedResponse.json();

      if (!listingsResponse.ok || !listingsResult.success) {
        throw new Error(listingsResult.message ?? "Unable to load available devices.");
      }

      if (!ownedResponse.ok || !ownedResult.success) {
        throw new Error(ownedResult.message ?? "Unable to load your devices.");
      }

      setListings(listingsResult.data?.devices ?? []);
      setOwnedDevices(ownedResult.data?.devices ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load devices.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (deviceId: string) => {
    try {
      setPurchaseLoading(true);
      const response = await authenticatedFetch("/api/devices/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const result: ApiResponse<{ id: string; deviceId: string; price: number; status: string; createdAt: string }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to purchase device.");
      }

      await loadDevices();
    } catch (purchaseError) {
      setError(purchaseError instanceof Error ? purchaseError.message : "Unable to purchase device.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Available Devices</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceMeta}>S/N: {item.serialNumber}</Text>
              <Text style={styles.deviceMeta}>Price: ₦{item.listedPrice?.toFixed(2) ?? "N/A"}</Text>
              <Text style={styles.deviceMeta}>{item.notes ?? "No additional notes."}</Text>
            </View>
            <TouchableOpacity
              style={styles.buyButton}
              disabled={purchaseLoading}
              onPress={() => void handlePurchase(item.id)}
            >
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No devices are available for purchase at the moment.</Text>}
      />

      <Text style={styles.pageTitle}>My Devices</Text>
      <FlatList
        data={ownedDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceMeta}>S/N: {item.serialNumber}</Text>
              <Text style={styles.deviceMeta}>Status: {item.status}</Text>
              <Text style={styles.deviceMeta}>
                Connected to: {item.pond ? `${item.pond.farm.name} / ${item.pond.name}` : "Not assigned to a pond"}
              </Text>
            </View>
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.primary} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => <Text style={styles.emptyText}>You do not own any devices yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  pageTitle: {
    fontSize: 22,
    color: theme.colors.surface,
    fontWeight: "700",
    marginVertical: 16,
  },
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  deviceName: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  deviceMeta: {
    color: theme.colors.text,
    opacity: 0.85,
    marginBottom: 2,
  },
  buyButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButtonText: {
    color: theme.colors.surface,
    fontWeight: "700",
  },
  separator: {
    height: 12,
  },
  emptyText: {
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: "center",
    marginVertical: 14,
  },
  errorText: {
    color: theme.colors.errorText,
    marginBottom: 12,
  },
});
