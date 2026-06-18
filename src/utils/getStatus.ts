export default function getStatus(
  value: number,
  min: number,
  max: number
): "good" | "warning" | "danger" {
  if (value >= min && value <= max) {
    return "good";
  }

  const margin = (max - min) * 0.15;

  if (
    value >= min - margin &&
    value <= max + margin
  ) {
    return "warning";
  }

  return "danger";
}