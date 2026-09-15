import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../../hooks/use-theme";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOnboardingStore } from "../../store/onboardingStore";

const INTENTIONS = [
  "Something serious",
  "Something casual",
  "Long-term relationship",
  "Marriage",
  "New connections",
  "Figuring it out",
];

const PROMPTS = [
  "My simple pleasure",
  "A perfect weekend looks like",
  "You should message me if",
  "My most random talent",
  "Together we could",
  "The way to my heart is",
];

export default function ProfileDetailsScreen() {
  const { theme, isDark } = useTheme();

  const storedBio = useOnboardingStore(
    (state) => state.bio
  );

  const storedDescription = useOnboardingStore(
    (state) => state.description
  );

  const storedDatingIntention = useOnboardingStore(
    (state) => state.datingIntention
  );

  const storedPromptQuestion = useOnboardingStore(
    (state) => state.promptQuestion
  );

  const storedPromptAnswer = useOnboardingStore(
    (state) => state.promptAnswer
  );

  const setBio = useOnboardingStore(
    (state) => state.setBio
  );

  const setDescription = useOnboardingStore(
    (state) => state.setDescription
  );

  const setDatingIntention = useOnboardingStore(
    (state) => state.setDatingIntention
  );

  const setPromptQuestion = useOnboardingStore(
    (state) => state.setPromptQuestion
  );

  const setPromptAnswer = useOnboardingStore(
    (state) => state.setPromptAnswer
  );

  const [bio, setLocalBio] =
    useState(storedBio);

  const [description, setLocalDescription] =
    useState(storedDescription);

  const [datingIntention, setLocalDatingIntention] =
    useState(storedDatingIntention);

  const [promptQuestion, setLocalPromptQuestion] =
    useState(storedPromptQuestion);

  const [promptAnswer, setLocalPromptAnswer] =
    useState(storedPromptAnswer);

  const canContinue =
    bio.trim().length >= 10 &&
    bio.trim().length <= 180 &&
    datingIntention.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    setBio(bio.trim());
    setDescription(description.trim());
    setDatingIntention(datingIntention.trim());

    setPromptQuestion(promptQuestion);
    setPromptAnswer(promptAnswer.trim());

    router.replace("/onboarding/location");
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            MAKE IT YOU
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Tell them{"\n"}your vibe.
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            A little about you helps people find
            something real to connect with.
          </Text>
        </View>

        {/* Bio */}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text
              style={[
                styles.label,
                {
                  color: theme.text,
                },
              ]}
            >
              Your bio
            </Text>

            <Text
              style={[
                styles.counter,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              {bio.length}/180
            </Text>
          </View>

          <TextInput
            value={bio}
            onChangeText={setLocalBio}
            placeholder="Coffee, sunsets & spontaneous plans ✨"
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={180}
            textAlignVertical="top"
            style={[
              styles.textArea,
              {
                color: theme.text,
                backgroundColor: theme.surface,
                borderColor:
                  bio.length > 0
                    ? theme.primary
                    : theme.border,
              },
            ]}
          />

          <Text
            style={[
              styles.helper,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Keep it natural. Tell people what makes
            you, you.
          </Text>
        </View>

        {/* Description */}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text
              style={[
                styles.label,
                {
                  color: theme.text,
                },
              ]}
            >
              More about you
            </Text>

            <Text
              style={[
                styles.counter,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              {description.length}/500
            </Text>
          </View>

          <TextInput
            value={description}
            onChangeText={setLocalDescription}
            placeholder="Tell people a little more about your personality, lifestyle or what you enjoy..."
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={500}
            textAlignVertical="top"
            style={[
              styles.descriptionArea,
              {
                color: theme.text,
                backgroundColor: theme.surface,
                borderColor:
                  description.length > 0
                    ? theme.primary
                    : theme.border,
              },
            ]}
          />
        </View>

        {/* Dating Intention */}

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            What are you looking for?
          </Text>

          <View style={styles.options}>
            {INTENTIONS.map((item) => {
              const selected =
                datingIntention === item;

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setLocalDatingIntention(item)
                  }
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected
                        ? theme.primary
                        : theme.surface,

                      borderColor: selected
                        ? theme.primary
                        : theme.border,

                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: selected
                          ? "#FFFFFF"
                          : theme.text,
                      },
                    ]}
                  >
                    {item}
                  </Text>

                  {selected && (
                    <Text style={styles.optionCheck}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Prompt */}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text
              style={[
                styles.label,
                {
                  color: theme.text,
                },
              ]}
            >
              Add a prompt
            </Text>

            <Text
              style={[
                styles.optional,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Optional
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.promptOptions
            }
          >
            {PROMPTS.map((prompt) => {
              const selected =
                promptQuestion === prompt;

              return (
                <Pressable
                  key={prompt}
                  onPress={() =>
                    setLocalPromptQuestion(prompt)
                  }
                  style={[
                    styles.promptChip,
                    {
                      backgroundColor: selected
                        ? isDark
                          ? "#30264A"
                          : "#F3EEFF"
                        : theme.surface,

                      borderColor: selected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.promptChipText,
                      {
                        color: selected
                          ? theme.primary
                          : theme.text,
                      },
                    ]}
                  >
                    {prompt}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {promptQuestion ? (
            <View style={styles.promptAnswerContainer}>
              <Text
                style={[
                  styles.selectedPrompt,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                {promptQuestion}
              </Text>

              <TextInput
                value={promptAnswer}
                onChangeText={setLocalPromptAnswer}
                placeholder="Write your answer..."
                placeholderTextColor={
                  theme.textMuted
                }
                multiline
                maxLength={150}
                textAlignVertical="top"
                style={[
                  styles.promptInput,
                  {
                    color: theme.text,
                    backgroundColor:
                      theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              />
            </View>
          ) : (
            <View
              style={[
                styles.promptEmpty,
                {
                  backgroundColor: isDark
                    ? "#19161F"
                    : "#FFFFFF",
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.promptEmptyIcon,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                ✦
              </Text>

              <Text
                style={[
                  styles.promptEmptyText,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Pick a prompt to give people an
                easy conversation starter.
              </Text>
            </View>
          )}
        </View>

        {/* Info */}

        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark
                ? "#19161F"
                : "#FFFFFF",
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.infoIcon,
              {
                color: theme.primary,
              },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.infoText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            You can edit all of these details later
            from your profile.
          </Text>
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

          <Text
            style={[
              styles.buttonArrow,
              {
                color: canContinue
                  ? "#FFFFFF"
                  : theme.textMuted,
              },
            ]}
          >
            →
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },

  /* Progress */

  progressContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 35,
  },

  progressActive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  /* Header */

  header: {
    marginBottom: 28,
  },

  step: {
    ...typography.captionMedium,
    marginBottom: 14,
  },

  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: spacing.md,
    ...typography.body,
    lineHeight: 22,
  },

  /* Sections */

  section: {
    marginBottom: 26,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    ...typography.bodyMedium,
  },

  counter: {
    ...typography.caption,
  },

  optional: {
    ...typography.caption,
  },

  helper: {
    marginTop: 7,
    ...typography.caption,
    lineHeight: 18,
  },

  /* Bio */

  textArea: {
    minHeight: 115,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...typography.body,
  },

  descriptionArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...typography.body,
  },

  /* Dating intention */

  options: {
    gap: 10,
    marginTop: 10,
  },

  option: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  optionText: {
    flex: 1,
    ...typography.bodyMedium,
  },

  optionCheck: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  /* Prompt */

  promptOptions: {
    gap: 8,
    paddingVertical: 2,
  },

  promptChip: {
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  promptChipText: {
    ...typography.captionMedium,
  },

  promptAnswerContainer: {
    marginTop: 12,
  },

  selectedPrompt: {
    ...typography.captionMedium,
    marginBottom: 8,
  },

  promptInput: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...typography.body,
  },

  promptEmpty: {
    marginTop: 12,
    minHeight: 58,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  promptEmptyIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  promptEmptyText: {
    flex: 1,
    ...typography.caption,
    lineHeight: 18,
  },

  /* Info */

  infoBox: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    ...typography.caption,
    lineHeight: 18,
  },

  /* Button */

  button: {
    height: 56,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    ...typography.button,
  },

  buttonArrow: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
});