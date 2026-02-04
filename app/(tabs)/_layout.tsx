
import React from "react";
import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import { useTheme } from "@react-navigation/native";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="on-location"
        options={{
          title: "On-Location",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: "My Reports",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="dashboard"
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(home)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
