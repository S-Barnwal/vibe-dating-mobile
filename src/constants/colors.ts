export const colors = {
  light: {
    primary: "#6D3DF5",
    primaryDark: "#4B22B8",

    coral: "#FF6B8A",
    peach: "#FFB38A",
    lavender: "#B9A2FF",

    background: "#FFF9F5",
    surface: "#FFFFFF",

    text: "#17151C",
    textMuted: "#716D78",

    border: "#EDE9F0",

    success: "#35C98A",
    danger: "#FF5C72",

    overlay: "rgba(23, 21, 28, 0.45)",

    gradientStart: "#6D3DF5",
    gradientMiddle: "#FF6B8A",
    gradientEnd: "#FFB38A",
  },

  dark: {
    primary: "#9A7AFF",
    primaryDark: "#6D3DF5",

    coral: "#FF718F",
    peach: "#FFB38A",
    lavender: "#B9A2FF",

    background: "#100E14",
    surface: "#19161F",
    surfaceElevated: "#211D29",

    text: "#FFFFFF",
    textMuted: "#AAA5B3",

    border: "#302B38",

    success: "#35C98A",
    danger: "#FF718F",

    overlay: "rgba(0, 0, 0, 0.55)",

    gradientStart: "#6D3DF5",
    gradientMiddle: "#FF718F",
    gradientEnd: "#FFB38A",
  },
} as const;

export type ThemeColors = typeof colors.light;