import { useColorScheme } from "./use-color-scheme";
import { darkTheme, lightTheme } from "../constants/theme";
import { useThemeStore } from "../store/themeStore";

export function useTheme() {
  const systemColorScheme = useColorScheme();

  const mode = useThemeStore((state) => state.mode);
  const isLoaded = useThemeStore((state) => state.isLoaded);

  const isDark =
    mode === "dark" ||
    (mode === "system" && systemColorScheme === "dark");

  return {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    mode,
    isLoaded,
  };
}