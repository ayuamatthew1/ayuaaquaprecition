import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { theme } from "../theme/theme";

const screenWidth = Dimensions.get("window").width;

interface Reading {
  timestamp: Date;
  temperature: number;
  dissolvedOxygen: number;
  ph: number;
  turbidity: number;
  ammonia: number;
}

interface Props {
  title: string;
  readings: Reading[];
  metric:
  | "temperature"
  | "dissolvedOxygen"
  | "ph"
  | "turbidity"
  | "ammonia";
  unit: string;
}

export default function WaterQualityChart({
  title,
  readings,
  metric,
  unit,
}: Props) {
  const labels = readings.map((reading) =>
    reading.timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

  const data = readings.map(
    (reading) => reading[metric]
  );

  return (
    <View
      style={{
        backgroundColor: theme.colors.secondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <Text
        style={{
          color: theme.colors.surface,
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 16,
        }}
      >
        {title}
      </Text>

      <LineChart
        data={{
          labels,
          datasets: [
            {
              data,
            },
          ],
        }}
        width={screenWidth - 64}
        height={220}
        yAxisSuffix={unit}
        chartConfig={{
          backgroundColor: theme.colors.secondary,
          backgroundGradientFrom:
            theme.colors.secondary,
          backgroundGradientTo:
            theme.colors.secondary,

          decimalPlaces: 1,

          color: (opacity = 1) =>
            `rgba(255,255,255,${opacity})`,

          labelColor: (opacity = 1) =>
            `rgba(255,255,255,${opacity})`,
        }}
        bezier
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
}