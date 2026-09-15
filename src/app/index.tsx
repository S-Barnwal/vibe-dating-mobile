import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* Decorative background shapes */}
      <View
        style={[
          styles.decorOne,
          {
            backgroundColor: isDark
              ? "rgba(154, 122, 255, 0.12)"
              : "rgba(109, 61, 245, 0.08)",
          },
        ]}
      />

      <View
        style={[
          styles.decorTwo,
          {
            backgroundColor: isDark
              ? "rgba(255, 113, 143, 0.10)"
              : "rgba(255, 107, 138, 0.08)",
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoMark,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Text style={styles.logoHeart}>♥</Text>
          </View>

          <Text
            style={[
              styles.logo,
              {
                color: theme.primary,
              },
            ]}
          >
            vibe
          </Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text
            style={[
              styles.eyebrow,
              {
                color: theme.primary,
              },
            ]}
          >
            MEET DIFFERENTLY
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Meet people you{"\n"}
            <Text style={{ color: theme.primary }}>
              actually vibe
            </Text>{" "}
            with.
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Discover genuine connections, meaningful
            conversations and people who match your
            energy.
          </Text>
        </View>

        {/* Vibe highlights */}
        <View style={styles.highlights}>
          <View
            style={[
              styles.highlight,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.highlightIcon,
                { color: theme.primary },
              ]}
            >
              ✦
            </Text>

            <Text
              style={[
                styles.highlightText,
                { color: theme.text },
              ]}
            >
              Real connections
            </Text>
          </View>

          <View
            style={[
              styles.highlight,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.highlightIcon,
                { color: theme.coral },
              ]}
            >
              ♡
            </Text>

            <Text
              style={[
                styles.highlightText,
                { color: theme.text },
              ]}
            >
              Better vibes
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/signup")}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [
                  {
                    scale: pressed ? 0.98 : 1,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>

            <Text style={styles.buttonArrow}>
              →
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.loginButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.loginText,
                {
                  color: theme.text,
                },
              ]}
            >
              I already have an account
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text
          style={[
            styles.footer,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Made for meaningful vibes ✨
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
    paddingTop: 55,
    paddingBottom: spacing.xxxl,
  },

  /* Decorative */

  decorOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    top: -110,
    right: -80,
  },

  decorTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -90,
    left: -80,
  },

  /* Brand */

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 58,
  },

  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  logoHeart: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  logo: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },

  /* Hero */

  hero: {
    width: "100%",
  },

  eyebrow: {
    ...typography.captionMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 15,
  },

  title: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "800",
    letterSpacing: -1.5,
  },

  subtitle: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 350,
  },

  /* Highlights */

  highlights: {
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
  },

  highlight: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  highlightIcon: {
    fontSize: 19,
    marginRight: 8,
  },

  highlightText: {
    flex: 1,
    ...typography.captionMedium,
    fontSize: 12,
  },

  /* Actions */

  actions: {
    marginTop: 34,
  },

  button: {
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  loginButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    ...typography.smallButton,
  },

  /* Footer */

  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: 25,
  },
});