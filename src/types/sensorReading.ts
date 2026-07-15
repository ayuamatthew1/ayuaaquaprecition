export interface SensorReading {
  id: string;
  deviceId: string;
  temperature: number;
  dissolvedOxygen: number;
  ph: number;
  turbidity: number;
  ammonia: number;
  timestamp: Date;
}
