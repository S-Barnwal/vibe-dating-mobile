import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";

type ThemeStore = {
  mode: ThemeMode;
  isLoaded: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  loadMode: () => Promise<void>;
};

const THEME_STORAGE_KEY = "@vibe_theme_mode";

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "system",
  isLoaded: false,

  setMode: async (mode) => {
    set({ mode });

    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        mode
      );
    } catch (error) {
      console.log("Failed to save theme:", error);
    }
  },

  loadMode: async () => {
    try {
      const savedMode =
        await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (
        savedMode === "light" ||
        savedMode === "dark" ||
        savedMode === "system"
      ) {
        set({
          mode: savedMode,
          isLoaded: true,
        });
        return;
      }

      set({ isLoaded: true });
    } catch (error) {
      console.log("Failed to load theme:", error);
      set({ isLoaded: true });
    }
  },
}));