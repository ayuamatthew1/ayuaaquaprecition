export interface FeedingSchedule {
  id: string;
  pondId: string;
  pondName?: string;
  species?: string;
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