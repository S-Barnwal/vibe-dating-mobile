import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

const reportReasons = [
  "Fake profile",
  "Harassment or abusive behavior",
  "Inappropriate content",
  "Spam or scam",
  "Underage user",
  "Something else",
];

export default function ReportUserScreen() {
  const { theme, isDark } = useTheme();

  const [selectedReason, setSelectedReason] =
    useState<string | null>(null);

  const [description, setDescription] =
    useState("");

  const introBackground = isDark
    ? "rgba(154, 122, 255, 0.10)"
    : "rgba(109, 61, 245, 0.07)";

  const iconBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "rgba(109, 61, 245, 0.08)";

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert(
        "Select a reason",
        "Please select why you want to report this user."
      );
      return;
    }

    Alert.alert(
      "Report submitted",
      "Thanks for helping keep Vibe safe. We'll review your report.",
      [
        {
          text: "Done",
          onPress: () => router.back(),
        },
      ]
    );
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
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backIcon,
              {
                color: theme.text,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Report User
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* INTRO */}
        <View
          style={[
            styles.intro,
            {
              backgroundColor: introBackground,
              borderColor: isDark
                ? "rgba(154, 122, 255, 0.18)"
                : "rgba(109, 61, 245, 0.10)",
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: iconBackground,
              },
            ]}
          >
            <Text style={styles.shieldIcon}>
              🛡️
            </Text>
          </View>

          <View style={styles.introTextContainer}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Help keep Vibe safe
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Your report is private. Please tell us
              what happened so we can review it.
            </Text>
          </View>
        </View>

        {/* REASON */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.textMuted,
            },
          ]}
        >
          WHY ARE YOU REPORTING THIS USER?
        </Text>

        <View
          style={[
            styles.reasonsCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {reportReasons.map((reason, index) => {
            const selected =
              selectedReason === reason;

            return (
              <React.Fragment key={reason}>
                <Pressable
                  style={({ pressed }) => [
                    styles.reasonRow,
                    selected && {
                      backgroundColor:
                        iconBackground,
                    },
                    pressed && {
                      opacity: 0.8,
                    },
                  ]}
                  onPress={() =>
                    setSelectedReason(reason)
                  }
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: selected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.radioDot,
                          {
                            backgroundColor:
                              theme.primary,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.reasonText,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {reason}
                  </Text>
                </Pressable>

                {index !==
                  reportReasons.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor:
                          theme.border,
                      },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* ADDITIONAL DETAILS */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.textMuted,
            },
          ]}
        >
          ADDITIONAL DETAILS
          <Text
            style={[
              styles.optional,
              {
                color: theme.textMuted,
              },
            ]}
          >
            {"  "}(OPTIONAL)
          </Text>
        </Text>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Tell us more about what happened..."
          placeholderTextColor={theme.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />

        <Text
          style={[
            styles.characterCount,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {description.length}/500
        </Text>

        {/* SUBMIT */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.primary,
              opacity: !selectedReason
                ? 0.45
                : pressed
                ? 0.8
                : 1,
            },
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            Submit Report
          </Text>
        </Pressable>

        {/* NOTE */}
        <View
          style={[
            styles.bottomNoteBox,
            {
              backgroundColor: isDark
                ? "rgba(255, 113, 143, 0.07)"
                : "rgba(255, 92, 114, 0.05)",
              borderColor: isDark
                ? "rgba(255, 113, 143, 0.14)"
                : "rgba(255, 92, 114, 0.10)",
            },
          ]}
        >
          <Text style={styles.noteIcon}>⚠️</Text>

          <Text
            style={[
              styles.bottomNote,
              {
                color: theme.textMuted,
              },
            ]}
          >
            False or abusive reports may be reviewed
            by our safety team.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* HEADER */

  header: {
    height: 70,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 38,
  },

  headerTitle: {
    ...typography.h3,
  },

  headerSpace: {
    width: 42,
  },

  /* CONTENT */

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
  },

  /* INTRO */

  intro: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  shieldIcon: {
    fontSize: 23,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.xs,
  },

  introText: {
    ...typography.caption,
    lineHeight: 18,
  },

  /* SECTION */

  sectionTitle: {
    ...typography.captionMedium,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  optional: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0,
  },

  /* REASONS */

  reasonsCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: spacing.xxl,
  },

  reasonRow: {
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },

  reasonText: {
    flex: 1,
    ...typography.bodyMedium,
  },

  divider: {
    height: 1,
    marginLeft: 50,
  },

  /* TEXT INPUT */

  textInput: {
    minHeight: 125,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    borderWidth: 1,
  },

  characterCount: {
    textAlign: "right",
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
    marginRight: spacing.xs,
  },

  /* SUBMIT */

  submitButton: {
    height: 53,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },

  submitText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  /* BOTTOM NOTE */

  bottomNoteBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteIcon: {
    fontSize: 13,
    marginRight: spacing.sm,
  },

  bottomNote: {
    flex: 1,
    ...typography.caption,
    fontSize: 10,
    lineHeight: 16,
  },
});