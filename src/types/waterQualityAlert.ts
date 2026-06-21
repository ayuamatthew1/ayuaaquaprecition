export interface WaterQualityAlert {
  alert: string;
  recommendation: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}