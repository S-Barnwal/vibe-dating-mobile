import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

import { useTheme } from "../hooks/use-theme";
import { useThemeStore } from "../store/themeStore";

export default function RootLayout() {
  const { theme, isDark, isLoaded } = useTheme();

  const loadMode = useThemeStore(
    (state) => state.loadMode
  );

  useEffect(() => {
    loadMode();
  }, [loadMode]);

  // Theme load hone tak screen render mat karo
  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="small"
          color={theme.primary}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="verify-email" />

        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-reset-otp" />
        <Stack.Screen name="reset-password" />

        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="onboarding/gender" />
        <Stack.Screen name="onboarding/interested" />
        <Stack.Screen name="onboarding/photos" />
        <Stack.Screen name="onboarding/profile-details" />
        <Stack.Screen name="onboarding/location" />

        <Stack.Screen name="onboarding/complete" />

        <Stack.Screen name="discover" />
        <Stack.Screen name="most-compatible" />
        <Stack.Screen name="profile-detail" />
        <Stack.Screen name="matches" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="chat" />

        <Stack.Screen name="settings" />
        <Stack.Screen name="blocked-users" />
        <Stack.Screen name="report-user" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="filters" />

        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="profile-preview" />
        <Stack.Screen name="premium" />
      </Stack>
    </>
  );
}