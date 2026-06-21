import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import PondCard from "@/src/components/PondCard";
import { ponds } from "@/src/data/ponds";
import { theme } from "@/src/theme/theme";
import { router } from "expo-router";

export default function PondsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Ponds
      </Text>

      <Text style={styles.subtitle}>
        Manage all hatchery ponds
      </Text>

      {ponds.map((pond) => (
        <PondCard
          key={pond.id}
          name={pond.name}
          species={pond.species}
          fishCount={pond.fishCount}
          waterVolume={pond.waterVolume}
          onPress={() => {
            router.push({ pathname: "/ponds/[id]", params: { id: pond.id } });
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.surface,
  },

  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },
});