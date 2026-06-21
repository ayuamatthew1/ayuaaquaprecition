import AddScheduleModal from "@/src/components/AddScheduleModal";
import FeedingScheduleCard from "@/src/components/FeedingScheduleCard";
import { feedingSchedules } from "@/src/data/feedingSchedules";
import { ponds } from "@/src/data/ponds";
import { requestNotificationPermissions, scheduleFeedingNotification } from "@/src/services/notificationService";
import { FeedingHistory } from "@/src/types/feedingHistory";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme/theme";


export default function FeedingScheduleScreen() {

  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState(feedingSchedules);
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistory[]>([]);

  // Toggle schedule active/inactive
  const toggleSchedule = async (scheduleId: string, value: boolean) => {

    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;
    const pond = ponds.find((p) => p.id === schedule.pondId);

    let notificationId = schedule.notificationId;

    if (!value && notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId); notificationId = undefined;
    }

    if (value) {
      notificationId =
        await scheduleFeedingNotification({
          pond: pond?.name || "Unknown Pond",
          feedType: schedule.feedType,
          quantity: schedule.quantity,
          unit: schedule.unit,
          hour: schedule.hour,
          minute: schedule.minute,
        });
    }

    setSchedules((prev) =>
      prev.map((item) =>
        item.id === scheduleId
          ? {
            ...item,
            isActive: value,
            notificationId,
          }
          : item
      )
    );
  };

  // handle adding a new schedule
  const handleSaveSchedule = async (
    newSchedule: any
  ) => {

    const notificationId =
      await scheduleFeedingNotification({
        pond: ponds.find((p) => p.id === newSchedule.pondId)?.name || "Unknown Pond",
        feedType: newSchedule.feedType,
        quantity: newSchedule.quantity,
        unit: newSchedule.unit,
        hour: newSchedule.hour,
        minute: newSchedule.minute,
      });

    setSchedules((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        isActive: true,
        notificationId,
        ...newSchedule,
      },
    ]);
  };

  // request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
  }, []);


  // mark a schedule as completed and add to history
  const markAsCompleted = (scheduleId: string) => {

    const schedule = schedules.find((s) => s.id === scheduleId);

    if (!schedule) return;
    const pond = ponds.find((p) => p.id === schedule.pondId);

    const completionTime =
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    const historyRecord = {
      id: Date.now().toString(),
      scheduleId: schedule.id,
      pond: pond?.name || "Unknown Pond",
      feedType: schedule.feedType,
      quantity: schedule.quantity,
      unit: schedule.unit,
      scheduledTime: schedule.time,
      completedAt: completionTime,
    };

    setFeedingHistory((prev) => [historyRecord, ...prev,]);

    setSchedules((prev) =>
      prev.map((item) =>
        item.id === scheduleId
          ? {
            ...item,
            isCompleted: true,
            completedAt: completionTime,
          }
          : item
      )
    );
  };

  // delete a schedule
  const deleteSchedule = async (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Feeding Schedule
      </Text>

      <Text style={styles.subtitle}>
        Manage fish feeding times
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {schedules.map((schedule) => (
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
            pondName={ponds.find((p) => p.id === schedule.pondId)?.name || "Unknown Pond"}
            species={ponds.find((p) => p.id === schedule.pondId)?.species || "Unknown Species"}
          />
        ))}
      </ScrollView>
      <AddScheduleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSchedule}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Ionicons
          name="add"
          size={30}
          color="#fff"
        />
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