
interface dataType {
    temperature: number;
    ph: number;
    dissolvedOxygen:number;
    turbidity: number;
    ammonia: number;
    timestamp: Date;
}

interface PredictionResult {
  alert: string;
  recommendations: string;
  severity: "low" | "medium" | "high";
}


export function predictWaterQuality(
  data: dataType
): PredictionResult[] {
  const alertAndRecomm: PredictionResult[] = [];

  if (data.temperature > 30) {
    alertAndRecomm.push({
      alert: "High water temperature detected",
      recommendations:
        "Increase aeration and reduce sunlight exposure.",
      severity: "medium",
    });
  }

  if (data.ph < 6.5 || data.ph > 8.5) {
    alertAndRecomm.push({
      alert: "Unsafe pH level detected",
      recommendations:
        "Adjust pH gradually using approved hatchery buffers.",
      severity: "medium",
    });
  }

  if (data.dissolvedOxygen < 5) {
    alertAndRecomm.push({
      alert: "Low dissolved oxygen detected",
      recommendations:
        "Activate aerators immediately.",
      severity: "high",
    });
  }

  if (data.ammonia > 0.02) {
    alertAndRecomm.push({
      alert: "Dangerous ammonia concentration detected",
      recommendations:
        "Perform partial water exchange and reduce feeding temporarily.",
      severity: "high",
    });
  }

  if (data.turbidity > 25) {
    alertAndRecomm.push({
      alert: "High turbidity detected",
      recommendations:
        "Clean filters and inspect organic waste accumulation.",
      severity: "low",
    });
  }

  if (alertAndRecomm.length === 0) {
    alertAndRecomm.push({
      alert: "Water quality is healthy",
      recommendations:
        "Continue routine monitoring.",
      severity: "low",
    });
  }

  return alertAndRecomm;
}