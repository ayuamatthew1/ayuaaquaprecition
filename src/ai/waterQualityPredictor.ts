import { SensorReading } from "../types/sensorReading";
import { WaterQualityAlert } from "../types/waterQualityAlert";

export function predictWaterQuality(
  data: SensorReading
): WaterQualityAlert[] {
  const alerts: WaterQualityAlert[] = [];

  if (data.temperature > 30) {
    alerts.push({
      alert: "High Water Temperature",
      recommendation:
        "Increase aeration and reduce sunlight exposure.",
      severity: "MEDIUM",
    });
  }

  if (data.ph < 6.5 || data.ph > 8.5) {
    alerts.push({
      alert: "Unsafe pH Level",
      recommendation:
        "Gradually adjust pH using approved buffers.",
      severity: "HIGH",
    });
  }

  if (data.dissolvedOxygen < 5) {
    alerts.push({
      alert: "Low Dissolved Oxygen",
      recommendation:
        "Activate aerators immediately.",
      severity: "HIGH",
    });
  }

  if (data.ammonia > 0.02) {
    alerts.push({
      alert: "High Ammonia",
      recommendation:
        "Perform water exchange and reduce feeding.",
      severity: "HIGH",
    });
  }

  if (data.turbidity > 25) {
    alerts.push({
      alert: "High Turbidity",
      recommendation:
        "Inspect filters and remove waste buildup.",
      severity: "MEDIUM",
    });
  }

  return alerts;
}