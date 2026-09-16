import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { radius } from "../constants/spacing";
import { typography } from "../constants/typography";

import {
  getMostCompatibleProfiles,
  type CompatibleProfile,
} from "../services/compatibility.service";

export default function MostCompatibleScreen() {
  const { theme, isDark } = useTheme();

  const [profiles, setProfiles] = useState<
    CompatibleProfile[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =====================================================
   * LOAD COMPATIBLE PROFILES
   * =====================================================
   */

  const loadCompatibleProfiles = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMostCompatibleProfiles();

        setProfiles(
          response.data?.profiles || []
        );
      } catch (err) {
        console.error(
          "Most compatible screen error:",
          err
        );

        setProfiles([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load compatible profiles."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadCompatibleProfiles();
  }, [loadCompatibleProfiles]);

  /*
   * =====================================================
   * OPEN PROFILE
   * =====================================================
   */

  const openProfile = (
    profile: CompatibleProfile
  ) => {
    router.push({
      pathname: "/profile-detail",
      params: {
        id: profile.id,
        name: profile.name,
      },
    });
  };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <View
        style={[
          styles.centerState,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.loadingCircle,
            {
              backgroundColor: isDark
                ? "#211D29"
                : "#F3EEFF",
            },
          ]}
        >
          <Text style={styles.loadingEmoji}>
            💯
          </Text>
        </View>

        <ActivityIndicator
          size="small"
          color={theme.primary}
        />

        <Text
          style={[
            styles.stateTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Finding your strongest vibes...
        </Text>

        <Text
          style={[
            styles.stateText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          We're looking at your preferences,
          interests and connection signals.
        </Text>
      </View>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {
    return (
      <View
        style={[
          styles.centerState,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.loadingCircle,
            {
              backgroundColor: isDark
                ? "#21161C"
                : "#FFF0F4",
            },
          ]}
        >
          <Text style={styles.loadingEmoji}>
            💔
          </Text>
        </View>

        <Text
          style={[
            styles.stateTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Couldn't load matches
        </Text>

        <Text
          style={[
            styles.stateText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {error}
        </Text>

        <Pressable
          onPress={loadCompatibleProfiles}
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * =====================================================
   * EMPTY
   * =====================================================
   */

  if (profiles.length === 0) {
    return (
      <View
        style={[
          styles.centerState,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.loadingCircle,
            {
              backgroundColor: isDark
                ? "#211D29"
                : "#F3EEFF",
            },
          ]}
        >
          <Text style={styles.loadingEmoji}>
            ✨
          </Text>
        </View>

        <Text
          style={[
            styles.stateTitle,
            {
              color: theme.text,
            },
          ]}
        >
          No compatible profiles yet
        </Text>

        <Text
          style={[
            styles.stateText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Keep exploring. As more people join
          Vibe, we'll find stronger connections
          for you.
        </Text>

        <Pressable
          onPress={() =>
            router.replace("/discover")
          }
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        >
          <Text style={styles.retryText}>
            Back to Discover
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * =====================================================
   * MAIN SCREEN
   * =====================================================
   */

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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/discover");
  }
}}
            style={[
              styles.backButton,
              {
                backgroundColor:
                  theme.surface,
                borderColor:
                  theme.border,
              },
            ]}
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

          <View style={styles.headerText}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Most Compatible
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              Your strongest potential vibes
            </Text>
          </View>

          <View
            style={[
              styles.headerBadge,
              {
                backgroundColor:
                  isDark
                    ? "rgba(109,61,245,0.18)"
                    : "#F3EEFF",
              },
            ]}
          >
            <Text
              style={[
                styles.headerBadgeText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              {profiles.length}
            </Text>
          </View>
        </View>

        {/* =================================================
            INTRO CARD
        ================================================= */}

        <View
          style={[
            styles.introCard,
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
              styles.introIcon,
              {
                backgroundColor:
                  isDark
                    ? "rgba(255,107,138,0.14)"
                    : "#FFF0F4",
              },
            ]}
          >
            <Text style={styles.introEmoji}>
              💯
            </Text>
          </View>

          <View style={styles.introContent}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Built around your vibe
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              These profiles are matched using
              shared interests, intentions,
              preferences, distance and recent
              activity.
            </Text>
          </View>
        </View>

        {/* =================================================
            PROFILE COUNT
        ================================================= */}

        <View style={styles.resultsHeader}>
          <View>
            <Text
              style={[
                styles.resultsTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {profiles.length}{" "}
              {profiles.length === 1
                ? "person"
                : "people"}{" "}
              found
            </Text>

            <Text
              style={[
                styles.resultsSubtitle,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              Sorted by compatibility
            </Text>
          </View>

          <Text
            style={[
              styles.resultsSpark,
              {
                color: theme.coral,
              },
            ]}
          >
            ✨
          </Text>
        </View>

        {/* =================================================
            ALL COMPATIBLE PROFILES
        ================================================= */}

        {profiles.map(
          (profile, index) => {
            const primaryImage =
              profile.primaryPhoto ||
              profile.photos?.[0];

            return (
              <Pressable
                key={profile.id}
                onPress={() =>
                  openProfile(profile)
                }
                style={({ pressed }) => [
                  styles.profileCard,
                  {
                    backgroundColor:
                      theme.surface,
                    borderColor:
                      theme.border,
                    opacity: pressed
                      ? 0.88
                      : 1,
                  },
                ]}
              >
                {/* IMAGE */}

                <View style={styles.imageWrapper}>
                  {primaryImage ? (
                    <Image
                      source={{
                        uri: primaryImage,
                      }}
                      style={
                        styles.profileImage
                      }
                    />
                  ) : (
                    <View
                      style={[
                        styles.imageFallback,
                        {
                          backgroundColor:
                            isDark
                              ? "#211D29"
                              : "#F3EEFF",
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.fallbackEmoji
                        }
                      >
                        ✨
                      </Text>
                    </View>
                  )}

                  {/* RANK */}

                  <View
                    style={[
                      styles.rankBadge,
                      {
                        backgroundColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.rankText
                      }
                    >
                      #{index + 1}
                    </Text>
                  </View>

                  {/* VERIFIED */}

                  {profile.isVerified && (
                    <View
                      style={[
                        styles.verifiedBadge,
                        {
                          backgroundColor:
                            theme.primary,
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.verifiedText
                        }
                      >
                        ✓
                      </Text>
                    </View>
                  )}
                </View>

                {/* CONTENT */}

                <View
                  style={
                    styles.profileContent
                  }
                >
                  <View
                    style={
                      styles.profileTopRow
                    }
                  >
                    <View
                      style={
                        styles.profileNameBlock
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.profileName,
                          {
                            color:
                              theme.text,
                          },
                        ]}
                      >
                        {profile.name},{" "}
                        {profile.age}
                      </Text>

                      <Text
                        style={[
                          styles.distance,
                          {
                            color:
                              theme.textMuted,
                          },
                        ]}
                      >
                        📍{" "}
                        {profile.distance ||
                          "Distance unavailable"}
                      </Text>
                    </View>

                    {/* COMPATIBILITY */}

                    <View
                      style={[
                        styles.compatibilityBadge,
                        {
                          backgroundColor:
                            isDark
                              ? "rgba(255,107,138,0.14)"
                              : "#FFF0F4",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.compatibilityPercent,
                          {
                            color:
                              theme.coral,
                          },
                        ]}
                      >
                        {profile.compatibility}%
                      </Text>

                      <Text
                        style={[
                          styles.compatibilityLabel,
                          {
                            color:
                              theme.textMuted,
                          },
                        ]}
                      >
                        match
                      </Text>
                    </View>
                  </View>

                  {/* BIO */}

                  {!!profile.bio && (
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.bio,
                        {
                          color:
                            theme.textMuted,
                        },
                      ]}
                    >
                      {profile.bio}
                    </Text>
                  )}

                  {/* SHARED INTERESTS */}

                  {profile.sharedInterests
                    ?.length > 0 && (
                    <View
                      style={
                        styles.sharedSection
                      }
                    >
                      <View
                        style={
                          styles.sharedTitleRow
                        }
                      >
                        <Text
                          style={[
                            styles.sharedIcon,
                            {
                              color:
                                theme.coral,
                            },
                          ]}
                        >
                          ♥
                        </Text>

                        <Text
                          style={[
                            styles.sharedTitle,
                            {
                              color:
                                theme.text,
                            },
                          ]}
                        >
                          You both like
                        </Text>
                      </View>

                      <View
                        style={
                          styles.tagRow
                        }
                      >
                        {profile.sharedInterests
                          .slice(0, 4)
                          .map(
                            (
                              interest
                            ) => (
                              <View
                                key={
                                  interest
                                }
                                style={[
                                  styles.tag,
                                  {
                                    backgroundColor:
                                      theme.background,
                                    borderColor:
                                      theme.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.tagText,
                                    {
                                      color:
                                        theme.text,
                                    },
                                  ]}
                                >
                                  {interest}
                                </Text>
                              </View>
                            )
                          )}
                      </View>
                    </View>
                  )}

                  {/* REASONS */}

                  {profile.compatibilityReasons
                    ?.length > 0 && (
                    <View
                      style={
                        styles.reasonsBox
                      }
                    >
                      {profile.compatibilityReasons
                        .slice(0, 3)
                        .map(
                          (
                            reason,
                            reasonIndex
                          ) => (
                            <View
                              key={`${profile.id}-reason-${reasonIndex}`}
                              style={
                                styles.reasonRow
                              }
                            >
                              <View
                                style={[
                                  styles.reasonDot,
                                  {
                                    backgroundColor:
                                      theme.success,
                                  },
                                ]}
                              />

                              <Text
                                style={[
                                  styles.reasonText,
                                  {
                                    color:
                                      theme.textMuted,
                                  },
                                ]}
                              >
                                {reason}
                              </Text>
                            </View>
                          )
                        )}
                    </View>
                  )}

                  {/* VIEW PROFILE */}

                  <View
                    style={
                      styles.viewProfileRow
                    }
                  >
                    <Text
                      style={[
                        styles.viewProfileText,
                        {
                          color:
                            theme.primary,
                        },
                      ]}
                    >
                      View profile
                    </Text>

                    <Text
                      style={[
                        styles.viewProfileArrow,
                        {
                          color:
                            theme.primary,
                        },
                      ]}
                    >
                      →
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }
        )}

        {/* =================================================
            BOTTOM MESSAGE
        ================================================= */}

        <View
          style={[
            styles.bottomCard,
            {
              backgroundColor:
                theme.surface,
              borderColor:
                theme.border,
            },
          ]}
        >
          <Text style={styles.bottomEmoji}>
            💜
          </Text>

          <Text
            style={[
              styles.bottomTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Your vibe is unique
          </Text>

          <Text
            style={[
              styles.bottomText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Compatibility is a starting point,
            not the whole story. Say hi and see
            where the vibe goes.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: 18,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loadingCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loadingEmoji: {
    fontSize: 31,
  },

  stateTitle: {
    marginTop: 8,
    ...typography.h3,
    textAlign: "center",
  },

  stateText: {
    marginTop: 8,
    ...typography.body,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 310,
  },

  retryButton: {
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 25,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    color: "#FFFFFF",
    ...typography.smallButton,
  },

  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 33,
    fontWeight: "300",
    marginTop: -3,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "850",
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  headerBadge: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 9,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadgeText: {
    fontSize: 14,
    fontWeight: "900",
  },

  introCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  introEmoji: {
    fontSize: 25,
  },

  introContent: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    fontSize: 14,
    fontWeight: "850",
  },

  introText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
  },

  resultsHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsTitle: {
    fontSize: 16,
    fontWeight: "850",
  },

  resultsSubtitle: {
    marginTop: 3,
    fontSize: 10,
  },

  resultsSpark: {
    fontSize: 22,
  },

  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 13,
  },

  imageWrapper: {
    height: 245,
    position: "relative",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackEmoji: {
    fontSize: 38,
  },

  rankBadge: {
    position: "absolute",
    left: 13,
    top: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  rankText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  verifiedBadge: {
    position: "absolute",
    right: 13,
    top: 13,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  profileContent: {
    padding: 14,
  },

  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  profileNameBlock: {
    flex: 1,
    paddingRight: 10,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "850",
  },

  distance: {
    marginTop: 4,
    fontSize: 10,
  },

  compatibilityBadge: {
    minWidth: 57,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },

  compatibilityPercent: {
    fontSize: 15,
    fontWeight: "900",
  },

  compatibilityLabel: {
    marginTop: 1,
    fontSize: 8,
  },

  bio: {
    marginTop: 11,
    fontSize: 12,
    lineHeight: 18,
  },

  sharedSection: {
    marginTop: 12,
  },

  sharedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sharedIcon: {
    fontSize: 13,
    marginRight: 6,
  },

  sharedTitle: {
    fontSize: 11,
    fontWeight: "800",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 7,
  },

  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  tagText: {
    fontSize: 10,
    fontWeight: "700",
  },

  reasonsBox: {
    marginTop: 12,
    gap: 6,
  },

  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  reasonText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },

  viewProfileRow: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#EDE9F0",
    flexDirection: "row",
    alignItems: "center",
  },

  viewProfileText: {
    fontSize: 12,
    fontWeight: "850",
  },

  viewProfileArrow: {
    marginLeft: 5,
    fontSize: 17,
    fontWeight: "700",
  },

  bottomCard: {
    marginTop: 10,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },

  bottomEmoji: {
    fontSize: 27,
  },

  bottomTitle: {
    marginTop: 9,
    fontSize: 16,
    fontWeight: "850",
    textAlign: "center",
  },

  bottomText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 290,
  },

  bottomSpace: {
    height: 25,
  },
});