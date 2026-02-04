
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (loading || isNavigating) {
      console.log("[RootLayout] Waiting - loading:", loading, "isNavigating:", isNavigating);
      return;
    }

    const inAuthGroup = segments[0] === "auth" || segments[0] === "register" || segments[0] === "auth-popup" || segments[0] === "auth-callback";
    const inWelcome = segments.length === 0 || segments[0] === "index";
    const inTabs = segments[0] === "(tabs)";
    const inAdminImport = segments[0] === "admin-import";

    console.log("[RootLayout] Navigation check:", {
      user: !!user,
      userEmail: user?.email,
      segments: segments.join("/"),
      inAuthGroup,
      inWelcome,
      inTabs,
    });

    // If user is authenticated
    if (user) {
      // If user is on welcome or auth screens, redirect to app
      if (inWelcome || inAuthGroup) {
        console.log("[RootLayout] User authenticated, redirecting from welcome/auth to /(tabs)/on-location");
        setIsNavigating(true);
        router.replace("/(tabs)/on-location");
        setTimeout(() => setIsNavigating(false), 500);
      }
      // Otherwise, let them stay where they are (in tabs or other authenticated routes)
    }
    // If user is NOT authenticated
    else {
      // If user is trying to access protected routes (tabs), redirect to welcome
      if (inTabs) {
        console.log("[RootLayout] User not authenticated, redirecting from tabs to welcome");
        setIsNavigating(true);
        router.replace("/");
        setTimeout(() => setIsNavigating(false), 500);
      }
      // If user is on admin-import without auth, redirect to welcome
      else if (inAdminImport) {
        console.log("[RootLayout] User not authenticated, redirecting from admin-import to welcome");
        setIsNavigating(true);
        router.replace("/");
        setTimeout(() => setIsNavigating(false), 500);
      }
      // Otherwise, let them stay on welcome, auth, or register screens
    }
  }, [user, loading, segments, router, isNavigating]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F2F2F7" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome screen - First screen shown to all unauthenticated users */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Auth screens - Accessible from Welcome */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
      <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      
      {/* Main app with tabs - Only accessible when authenticated */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Camera and video recording - NO TABS */}
      <Stack.Screen name="camera" options={{ headerShown: true, title: "Record Incident" }} />
      <Stack.Screen name="scan-form" options={{ headerShown: true, title: "Scan Form 34A" }} />
      
      {/* Admin screens */}
      <Stack.Screen name="admin-import" options={{ headerShown: false }} />
      
      {/* 404 Not Found */}
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)",
      background: "rgb(1, 1, 1)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };
  
  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <WidgetProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
              <SystemBars style={"auto"} />
            </GestureHandlerRootView>
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
