import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { useTheme } from "../../hooks/use-theme";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";

import { useOnboardingStore } from "../../store/onboardingStore";

import { uploadPhotosToCloudinary } from "../../services/upload.service";

import { completeProfile } from "../../services/profile.service";

import {
  getSavedUser,
  getSavedToken,
  saveAuthSession,
} from "../../services/auth.service";

const points = [
  {
    icon: "✦",
    text: "Discover new people",
  },
  {
    icon: "♡",
    text: "Match with people you like",
  },
  {
    icon: "✉",
    text: "Start meaningful conversations",
  },
];

export default function CompleteScreen() {
  const { theme, isDark } = useTheme();

  /* ---------------------------------
   * Basic onboarding data
   * --------------------------------- */

  const birthday = useOnboardingStore(
    (state) => state.birthday
  );

  const gender = useOnboardingStore(
    (state) => state.gender
  );

  const interestedIn = useOnboardingStore(
    (state) => state.interestedIn
  );

  const interests = useOnboardingStore(
    (state) => state.interests
  );

  const photos = useOnboardingStore(
    (state) => state.photos
  );

  /* ---------------------------------
   * Profile details
   * --------------------------------- */

  const bio = useOnboardingStore(
    (state) => state.bio
  );

  const description = useOnboardingStore(
    (state) => state.description
  );

  const datingIntention = useOnboardingStore(
    (state) => state.datingIntention
  );

  const promptQuestion = useOnboardingStore(
    (state) => state.promptQuestion
  );

  const promptAnswer = useOnboardingStore(
    (state) => state.promptAnswer
  );

  /* ---------------------------------
   * Location
   * --------------------------------- */

  const latitude = useOnboardingStore(
    (state) => state.latitude
  );

  const longitude = useOnboardingStore(
    (state) => state.longitude
  );

  /* ---------------------------------
   * Reset
   * --------------------------------- */

  const resetOnboarding = useOnboardingStore(
    (state) => state.resetOnboarding
  );

  const [loading, setLoading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState("");

  const [error, setError] =
    useState("");

  /* ---------------------------------
   * Validation
   * --------------------------------- */

  const canComplete =
    birthday.trim().length > 0 &&
    gender.trim().length > 0 &&
    interestedIn.trim().length > 0 &&
    interests.length >= 3 &&
    interests.length <= 8 &&
    photos.length >= 2 &&
    photos.length <= 6 &&
    bio.trim().length >= 10 &&
    bio.trim().length <= 180 &&
    datingIntention.trim().length > 0;

  /* ---------------------------------
   * Complete Profile
   * --------------------------------- */

  const handleStartDiscovering =
    async () => {
      if (!canComplete || loading) {
        return;
      }

      setLoading(true);
      setError("");
      setUploadProgress("");

      try {
        /* ---------------------------------
         * 1. Check authentication
         * --------------------------------- */

        const token =
          await getSavedToken();

        const savedUser =
          await getSavedUser();

        if (!token || !savedUser) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        /* ---------------------------------
         * 2. Upload photos
         * --------------------------------- */

        setUploadProgress(
          `Uploading photos 0/${photos.length}...`
        );

        const cloudinaryUrls =
          await uploadPhotosToCloudinary(
            photos,
            (completed, total) => {
              setUploadProgress(
                `Uploading photos ${completed}/${total}...`
              );
            }
          );

        if (
          cloudinaryUrls.length < 2
        ) {
          throw new Error(
            "At least 2 photos are required."
          );
        }

        /* ---------------------------------
         * 3. Prepare profile prompts
         * --------------------------------- */

        const prompts =
          promptQuestion.trim() &&
          promptAnswer.trim()
            ? [
                {
                  question:
                    promptQuestion.trim(),
                  answer:
                    promptAnswer.trim(),
                },
              ]
            : [];

        /* ---------------------------------
         * 4. Prepare location
         *
         * Exact coordinates are sent only
         * to our backend.
         *
         * Backend does not expose them
         * publicly.
         * --------------------------------- */

        const location =
          latitude !== null &&
          longitude !== null
            ? {
                latitude,
                longitude,
              }
            : null;

        /* ---------------------------------
         * 5. Create profile
         * --------------------------------- */

        setUploadProgress(
          "Creating your profile..."
        );

        const response =
          await completeProfile({
            birthday:
              birthday.trim(),

            gender:
              gender.trim(),

            interestedIn:
              interestedIn.trim(),

            interests,

            photos:
              cloudinaryUrls,

            bio:
              bio.trim(),

            description:
              description.trim(),

            datingIntention:
              datingIntention.trim(),

            prompts,

            location,
          });

        /* ---------------------------------
         * 6. Update saved user
         * --------------------------------- */

        await saveAuthSession({
          token,
          user: response.data.user,
        });

        /* ---------------------------------
         * 7. Clear onboarding data
         * --------------------------------- */

        resetOnboarding();

        /* ---------------------------------
         * 8. Go to Discover
         * --------------------------------- */

        router.replace("/discover");
      } catch (err) {
        console.error(
          "Profile completion error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while creating your profile.";

        setError(message);
        setUploadProgress("");
      } finally {
        setLoading(false);
      }
    };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Celebration Icon */}

        <View
          style={[
            styles.iconOuter,
            {
              backgroundColor:
                isDark
                  ? "#211D29"
                  : "#F3EEFF",
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={styles.heart}
            >
              ♥
            </Text>
          </View>
        </View>

        {/* Logo */}

        <Text
          style={[
            styles.logo,
            {
              color:
                theme.primary,
            },
          ]}
        >
          vibe
        </Text>

        {/* Title */}

        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          Your profile is{"\n"}
          ready! ✨
        </Text>

        {/* Subtitle */}

        <Text
          style={[
            styles.subtitle,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          You're all set. Now let's
          find people who match
          your energy, interests and
          vibe.
        </Text>

        {/* Points */}

        <View
          style={styles.points}
        >
          {points.map((point) => (
            <View
              key={point.text}
              style={[
                styles.point,
                {
                  backgroundColor:
                    theme.surface,
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.pointIcon,
                  {
                    backgroundColor:
                      isDark
                        ? "#211D29"
                        : "#F3EEFF",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pointIconText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  {point.icon}
                </Text>
              </View>

              <Text
                style={[
                  styles.pointText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {point.text}
              </Text>

              <Text
                style={[
                  styles.check,
                  {
                    color:
                      theme.success,
                  },
                ]}
              >
                ✓
              </Text>
            </View>
          ))}
        </View>

        {/* Progress */}

        {loading &&
        uploadProgress ? (
          <View
            style={[
              styles.progressBox,
              {
                backgroundColor:
                  theme.surface,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <ActivityIndicator
              size="small"
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.progressText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              {uploadProgress}
            </Text>
          </View>
        ) : null}

        {/* Error */}

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor:
                  isDark
                    ? "#2A1820"
                    : "#FFF0F2",
                borderColor:
                  theme.danger,
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                {
                  color:
                    theme.danger,
                },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Bottom Message */}

        <Text
          style={[
            styles.bottomMessage,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          Your vibe journey starts
          here.
        </Text>
      </ScrollView>

      {/* CTA */}

      <View
        style={styles.footer}
      >
        <Pressable
          disabled={
            !canComplete ||
            loading
          }
          onPress={
            handleStartDiscovering
          }
          style={({
            pressed,
          }) => [
            styles.button,
            {
              backgroundColor:
                canComplete
                  ? theme.primary
                  : isDark
                  ? "#302A3A"
                  : "#E6E1EA",

              opacity:
                pressed &&
                canComplete &&
                !loading
                  ? 0.9
                  : 1,

              transform: [
                {
                  scale:
                    pressed &&
                    canComplete &&
                    !loading
                      ? 0.98
                      : 1,
                },
              ],
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      canComplete
                        ? "#FFFFFF"
                        : theme.textMuted,
                  },
                ]}
              >
                Start Discovering
              </Text>

              <Text
                style={[
                  styles.buttonArrow,
                  {
                    color:
                      canComplete
                        ? "#FFFFFF"
                        : theme.textMuted,
                  },
                ]}
              >
                →
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal:
      spacing.xxxl,
    paddingTop: 50,
    paddingBottom: 25,
  },

  /* Celebration */

  iconOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
  },

  /* Logo */

  logo: {
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 22,
  },

  /* Main Text */

  title: {
    textAlign: "center",
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    textAlign: "center",
    marginTop: 16,
    ...typography.body,
    lineHeight: 23,
    maxWidth: 340,
  },

  /* Points */

  points: {
    width: "100%",
    marginTop: 30,
    gap: 10,
  },

  point: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight:
      spacing.md,
  },

  pointIconText: {
    fontSize: 17,
    fontWeight: "700",
  },

  pointText: {
    flex: 1,
    ...typography.bodyMedium,
  },

  check: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft:
      spacing.sm,
  },

  /* Progress */

  progressBox: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginTop: 18,
    paddingHorizontal:
      spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  progressText: {
    ...typography.captionMedium,
  },

  /* Error */

  errorBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: radius.lg,
    marginTop: 12,
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.sm,
  },

  errorText: {
    ...typography.captionMedium,
    textAlign: "center",
  },

  /* Bottom Message */

  bottomMessage: {
    marginTop: 22,
    ...typography.caption,
  },

  /* Footer */

  footer: {
    paddingHorizontal:
      spacing.xxxl,
    paddingBottom:
      spacing.xxxl,
    paddingTop:
      spacing.sm,
  },

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