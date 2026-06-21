import { FeedingSchedule } from "../types/feedingSchedule";

export const feedingSchedules: FeedingSchedule[] = [
  {
    id: "1",
    pondId: "1",
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
    pondId: "2",
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
    pondId: "3",
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