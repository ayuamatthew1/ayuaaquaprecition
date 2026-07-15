import { WaterQualityResult } from "@/src/types/waterQualityResult";

export function calculateWaterQuality(data: {
  temperature: number;
  dissolvedOxygen: number;
  ammonia: number | null;
  turbidity: number;
  ph: number;
}): WaterQualityResult {

  let score = 100;

  // Temperature
  if (data.temperature < 24 || data.temperature > 30) {
    score -= 15;
  }

  // Dissolved Oxygen
  if (data.dissolvedOxygen < 5) {
    score -= 25;
  }

  // Ammonia
  if (data.ammonia !== null && data.ammonia > 0.02) {
    score -= 25;
  }

  // Turbidity
  if (data.turbidity > 25) {
    score -= 15;
  }

  // pH
  if (data.ph < 6.5 || data.ph > 8.5) {
    score -= 20;
  }

  score = Math.max(score, 0);

  if (score >= 90) {
    return {
      score,
      status: "Excellent",
      color: "#1eeb25",
    };
  }

  if (score >= 70) {
    return {
      score,
      status: "Good",
      color: "#1ccc22",
    };
  }

  if (score >= 50) {
    return {
      score,
      status: "Warning",
      color: "#FFC107",
    };
  }

  return {
    score,
    status: "Critical",
    color: "#F44336",
  };
}
