import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme/theme";

interface Props {
  feedType: string;
  quantity: number;
  unit: string;
  time: string;
  repeatDays: string[];

  isActive: boolean;
  onToggle: (value: boolean) => void;
  isCompleted?: boolean;
  completedAt?: string;
  onComplete: () => void;
}
export default function FeedingScheduleCard({
  feedType,
  quantity,
  unit,
  time,
  repeatDays,
  isActive,
  onToggle,
  isCompleted,
  completedAt,
  onComplete
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="fish"
          size={24}
          color={theme.colors.surface}
        />

        <Text style={styles.time}>
          {time}
        </Text>
      </View>

      <Text style={styles.feedType}>
        {feedType}
      </Text>

      <Text style={styles.quantity}>
        {quantity} {unit}
      </Text>

      <Text style={styles.days}>
        {repeatDays.join(", ")}
      </Text>
      <View style={styles.statusRow}>
        <Text
          style={{
            color: isActive ? "#1eeb25" : "#999",
            fontWeight: "600",
            fontSize: 14,
            borderColor: isActive ? "#1eeb25" : "#999",
            borderStyle: "solid",
            borderWidth: 2,
            padding: 2,
            borderRadius: 4,
          }}
        >
          {isActive ? "Active" : "Disabled"}
        </Text>

        <Switch
          trackColor={{ false: "#7f0eef", true: "#81b0ff" }}
          thumbColor={isActive ? theme.colors.primary : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          value={isActive}
          onValueChange={onToggle}
        />

      </View>

      <View style={styles.actionsContainer}>
        {
          !isCompleted ? (
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={onComplete}
            >
              <Text style={styles.completeText}>
                Mark as Completed
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>
                ✓ Completed
              </Text>

              <Text style={styles.completedTime}>
                {completedAt}
              </Text>
            </View>
          )
        }
        <View style={styles.actions}>
          <TouchableOpacity>
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.surface}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons
              name="trash-outline"
              size={20}
              color="#F44336"
            />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },

  feedType: {
    color: theme.colors.surface,
    fontSize: 16,
    marginTop: 12,
  },

  quantity: {
    color: theme.colors.surface,
    fontWeight: "700",
    fontSize: 24,
    marginTop: 4,
  },

  days: {
    color: "#ccc",
    marginTop: 8,
  },

  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  completeBtn: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  completeText: {
    color: "#fff",
    fontWeight: "700",
  },

  completedContainer: {
    marginTop: 16,
  },

  completedText: {
    color: "#4CAF50",
    fontWeight: "700",
  },

  completedTime: {
    color: "#ccc",
  },
});