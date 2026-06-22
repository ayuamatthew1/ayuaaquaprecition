export interface Alert {
  id: string;
  pondId: string;
  deviceId: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
  resolved: boolean;
}