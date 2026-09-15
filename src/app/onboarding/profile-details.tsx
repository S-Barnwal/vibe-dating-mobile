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
        {/* =========================
            PROGRESS
        ========================== */}

        <View style={styles.progressRow}>
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor:
                      theme.primary,
                  },
                ]}
              />
            )
          )}
        </View>

        {/* =========================
            HEADER
        ========================== */}

        <View style={styles.header}>
          <View
            style={[
              styles.eyebrowPill,
              {
                backgroundColor: isDark
                  ? "#251C38"
                  : "#F1ECFF",
              },
            ]}
          >
            <Text
              style={[
                styles.eyebrowDot,
                {
                  color: theme.primary,
                },
              ]}
            >
              ✦
            </Text>

            <Text
              style={[
                styles.eyebrow,
                {
                  color: theme.primary,
                },
              ]}
            >
              MAKE IT YOU
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Tell them{"\n"}
            <Text
              style={{
                color: theme.primary,
              }}
            >
              your vibe.
            </Text>
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            The little things make your profile
            feel like you. Keep it real, keep it
            yours.
          </Text>
        </View>

        {/* =========================
            BIO
        ========================== */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
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
                  styles.smallHint,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Your first impression ✨
              </Text>
            </View>

            <View
              style={[
                styles.counterPill,
                {
                  backgroundColor:
                    bio.length >= 10
                      ? isDark
                        ? "#251C38"
                        : "#F1ECFF"
                      : theme.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.counter,
                  {
                    color:
                      bio.length >= 10
                        ? theme.primary
                        : theme.textMuted,
                  },
                ]}
              >
                {bio.length}/180
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: theme.surface,
                borderColor:
                  bio.length > 0
                    ? theme.primary
                    : theme.border,
              },
            ]}
          >
            <TextInput
              value={bio}
              onChangeText={setLocalBio}
              placeholder="Coffee, sunsets & spontaneous plans ✨"
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={180}
              textAlignVertical="top"
              style={[
                styles.bioInput,
                {
                  color: theme.text,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.helper,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Say something that gives people a reason
            to smile or start a conversation.
          </Text>
        </View>

        {/* =========================
            ABOUT YOU
        ========================== */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
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
                  styles.smallHint,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Show a little more personality
              </Text>
            </View>

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

          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: theme.surface,
                borderColor:
                  description.length > 0
                    ? theme.primary
                    : theme.border,
              },
            ]}
          >
            <TextInput
              value={description}
              onChangeText={setLocalDescription}
              placeholder="Tell people about your personality, lifestyle, passions or what you enjoy..."
              placeholderTextColor={
                theme.textMuted
              }
              multiline
              maxLength={500}
              textAlignVertical="top"
              style={[
                styles.descriptionInput,
                {
                  color: theme.text,
                },
              ]}
            />
          </View>
        </View>

        {/* =========================
            DATING INTENTION
        ========================== */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View>
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

              <Text
                style={[
                  styles.smallHint,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Be clear. Find your kind of people.
              </Text>
            </View>

            <View
              style={[
                styles.requiredBadge,
                {
                  backgroundColor: isDark
                    ? "#30202A"
                    : "#FFF0F3",
                },
              ]}
            >
              <Text
                style={[
                  styles.requiredText,
                  {
                    color: theme.secondary,
                  },
                ]}
              >
                Required
              </Text>
            </View>
          </View>

          <View style={styles.intentionsGrid}>
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
                    styles.intentionCard,
                    {
                      backgroundColor: selected
                        ? theme.primary
                        : theme.surface,

                      borderColor: selected
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
                      styles.intentionText,
                      {
                        color: selected
                          ? "#FFFFFF"
                          : theme.text,
                      },
                    ]}
                  >
                    {item}
                  </Text>

                  <View
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor:
                          selected
                            ? "rgba(255,255,255,0.18)"
                            : "transparent",

                        borderColor: selected
                          ? "rgba(255,255,255,0.7)"
                          : theme.border,
                      },
                    ]}
                  >
                    {selected && (
                      <Text
                        style={
                          styles.checkText
                        }
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* =========================
            PROMPT
        ========================== */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View>
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
                  styles.smallHint,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Give them an easy conversation starter
              </Text>
            </View>

            <View
              style={[
                styles.optionalBadge,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionalText,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Optional
              </Text>
            </View>
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
                  style={({ pressed }) => [
                    styles.promptChip,
                    {
                      backgroundColor: selected
                        ? isDark
                          ? "#2D2148"
                          : "#F1ECFF"
                        : theme.surface,

                      borderColor: selected
                        ? theme.primary
                        : theme.border,

                      transform: [
                        {
                          scale: pressed
                            ? 0.97
                            : 1,
                        },
                      ],
                    },
                  ]}
                >
                  {selected && (
                    <Text
                      style={[
                        styles.promptChipIcon,
                        {
                          color: theme.primary,
                        },
                      ]}
                    >
                      ✦
                    </Text>
                  )}

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
            <View
              style={[
                styles.promptAnswerCard,
                {
                  backgroundColor: isDark
                    ? "#19161F"
                    : "#FFFFFF",
                  borderColor: theme.primary,
                },
              ]}
            >
              <View
                style={styles.promptAnswerHeader}
              >
                <View
                  style={[
                    styles.promptSpark,
                    {
                      backgroundColor:
                        isDark
                          ? "#30264A"
                          : "#F1ECFF",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.promptSparkText,
                      {
                        color: theme.primary,
                      },
                    ]}
                  >
                    ✦
                  </Text>
                </View>

                <View style={styles.promptHeaderCopy}>
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

                  <Text
                    style={[
                      styles.promptHeaderHint,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    Your answer
                  </Text>
                </View>
              </View>

              <TextInput
                value={promptAnswer}
                onChangeText={setLocalPromptAnswer}
                placeholder="Write something that feels like you..."
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

              <Text
                style={[
                  styles.promptCounter,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                {promptAnswer.length}/150
              </Text>
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
              <View
                style={[
                  styles.emptySpark,
                  {
                    backgroundColor: isDark
                      ? "#30264A"
                      : "#F1ECFF",
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
              </View>

              <View
                style={styles.emptyCopy}
              >
                <Text
                  style={[
                    styles.promptEmptyTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Make it easier to say hey
                </Text>

                <Text
                  style={[
                    styles.promptEmptyText,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  Pick a prompt and give someone
                  an easy reason to message you.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* =========================
            PROFILE TIP
        ========================== */}

        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: isDark
                ? "#19161F"
                : "#FFFFFF",
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.tipIcon,
              {
                backgroundColor: isDark
                  ? "#30264A"
                  : "#F1ECFF",
              },
            ]}
          >
            <Text
              style={[
                styles.tipIconText,
                {
                  color: theme.primary,
                },
              ]}
            >
              ♥
            </Text>
          </View>

          <View style={styles.tipCopy}>
            <Text
              style={[
                styles.tipTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Your profile, your rules
            </Text>

            <Text
              style={[
                styles.tipText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              You can always edit these details
              later from your profile.
            </Text>
          </View>
        </View>

        {/* =========================
            CONTINUE
        ========================== */}

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
                : "#E8E3EA",

              transform: [
                {
                  scale:
                    pressed && canContinue
                      ? 0.985
                      : 1,
                },
              ],
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

          <View
            style={[
              styles.buttonArrowCircle,
              {
                backgroundColor: canContinue
                  ? "rgba(255,255,255,0.16)"
                  : "transparent",
              },
            ]}
          >
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
          </View>
        </Pressable>

        <Text
          style={[
            styles.bottomHint,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Almost there — one more step after this ✨
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 45,
  },

  /* =========================
     PROGRESS
  ========================== */

  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 30,
  },

  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 20,
  },

  /* =========================
     HEADER
  ========================== */

  header: {
    marginBottom: 30,
  },

  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 14,
  },

  eyebrowDot: {
    fontSize: 12,
    marginRight: 6,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  title: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.3,
  },

  subtitle: {
    marginTop: 13,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 350,
  },

  /* =========================
     SECTION
  ========================== */

  section: {
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  smallHint: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  counterPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  counter: {
    fontSize: 11,
    fontWeight: "700",
  },

  requiredBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },

  requiredText: {
    fontSize: 9,
    fontWeight: "800",
  },

  optionalBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 10,
  },

  optionalText: {
    fontSize: 9,
    fontWeight: "700",
  },

  /* =========================
     INPUTS
  ========================== */

  inputCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },

  bioInput: {
    minHeight: 125,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
    fontSize: 15,
    lineHeight: 23,
  },

  descriptionInput: {
    minHeight: 135,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
    fontSize: 15,
    lineHeight: 23,
  },

  helper: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 2,
  },

  /* =========================
     INTENTIONS
  ========================== */

  intentionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  intentionCard: {
    width: "48.5%",
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  intentionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  checkCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* =========================
     PROMPTS
  ========================== */

  promptOptions: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 20,
  },

  promptChip: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  promptChipIcon: {
    fontSize: 11,
    marginRight: 5,
  },

  promptChipText: {
    fontSize: 11,
    fontWeight: "700",
  },

  promptAnswerCard: {
    marginTop: 12,
    borderRadius: 21,
    borderWidth: 1,
    padding: 14,
  },

  promptAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  promptSpark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  promptSparkText: {
    fontSize: 17,
  },

  promptHeaderCopy: {
    marginLeft: 10,
    flex: 1,
  },

  selectedPrompt: {
    fontSize: 13,
    fontWeight: "800",
  },

  promptHeaderHint: {
    fontSize: 10,
    marginTop: 2,
  },

  promptInput: {
    minHeight: 92,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 21,
  },

  promptCounter: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 6,
  },

  promptEmpty: {
    marginTop: 12,
    minHeight: 83,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  emptySpark: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  promptEmptyIcon: {
    fontSize: 19,
  },

  emptyCopy: {
    flex: 1,
    marginLeft: 11,
  },

  promptEmptyTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
  },

  promptEmptyText: {
    fontSize: 11,
    lineHeight: 17,
  },

  /* =========================
     TIP
  ========================== */

  tipCard: {
    minHeight: 74,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  tipIconText: {
    fontSize: 17,
  },

  tipCopy: {
    flex: 1,
    marginLeft: 11,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 3,
  },

  tipText: {
    fontSize: 10,
    lineHeight: 16,
  },

  /* =========================
     CONTINUE
  ========================== */

  button: {
    height: 58,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  buttonArrowCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  buttonArrow: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: -1,
  },

  bottomHint: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 11,
  },
});