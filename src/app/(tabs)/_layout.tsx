import { theme } from "@/src/theme/theme"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"

export default function TabsLayout() {

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // tabBarActiveTintColor: theme.colors.accent,
                tabBarInactiveTintColor: theme.colors.surface,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.primary,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <Ionicons
                        name="grid-outline" size={size} color={color} />,
                }}
            />
            {/* <Tabs.Screen
                name="water-quality"
                options={{
                    title: 'Water Quality'
                }}
            /> */}
            <Tabs.Screen
                name="feeding-screen"
                options={{
                    title: 'Feeding',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="fast-food" size={size} color={color} />
                }}
            />

            <Tabs.Screen
                name="alert"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="notifications-outline" size={size} color={color} />
                }}
            />

            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Inventory',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="cube-outline"
                        size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="bar-chart-outline"
                        size={size} color={color} />
                }}
            />
        </Tabs>

    )
}

