export interface FeedingSchedule {
  id: string;

  pond: string;

  feedType: string;

  quantity: number;

  unit: string;

  time: string;

  hour: number;

  minute: number;

  repeatDays: string[];

  isActive: boolean;

  notificationId?: string;

  isCompleted?: boolean;

  completedAt?: string;
}

export const feedingSchedules: FeedingSchedule[] = [
  {
    id: "1",
    pond: "Pond 1",
    feedType: "Floating Feed",
    quantity: 2,
    unit: "kg",
    time: "08:00 AM",
    hour: 8,
    minute: 0,
    repeatDays: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    isActive: true,
  },

  {
    id: "2",
    pond: "Pond 2",
    feedType: "Floating Feed",
    quantity: 1,
    unit: "kg",
    time: "12:00 PM",
    hour: 12,
    minute: 0,
    repeatDays: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ],
    isActive: true,
  },

  {
    id: "3",
    pond: "Pond 3",
    feedType: "Sinking Feed",
    quantity: 2,
    unit: "kg",
    time: "04:00 PM",
    hour: 16,
    minute: 0,
    repeatDays: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    isActive: true,
  },
];