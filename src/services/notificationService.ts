import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } =
    await Notifications.requestPermissionsAsync();

  return status === "granted";
}

export async function scheduleFeedingNotification({
  pond,
  feedType,
  quantity,
  unit,
  hour,
  minute,
}: {
  pond: string;
  feedType: string;
  quantity: number;
  unit: string;
  hour: number;
  minute: number;
}) {
  const id =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍽 Feeding Reminder",
        body: `${pond}: Feed ${quantity}${unit} of ${feedType}`,
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

  return id;
}