import { UserRole } from "@/prisma/generated/prisma/enums"
import { useAuth } from "@/src/context/AuthContext"
import { theme } from "@/src/theme/theme"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"

export default function TabsLayout() {
    const { user } = useAuth()
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN
    const isTechnician = user?.role === UserRole.TECHNICIAN

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
                name="ponds"
                options={{
                    title: 'Ponds',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="water-outline"
                        size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="devices"
                options={{
                    title: 'Devices',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="hardware-chip-outline"
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

            {isAdmin && (
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: 'Admin',
                        tabBarIcon: ({ size, color }) => <Ionicons
                            name="shield-outline" size={size} color={color} />
                    }}
                    listeners={({ navigation }) => ({
                        tabPress: (e) => {
                            e.preventDefault()
                            navigation.navigate("admin-stack", { screen: "dashboard" })
                        }
                    })}
                />
            )}

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ size, color }) => <Ionicons
                        name="settings-outline" size={size} color={color} />
                }}
            />
        </Tabs>

    )
}

