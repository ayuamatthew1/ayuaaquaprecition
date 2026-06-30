import { Device } from "../types/device";

export const devices: Device[] = [
  {
    id: "device-1",
    serialNumber: "AQP-0001",
    pondId: "1",
    status: "ONLINE",
    firmwareVersion: "1.0.0",
    batteryLevel: 85,
    signalStrength: "GOOD",
    lastSeen: new Date(),
  },

  {
    id: "device-2",
    serialNumber: "AQP-0002",
    pondId: "2",
    status: "ONLINE",
    firmwareVersion: "1.0.0",
    batteryLevel: 90,
    signalStrength: "STRONG",
    lastSeen: new Date(),
  },
  {
    id: "device-3",
    serialNumber: "AQP-0003",
    pondId: "3",
    status: "ONLINE",
    firmwareVersion: "1.0.0",
    batteryLevel: 75,
    signalStrength: "FAIR",
    lastSeen: new Date(),
  },
  {
    id: "device-4",
    serialNumber: "AQP-0004",
    pondId: "4",
    status: "ONLINE",
    firmwareVersion: "1.0.0",
    batteryLevel: 80,
    signalStrength: "GOOD",
    lastSeen: new Date(),
  },
];