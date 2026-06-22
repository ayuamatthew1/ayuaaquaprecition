import { Alert } from "../types/alert";

export const recentAlerts: Alert[] = [
  {
    id: "alert-1",
    pondId: "1",
    deviceId: "device-1",
    title: "Low Dissolved Oxygen",
    description: "Oxygen level dropped below safe threshold.",
    severity: "HIGH",
    createdAt: new Date("2026-08-01T08:15:00"),
    resolved: false,
  },
  {
    id: "alert-2",
    pondId: "1",
    deviceId: "device-1",
    title: "High Temperature",
    description: "Water temperature exceeded 30°C.",
    severity: "MEDIUM",
    createdAt: new Date("2026-07-29T14:40:00"),
    resolved: true,
  },
  {
    id: "alert-3",
    pondId: "1",
    deviceId: "device-1",
    title: "Device Offline",
    description: "Sensor device lost connection.",
    severity: "HIGH",
    createdAt: new Date("2026-07-25T10:00:00"),
    resolved: true,
  },
];