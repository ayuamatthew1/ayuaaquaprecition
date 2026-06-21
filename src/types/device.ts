export interface Device {
  id: string;
  serialNumber: string;
  pondId: string;
  status: "ONLINE" | "OFFLINE";
  lastSeen: Date;
  firmwareVersion: string;
}