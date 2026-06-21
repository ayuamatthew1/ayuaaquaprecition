import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme/theme";

interface Props {
  name: string;
  species: string;
  fishCount: number;
  waterVolume: number;
  onPress: () => void;
}

export default function PondCard({
  name,
  species,
  fishCount,
  waterVolume,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Ionicons
          name="water"
          size={28}
          color={theme.colors.primary}
        />

        <Text style={styles.title}>
          {name}
        </Text>
      </View>

      <Text style={styles.label}>
        Species: {species}
      </Text>

      <Text style={styles.label}>
        Fish Count: {fishCount}
      </Text>

      <Text style={styles.label}>
        Water Volume: {waterVolume.toLocaleString()} L
      </Text>

      <View style={styles.footer}>
        <Text style={styles.viewMore}>
          View Details
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.surface}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.secondary,
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
    color: theme.colors.primary,
    fontWeight: "600",
  },
});