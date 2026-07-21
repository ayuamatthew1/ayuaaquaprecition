import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === "web") {
    return false;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function cancelUserFeedingNotifications(userId: string, scheduleId?: string) {
  if (Platform.OS === "web") {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matching = scheduled.filter((item) => {
    const data = item.content.data as { type?: string; userId?: string; scheduleId?: string } | undefined;
    return (
      data?.type === "feeding-reminder" &&
      data.userId === userId &&
      (!scheduleId || data.scheduleId === scheduleId)
    );
  });

  await Promise.all(
    matching.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

export async function scheduleFeedingNotification({
  userId,
  scheduleId,
  pond,
  feedType,
  quantity,
  unit,
  hour,
  minute,
}: {
  userId: string;
  scheduleId: string;
  pond: string;
  feedType: string;
  quantity: number;
  unit: string;
  hour: number;
  minute: number;
}) {
  if (Platform.OS === "web") {
    return undefined;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return undefined;
  }

  await cancelUserFeedingNotifications(userId, scheduleId);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍽 Feeding Reminder",
      body: `${pond}: Feed ${quantity}${unit} of ${feedType}`,
      data: {
        type: "feeding-reminder",
        userId,
        scheduleId,
      },
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}