import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import {
  getBecauseYouLikeProfiles,
  type BecauseYouLikeProfile,
} from "../services/profile.service";

export default function BecauseYouLikeScreen() {
  const { theme, isDark } = useTheme();

  const [profiles, setProfiles] = useState<
    BecauseYouLikeProfile[]
  >([]);

  const [interest, setInterest] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfiles = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getBecauseYouLikeProfiles();

        if (!mounted) {
          return;
        }

        setInterest(
          response.data?.interest || null
        );

        setProfiles(
          response.data?.profiles || []
        );
      } catch (err) {
        console.error(
          "Because you like screen error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load profiles."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfiles();

    return () => {
      mounted = false;
    };
  }, []);

  const openProfile = (
    profile: BecauseYouLikeProfile
  ) => {
    router.push({
      pathname: "/profile-detail",
      params: {
        id: profile.id,
        name: profile.name ?? "",
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/discover");
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: theme.background,
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

        <ActivityIndicator
          size="small"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Finding your vibe...
        </Text>

        <Text
          style={[
            styles.loadingText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Looking for people who share
          your interests.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor: isDark
                ? "#21161C"
                : "#FFF0F4",
            },
          ]}
        >
          <Text style={styles.emptyEmoji}>
            💔
          </Text>
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Couldn't load profiles
        </Text>

        <Text
          style={[
            styles.emptyText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {error}
        </Text>

        <Pressable
          onPress={handleBack}
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <Text style={styles.primaryButtonText}>
            Back to Discover
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!interest || profiles.length === 0) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor: isDark
                ? "#211D29"
                : "#F3EEFF",
            },
          ]}
        >
          <Text style={styles.emptyEmoji}>
            💜
          </Text>
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: theme.text,
            },
          ]}
        >
          We're still finding your people
        </Text>

        <Text
          style={[
            styles.emptyText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          We couldn't find anyone matching
          your interests right now.
        </Text>

        <Pressable
          onPress={handleBack}
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <Text style={styles.primaryButtonText}>
            Back to Discover
          </Text>
        </Pressable>
      </View>
    );
  }

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

      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
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
            numberOfLines={1}
          >
            Because You Like
          </Text>

          <Text
            style={[
              styles.headerInterest,
              {
                color: theme.primary,
              },
            ]}
            numberOfLines={1}
          >
            {interest}
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: isDark
                ? "rgba(109,61,245,0.16)"
                : "#F3EEFF",
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              {
                color: theme.primary,
              },
            ]}
          >
            {profiles.length}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* INTRO */}

        <View
          style={[
            styles.introCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: isDark
                  ? "rgba(255,107,138,0.12)"
                  : "#FFF0F4",
              },
            ]}
          >
            <Text style={styles.introEmoji}>
              ✨
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
              Your kind of people
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              These people share your love
              for {interest.toLowerCase()}.
            </Text>
          </View>
        </View>

        {/* PROFILES */}

        <View style={styles.profileGrid}>
          {profiles.map((profile) => (
            <Pressable
              key={profile.id}
              onPress={() =>
                openProfile(profile)
              }
              style={[
                styles.profileCard,
                {
                  backgroundColor:
                    theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri:
                      profile.primaryPhoto ||
                      profile.photos?.[0],
                  }}
                  style={styles.profileImage}
                />

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
                      style={styles.verifiedText}
                    >
                      ✓
                    </Text>
                  </View>
                )}

                <View style={styles.imageOverlay} />

                <View
                  style={styles.profileBottom}
                >
                  <Text
                    style={styles.profileName}
                    numberOfLines={1}
                  >
                    {profile.name},{" "}
                    {profile.age}
                  </Text>

                  <Text
                    style={styles.profileDistance}
                  >
                    📍{" "}
                    {profile.distance ||
                      "Distance unavailable"}
                  </Text>
                </View>
              </View>

              <View
                style={styles.profileContent}
              >
                {!!profile.bio && (
                  <Text
                    style={[
                      styles.profileBio,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {profile.bio}
                  </Text>
                )}

                <View style={styles.tags}>
                  {profile.interests
                    .filter(
                      (item) =>
                        item.toLowerCase() ===
                        interest.toLowerCase()
                    )
                    .slice(0, 1)
                    .map((item) => (
                      <View
                        key={item}
                        style={[
                          styles.interestTag,
                          {
                            backgroundColor:
                              isDark
                                ? "rgba(109,61,245,0.14)"
                                : "#F3EEFF",
                            borderColor:
                              isDark
                                ? "rgba(185,162,255,0.25)"
                                : "#DED4FF",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.interestTagText,
                            {
                              color:
                                theme.primary,
                            },
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                </View>

                <View
                  style={[
                    styles.viewProfileButton,
                    {
                      backgroundColor:
                        theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.viewProfileText
                    }
                  >
                    View Profile →
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 18,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  loadingEmoji: {
    fontSize: 31,
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  loadingText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 290,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyEmoji: {
    fontSize: 31,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 300,
  },

  primaryButton: {
    marginTop: 20,
    minHeight: 46,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    marginBottom: 17,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 33,
    marginTop: -2,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  headerInterest: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
  },

  countBadge: {
    minWidth: 38,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 13,
    fontWeight: "900",
  },

  scrollContent: {
    paddingBottom: 25,
  },

  introCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  introEmoji: {
    fontSize: 23,
  },

  introContent: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  introText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
  },

  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 13,
  },

  profileCard: {
    width: "48.5%",
    borderRadius: 19,
    borderWidth: 1,
    overflow: "hidden",
  },

  imageWrapper: {
    width: "100%",
    height: 220,
    position: "relative",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor:
      "rgba(0,0,0,0.52)",
  },

  verifiedBadge: {
    position: "absolute",
    right: 9,
    top: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  profileBottom: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 9,
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  profileDistance: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 9,
    marginTop: 3,
  },

  profileContent: {
    padding: 10,
  },

  profileBio: {
    fontSize: 10,
    lineHeight: 15,
    minHeight: 30,
  },

  tags: {
    flexDirection: "row",
    marginTop: 8,
  },

  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  interestTagText: {
    fontSize: 9,
    fontWeight: "800",
  },

  viewProfileButton: {
    minHeight: 37,
    borderRadius: 11,
    marginTop: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  viewProfileText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 25,
  },
});