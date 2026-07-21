import AddScheduleModal from "@/src/components/AddScheduleModal";
import FeedingScheduleCard from "@/src/components/FeedingScheduleCard";
import { useAuth } from "@/src/context/AuthContext";
import { cancelUserFeedingNotifications, requestNotificationPermissions, scheduleFeedingNotification } from "@/src/services/notificationService";
import { FeedingHistory } from "@/src/types/feedingHistory";
import { FeedingSchedule } from "@/src/types/feedingSchedule";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme/theme";

type PondOption = {
  id: string;
  name: string;
  species?: string | null;
};

export default function FeedingScheduleScreen() {
  const { authenticatedFetch, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [ponds, setPonds] = useState<PondOption[]>([]);
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [schedulesResponse, pondsResponse] = await Promise.all([
        authenticatedFetch("/api/feeding-schedules"),
        authenticatedFetch("/api/ponds"),
      ]);

      const schedulesResult = await schedulesResponse.json();
      const pondsResult = await pondsResponse.json();

      if (!schedulesResponse.ok || !schedulesResult.success) {
        throw new Error(schedulesResult.message || "Unable to load feeding schedules.");
      }

      if (!pondsResponse.ok || !pondsResult.success) {
        throw new Error(pondsResult.message || "Unable to load your ponds.");
      }

      const loadedSchedules = (schedulesResult.data ?? []).map((schedule: any) => ({
        id: schedule.id,
        pondId: schedule.pondId,
        pondName: schedule.pondName,
        species: schedule.species,
        feedType: schedule.feedType,
        quantity: schedule.quantity,
        unit: schedule.unit,
        time: new Date(schedule.feedTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hour: new Date(schedule.feedTime).getHours(),
        minute: new Date(schedule.feedTime).getMinutes(),
        repeatDays: schedule.repeatDays ?? [],
        isActive: schedule.isActive,
      }));

      const loadedPonds = (pondsResult.data ?? []).map((pond: any) => ({
        id: pond.id,
        name: pond.name,
        species: pond.species,
      }));

      setSchedules(loadedSchedules);
      setPonds(loadedPonds);
      setFeedingHistory([]);
    } catch (error) {
      Alert.alert("Feed update failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    void requestNotificationPermissions();
  }, [user?.id]);

  const toggleSchedule = async (scheduleId: string, value: boolean) => {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule || !user?.id) return;

    try {
      const response = await authenticatedFetch(`/api/feeding-schedules/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: value }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update schedule.");
      }

      if (!value) {
        await cancelUserFeedingNotifications(user.id, scheduleId);
      } else {
        await scheduleFeedingNotification({
          userId: user.id,
          scheduleId,
          pond: schedule.pondName || "Unknown Pond",
          feedType: schedule.feedType,
          quantity: schedule.quantity,
          unit: schedule.unit,
          hour: schedule.hour,
          minute: schedule.minute,
        });
      }

      setSchedules((prev) => prev.map((item) => (item.id === scheduleId ? { ...item, isActive: value } : item)));
    } catch (error) {
      Alert.alert("Update failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleSaveSchedule = async (newSchedule: any) => {
    if (!user?.id) {
      Alert.alert("Save failed", "User not authenticated.");
      return;
    };
    if (newSchedule.pondId === "") {
      Alert.alert("Save failed", "Please select a pond.");
      return;
    };

    try {
      const response = await authenticatedFetch("/api/feeding-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pondId: newSchedule.pondId,
          feedType: newSchedule.feedType,
          quantity: newSchedule.quantity,
          unit: newSchedule.unit,
          hour: newSchedule.hour,
          minute: newSchedule.minute,
          repeatDays: newSchedule.repeatDays ?? [],
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        Alert.alert("Save failed", result.message || "Unable to save feeding schedule.");
        throw new Error(result.message || "Unable to save feeding schedule.");
      }

      const createdSchedule = result.data;
      const mappedSchedule: FeedingSchedule = {
        id: createdSchedule.id,
        pondId: createdSchedule.pondId,
        pondName: createdSchedule.pondName,
        species: createdSchedule.species,
        feedType: createdSchedule.feedType,
        quantity: createdSchedule.quantity,
        unit: createdSchedule.unit,
        time: new Date(createdSchedule.feedTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hour: new Date(createdSchedule.feedTime).getHours(),
        minute: new Date(createdSchedule.feedTime).getMinutes(),
        repeatDays: createdSchedule.repeatDays ?? [],
        isActive: createdSchedule.isActive,
      };

      setSchedules((prev) => [mappedSchedule, ...prev]);

      await scheduleFeedingNotification({
        userId: user.id,
        scheduleId: createdSchedule.id,
        pond: createdSchedule.pondName || "Unknown Pond",
        feedType: createdSchedule.feedType,
        quantity: createdSchedule.quantity,
        unit: createdSchedule.unit,
        hour: mappedSchedule.hour,
        minute: mappedSchedule.minute,
      });
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const markAsCompleted = async (scheduleId: string) => {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule) return;

    try {
      const response = await authenticatedFetch(`/api/feeding-schedules/${scheduleId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to mark schedule as completed.");
      }

      Alert.alert("Success", "Feeding schedule marked as completed.");
      const completionTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const historyRecord = {
        id: result.data.id,
        scheduleId: schedule.id,
        pond: schedule.pondName || "Unknown Pond",
        feedType: schedule.feedType,
        quantity: schedule.quantity,
        unit: schedule.unit,
        scheduledTime: schedule.time,
        completedAt: completionTime,
      };

      setFeedingHistory((prev) => [historyRecord, ...prev]);
      setSchedules((prev) => prev.map((item) => (item.id === scheduleId ? { ...item, isCompleted: true, completedAt: completionTime } : item)));
    } catch (error) {
      Alert.alert("Completion failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule || !user?.id) return;

    try {
      const response = await authenticatedFetch(`/api/feeding-schedules/${scheduleId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete schedule.");
      }

      await cancelUserFeedingNotifications(user.id, scheduleId);
      setSchedules((prev) => prev.filter((item) => item.id !== scheduleId));
      Alert.alert("Success", "Feeding schedule deleted.");
    } catch (error) {
      Alert.alert("Delete failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feeding Schedule</Text>
      <Text style={styles.subtitle}>Manage fish feeding times</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your schedules…</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {schedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No feeding schedules yet</Text>
              <Text style={styles.emptyText}>Create one to start receiving reminders for your pond.</Text>
            </View>
          ) : (
            schedules.map((schedule) => (
              <FeedingScheduleCard
                key={schedule.id}
                feedType={schedule.feedType}
                quantity={schedule.quantity}
                unit={schedule.unit}
                time={schedule.time}
                repeatDays={schedule.repeatDays}
                isActive={schedule.isActive}
                onToggle={(value) => toggleSchedule(schedule.id, value)}
                isCompleted={schedule.isCompleted}
                completedAt={schedule.completedAt}
                onComplete={() => markAsCompleted(schedule.id)}
                onDelete={() => deleteSchedule(schedule.id)}
                pondName={schedule.pondName || ponds.find((pond) => pond.id === schedule.pondId)?.name || "Unknown Pond"}
                species={schedule.species || ponds.find((pond) => pond.id === schedule.pondId)?.species || "Unknown Species"}
              />
            ))
          )}
        </ScrollView>
      )}

      <AddScheduleModal
        visible={showModal}
        ponds={ponds}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSchedule}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
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
    color: "#ccc",
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ccc",
    marginTop: 12,
  },
  emptyState: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
  },
  emptyTitle: {
    color: theme.colors.surface,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyText: {
    color: "#ccc",
    textAlign: "center",
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