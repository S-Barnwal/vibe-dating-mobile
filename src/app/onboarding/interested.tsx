import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { useTheme } from "../../hooks/use-theme";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOnboardingStore } from "../../store/onboardingStore";

const interestedOptions = [
  "Women",
  "Men",
  "Everyone",
];

export default function InterestedScreen() {
  const { theme, isDark } = useTheme();

  const storedInterestedIn =
    useOnboardingStore(
      (state) => state.interestedIn
    );

  const setInterestedIn =
    useOnboardingStore(
      (state) => state.setInterestedIn
    );

  const [selected, setSelected] =
    useState<string | null>(
      storedInterestedIn || null
    );

  const canContinue = selected !== null;

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const handleContinue = () => {
    if (!selected) {
      return;
    }

    setInterestedIn(selected);

    router.push("/onboarding/interests");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressInactive,
              {
                backgroundColor: theme.border,
              },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.step,
              {
                color: theme.primary,
              },
            ]}
          >
            03 / 04
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Who are you{"\n"}interested in?
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Choose who you'd like to meet.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {interestedOptions.map((option) => {
            const isSelected =
              selected === option;

            return (
              <Pressable
                key={option}
                onPress={() =>
                  handleSelect(option)
                }
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? "#211D29"
                        : "#F3EEFF"
                      : theme.surface,

                    borderColor: isSelected
                      ? theme.primary
                      : theme.border,

                    transform: [
                      {
                        scale: pressed
                          ? 0.98
                          : 1,
                      },
                    ],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected
                        ? theme.primary
                        : theme.text,
                    },
                  ]}
                >
                  {option}
                </Text>

                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        {
                          backgroundColor:
                            theme.primary,
                        },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Continue */}
        <Pressable
          disabled={!canContinue}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: canContinue
                ? theme.primary
                : isDark
                ? "#302A3A"
                : "#E6E1EA",

              opacity:
                pressed && canContinue
                  ? 0.9
                  : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: canContinue
                  ? "#FFFFFF"
                  : theme.textMuted,
              },
            ]}
          >
            Continue
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: 55,
    paddingBottom: spacing.xxxl,
  },

  /* Progress */

  progressContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 45,
  },

  progressActive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  progressInactive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  /* Header */

  header: {
    marginBottom: 38,
  },

  step: {
    ...typography.captionMedium,
    marginBottom: 14,
  },

  title: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: spacing.md,
    ...typography.body,
    lineHeight: 23,
  },

  /* Options */

  options: {
    gap: 12,
  },

  option: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionText: {
    ...typography.bodyMedium,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: radius.pill,
  },

  /* Continue */

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingHorizontal: spacing.lg,
  },

  buttonText: {
    ...typography.button,
  },
});