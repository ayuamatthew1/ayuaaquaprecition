export const sensorData = {
  temperature: 30,
  ph: 5.2,
  dissolvedOxygen: 4.8,
  turbidity: 12,
  ammonia: 0.3,
  timestamp: new Date(),
};

export const sensors = [
  {
    title: "Dissolved Oxygen",
    value: sensorData.dissolvedOxygen,
    unit: "mg/L",
    idealRange: "> 5 mg/L",
    status: sensorData.dissolvedOxygen >= 5 ? "good" : "danger",
    icon: "water",
  },
  {
    title: "Temperature",
    value: sensorData.temperature,
    unit: "°C",
    idealRange: "24–30 °C",
    status:
      sensorData.temperature >= 24 && sensorData.temperature <= 30
        ? "good"
        : "warning",
    icon: "thermometer",
  },
  {
    title: "Ammonia",
    value: sensorData.ammonia,
    unit: "mg/L",
    idealRange: "< 0.02 mg/L",
    status:
      sensorData.ammonia <= 0.02
        ? "good"
        : sensorData.ammonia <= 0.05
          ? "warning"
          : "danger",
    icon: "bar-chart",
  },
  {
    title: "Turbidity",
    value: sensorData.turbidity,
    unit: "NTU",
    idealRange: "< 25 NTU",
    status:
      sensorData.turbidity < 25
        ? "good"
        : sensorData.turbidity < 50
          ? "warning"
          : "danger",
    icon: "color-filter",
  },
  {
    title: "pH Level",
    value: sensorData.ph,
    unit: "",
    idealRange: "6.5–8.5",
    status:
      sensorData.ph >= 6.5 && sensorData.ph <= 8.5
        ? "good"
        : "warning",
    icon: "flask",
  },
] as const;