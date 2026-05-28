import { Tabs } from "expo-router"

export default function TabsLayout(){

    return (
        <Tabs
            screenOptions={{
                headerShown: false

            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard'
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
                    title: 'Feeding'
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Inventory'
                }}
            />
        </Tabs>
           
    )
}

