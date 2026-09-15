import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../../hooks/use-theme";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOnboardingStore } from "../../store/onboardingStore";

const interests = [
  "Music",
  "Travel",
  "Movies",
  "Gaming",
  "Fitness",
  "Food",
  "Photography",
  "Fashion",
  "Art",
  "Books",
  "Sports",
  "Coffee",
];

export default function InterestsScreen() {
  const { theme, isDark } = useTheme();

  const storedInterests = useOnboardingStore(
    (state) => state.interests
  );

  const setInterests = useOnboardingStore(
    (state) => state.setInterests
  );

  const [selected, setSelected] = useState<string[]>(
    storedInterests
  );

  const toggleInterest = (interest: string) => {
    setSelected((current) => {
      if (current.includes(interest)) {
        return current.filter(
          (item) => item !== interest
        );
      }

      return [...current, interest];
    });
  };

  const canContinue = selected.length >= 3;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    setInterests(selected);

    router.push("/onboarding/photos");
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
              styles.progressActive,
              {
                backgroundColor: theme.primary,
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
            04 / 04
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            What are you{"\n"}into?
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Pick at least 3 things you love.
          </Text>
        </View>

        {/* Selected Count */}
        <View style={styles.countRow}>
          <Text
            style={[
              styles.count,
              {
                color: theme.primary,
              },
            ]}
          >
            {selected.length} selected
          </Text>

          {selected.length > 0 && (
            <Text
              style={[
                styles.minimumText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              {canContinue
                ? "You're good to go"
                : `${3 - selected.length} more`}
            </Text>
          )}
        </View>

        {/* Interest Chips */}
        <View style={styles.interests}>
          {interests.map((interest) => {
            const isSelected =
              selected.includes(interest);

            return (
              <Pressable
                key={interest}
                onPress={() =>
                  toggleInterest(interest)
                }
                style={({ pressed }) => [
                  styles.interest,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.surface,

                    borderColor: isSelected
                      ? theme.primary
                      : theme.border,

                    transform: [
                      {
                        scale: pressed
                          ? 0.96
                          : 1,
                      },
                    ],
                  },
                ]}
              >
                {isSelected && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}

                <Text
                  style={[
                    styles.interestText,
                    {
                      color: isSelected
                        ? "#FFFFFF"
                        : theme.text,
                    },
                  ]}
                >
                  {interest}
                </Text>
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
    marginBottom: 40,
  },

  progressActive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  /* Header */

  header: {
    marginBottom: 26,
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

  /* Count */

  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  count: {
    ...typography.captionMedium,
  },

  minimumText: {
    ...typography.caption,
  },

  /* Interests */

  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  interest: {
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginRight: 6,
  },

  interestText: {
    ...typography.smallButton,
  },

  /* Button */

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