import { AdminGate } from "@/src/components/adminComponents/AdminGate";
import { Stack } from "expo-router";
import React from "react";


export default function AdminLayout() {
  return (
    <AdminGate>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="users" />
        <Stack.Screen name="farms" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="subscriptions" />
        <Stack.Screen name="devices" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="farm/[id]" />
      </Stack>
    </AdminGate>
  );
}
