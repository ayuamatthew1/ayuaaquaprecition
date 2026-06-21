export interface WaterQualityResult {
  score: number;
  status: "Excellent" | "Good" | "Warning" | "Critical";
  color: string;
}