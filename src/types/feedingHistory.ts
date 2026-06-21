export interface FeedingHistory {
  id: string;
  scheduleId: string;

  pond: string;

  feedType: string;

  quantity: number;

  unit: string;

  scheduledTime: string;

  completedAt: string;
}