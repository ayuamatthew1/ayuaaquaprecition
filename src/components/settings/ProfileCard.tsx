import { theme } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface ProfileCardProps {
  user: UserProfile | null;
  farmName?: string;
  loading?: boolean;

  onEditFarm: () => void;
  onManageDevices: () => void;
}

export default function ProfileCard({
  user,
  farmName,
  loading = false,
  onEditFarm,
  onManageDevices,
}: ProfileCardProps) {
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.userInfo}>
          {loading ? (
            <ActivityIndicator
              color={theme.colors.surface}
            />
          ) : (
            <>
              <Text style={styles.name}>
                {user
                  ? `${user.firstName} ${user.lastName}`
                  : "Unknown User"}
              </Text>

              <Text style={styles.email}>
                {user?.email ?? ""}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.farmSection}>
        <Ionicons
          name="business-outline"
          size={20}
          color={theme.colors.secondary}
        />

        <View style={styles.farmInfo}>
          <Text style={styles.sectionTitle}>
            Farm
          </Text>

          <Text style={styles.farmName}>
            {farmName ?? "No farm created"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onEditFarm}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={theme.colors.surface}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deviceButton}
        onPress={onManageDevices}
      >
        <Ionicons
          name="hardware-chip-outline"
          size={20}
          color={theme.colors.surface}
        />

        <Text style={styles.deviceButtonText}>
          Manage Devices
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.surface}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: theme.colors.surface,
    fontSize: 28,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.surface,
  },

  username: {
    marginTop: 2,
    color: "#ddd",
    fontSize: 15,
  },

  email: {
    marginTop: 6,
    color: "#ddd",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 18,
  },

  farmSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  farmInfo: {
    flex: 1,
    marginLeft: 12,
  },

  sectionTitle: {
    color: "#ddd",
    fontSize: 13,
  },

  farmName: {
    color: theme.colors.surface,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 2,
  },

  iconButton: {
    padding: 8,
  },

  deviceButton: {
    marginTop: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  deviceButtonText: {
    flex: 1,
    marginLeft: 10,
    color: theme.colors.surface,
    fontWeight: "600",
    fontSize: 16,
  },
});
