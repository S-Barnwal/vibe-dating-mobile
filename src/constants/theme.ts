import { useColorScheme } from "react-native";

import { colors } from "./colors";

export const lightTheme = colors.light;

export const darkTheme = colors.dark;

export type AppTheme = typeof lightTheme;

export const useTheme = () => {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  return {
    colors: isDark ? darkTheme : lightTheme,
    isDark,
  };
};