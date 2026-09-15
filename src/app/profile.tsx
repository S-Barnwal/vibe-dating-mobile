import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useProfileStore } from "../store/profileStore";
import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";
import {
  getMyProfile,
  type ProfileData,
  type ProfileUser,
} from "../services/profile.service";

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();

  const localProfile = useProfileStore((state) => state.profile);

  const updateLocalProfile = useProfileStore(
    (state) => state.updateProfile
  );

  const [profileData, setProfileData] =
    useState<ProfileData | null>(null);

  const [userData, setUserData] =
    useState<ProfileUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [activePhotoIndex, setActivePhotoIndex] =
    useState(0);

  const [imageWidth, setImageWidth] =
    useState(0);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await getMyProfile();

      const backendProfile = response.data.profile;
      const backendUser = response.data.user;

      setProfileData(backendProfile);
      setUserData(backendUser);

      updateLocalProfile({
        name: backendUser.name,
        age: backendProfile.age,
        bio: backendProfile.bio,
        image:
          backendProfile.primaryPhoto ||
          backendProfile.photos?.[0] ||
          localProfile.image,
        interests: backendProfile.interests,
        datingIntention:
          backendProfile.datingIntention,
        promptQuestion:
          backendProfile.prompts?.[0]?.question || "",
        promptAnswer:
          backendProfile.prompts?.[0]?.answer || "",
      });
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const profile = profileData
    ? {
        name:
          userData?.name ||
          localProfile.name,

        age: profileData.age,

        bio: profileData.bio,

        image:
          profileData.primaryPhoto ||
          profileData.photos?.[0] ||
          localProfile.image,

        interests:
          profileData.interests,

        datingIntention:
          profileData.datingIntention,

        promptQuestion:
          profileData.prompts?.[0]?.question ||
          "",

        promptAnswer:
          profileData.prompts?.[0]?.answer ||
          "",
      }
    : localProfile;

  const description =
    profileData?.description || "";

  const gender =
    profileData?.gender || "";

  const interestedIn =
    profileData?.interestedIn || "";

  const photos =
    profileData?.photos || [];

  /*
   * Backend photos are the source of truth.
   *
   * If backend has photos:
   *   use all uploaded photos.
   *
   * If backend doesn't have photos:
   *   use the local profile image as fallback.
   */
  const galleryPhotos = useMemo(() => {
    if (photos.length > 0) {
      return photos;
    }

    if (profile.image) {
      return [profile.image];
    }

    return [];
  }, [photos, profile.image]);

  const isVerified =
    profileData?.isVerified ?? false;

  const hasLocation =
    Boolean(profileData?.location);

  const hasPrompt =
    Boolean(profile.promptQuestion) &&
    Boolean(profile.promptAnswer);

  /*
   * Reset photo index whenever fresh profile
   * data is loaded.
   */
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [profileData?.id]);

  const handlePhotoScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!imageWidth) return;

    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(
      offsetX / imageWidth
    );

    if (
      index >= 0 &&
      index < galleryPhotos.length
    ) {
      setActivePhotoIndex(index);
    }
  };

  const goToPhoto = (index: number) => {
    if (!imageWidth) return;

    setActivePhotoIndex(index);

    /*
     * The actual ScrollView is controlled by
     * swipe. Dots are visual indicators.
     *
     * Users can swipe left/right naturally.
     */
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View>
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

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Your profile
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push("/settings")
            }
            style={({ pressed }) => [
              styles.settingsButton,
              {
                backgroundColor:
                  theme.surface,

                borderColor:
                  theme.border,

                opacity: pressed
                  ? 0.75
                  : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.settingsIcon,
                {
                  color: theme.text,
                },
              ]}
            >
              ⚙
            </Text>
          </Pressable>
        </View>

        {/* ================= LOADING ================= */}

        {loading && (
          <View
            style={[
              styles.loadingBox,
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
              color={theme.primary}
            />

            <Text
              style={[
                styles.loadingText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              Loading your profile...
            </Text>
          </View>
        )}

        {/* ================= PROFILE CARD ================= */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,
            },
          ]}
        >
          {/* ================= PHOTO GALLERY ================= */}

          <View
            style={styles.imageContainer}
            onLayout={(event) => {
              const width =
                event.nativeEvent.layout
                  .width;

              setImageWidth(width);
            }}
          >
            {galleryPhotos.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                scrollEventThrottle={16}
                onScroll={
                  handlePhotoScroll
                }
                style={
                  styles.photoScroll
                }
              >
                {galleryPhotos.map(
                  (photo, index) => (
                    <View
                      key={`${photo}-${index}`}
                      style={[
                        styles.photoPage,
                        {
                          width:
                            imageWidth ||
                            undefined,
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri: photo,
                        }}
                        style={
                          styles.profileImage
                        }
                      />
                    </View>
                  )
                )}
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.emptyImage,
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
                    styles.emptyImageText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  Add photo
                </Text>
              </View>
            )}

            {/* ================= ACTIVE BADGE ================= */}

            <View
              style={[
                styles.onlineBadge,
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
                  styles.onlineDot,
                  {
                    backgroundColor:
                      theme.success,
                  },
                ]}
              />

              <Text
                style={[
                  styles.onlineText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Active
              </Text>
            </View>

            {/* ================= PHOTO COUNTER ================= */}

            {galleryPhotos.length > 1 && (
              <View
                style={[
                  styles.photoCountBadge,
                  {
                    backgroundColor:
                      "rgba(23, 21, 28, 0.72)",
                  },
                ]}
              >
                <Text
                  style={
                    styles.photoCountText
                  }
                >
                  {activePhotoIndex + 1} /{" "}
                  {galleryPhotos.length}
                </Text>
              </View>
            )}

            {/* ================= PHOTO DOTS ================= */}

            {galleryPhotos.length > 1 && (
              <View
                style={
                  styles.photoIndicators
                }
              >
                {galleryPhotos.map(
                  (_, index) => (
                    <Pressable
                      key={index}
                      onPress={() =>
                        goToPhoto(index)
                      }
                      style={[
                        styles.photoIndicator,
                        {
                          width:
                            index ===
                            activePhotoIndex
                              ? 18
                              : 6,

                          backgroundColor:
                            index ===
                            activePhotoIndex
                              ? "#FFFFFF"
                              : "rgba(255,255,255,0.55)",
                        },
                      ]}
                    />
                  )
                )}
              </View>
            )}

            {/* ================= SWIPE HINT ================= */}

            {galleryPhotos.length > 1 &&
              activePhotoIndex === 0 && (
                <View
                  style={
                    styles.swipeHint
                  }
                >
                  <Text
                    style={
                      styles.swipeHintText
                    }
                  >
                    Swipe to see more →
                  </Text>
                </View>
              )}
          </View>

          {/* ================= BASIC INFO ================= */}

          <View
            style={styles.profileInfo}
          >
            <View
              style={styles.nameRow}
            >
              <Text
                style={[
                  styles.name,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {profile.name},{" "}
                {profile.age}
              </Text>

              {isVerified && (
                <View
                  style={[
                    styles.verified,
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

            <Text
              style={[
                styles.locationStatus,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              📍{" "}
              {hasLocation
                ? "Location enabled"
                : "Location not enabled"}
            </Text>

            <Text
              style={[
                styles.bio,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {profile.bio ||
                "Add a bio to tell people about you."}
            </Text>
          </View>
        </View>

        {/* ================= ACTIONS ================= */}

        <View
          style={styles.mainActions}
        >
          <Pressable
            onPress={() =>
              router.push(
                "/edit-profile"
              )
            }
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor:
                  theme.primary,

                opacity: pressed
                  ? 0.9
                  : 1,

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
              style={
                styles.primaryButtonText
              }
            >
              Edit Profile
            </Text>

            <Text
              style={
                styles.buttonArrow
              }
            >
              →
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                "/profile-preview"
              )
            }
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor:
                  theme.surface,

                borderColor:
                  theme.border,

                opacity: pressed
                  ? 0.8
                  : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Preview Profile
            </Text>
          </Pressable>
        </View>

        {/* ================= ABOUT ================= */}

        {description.trim()
          .length > 0 && (
          <View
            style={styles.section}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              About
            </Text>

            <View
              style={[
                styles.descriptionCard,
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
                  styles.descriptionText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {description}
              </Text>
            </View>
          </View>
        )}

        {/* ================= PERSONAL DETAILS ================= */}

        {(gender ||
          interestedIn) && (
          <View
            style={styles.section}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              About you
            </Text>

            <View
              style={
                styles.detailGrid
              }
            >
              {gender && (
                <View
                  style={[
                    styles.detailCard,
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
                      styles.detailLabel,
                      {
                        color:
                          theme.textMuted,
                      },
                    ]}
                  >
                    Gender
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    {gender}
                  </Text>
                </View>
              )}

              {interestedIn && (
                <View
                  style={[
                    styles.detailCard,
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
                      styles.detailLabel,
                      {
                        color:
                          theme.textMuted,
                      },
                    ]}
                  >
                    Interested in
                  </Text>

                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    {interestedIn}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= INTERESTS ================= */}

        <View
          style={styles.section}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Interests
          </Text>

          <View
            style={styles.interests}
          >
            {profile.interests.map(
              (interest) => (
                <View
                  key={interest}
                  style={[
                    styles.interest,
                    {
                      backgroundColor:
                        isDark
                          ? "rgba(154, 122, 255, 0.12)"
                          : "rgba(109, 61, 245, 0.08)",

                      borderColor:
                        isDark
                          ? "rgba(154, 122, 255, 0.25)"
                          : "rgba(109, 61, 245, 0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.interestText,
                      {
                        color:
                          theme.primary,
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

        {/* ================= DATING INTENTION ================= */}

        <View
          style={styles.section}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Dating intention
          </Text>

          <View
            style={[
              styles.infoCard,
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
                styles.infoIconBox,
                {
                  backgroundColor:
                    isDark
                      ? "rgba(255, 113, 143, 0.12)"
                      : "rgba(255, 107, 138, 0.10)",
                },
              ]}
            >
              <Text
                style={[
                  styles.infoIcon,
                  {
                    color:
                      theme.coral,
                  },
                ]}
              >
                ♥
              </Text>
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color:
                      theme.textMuted,
                  },
                ]}
              >
                Looking for
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {profile.datingIntention ||
                  "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= PROMPT ================= */}

        {hasPrompt && (
          <View
            style={styles.section}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Profile prompt
            </Text>

            <View
              style={[
                styles.promptCard,
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
                  styles.promptQuestion,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                {
                  profile.promptQuestion
                }
              </Text>

              <Text
                style={[
                  styles.promptAnswer,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {
                  profile.promptAnswer
                }
              </Text>
            </View>
          </View>
        )}

        {/* ================= PROFILE COMPLETION ================= */}

        {profileData && (
          <View
            style={styles.section}
          >
            <View
              style={[
                styles.profileStatusCard,
                {
                  backgroundColor:
                    isDark
                      ? "#19161F"
                      : "#FFFFFF",

                  borderColor:
                    theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statusIconBox,
                  {
                    backgroundColor:
                      isDark
                        ? "rgba(53, 201, 138, 0.12)"
                        : "#EAF9F2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusIcon,
                    {
                      color:
                        theme.success,
                    },
                  ]}
                >
                  ✓
                </Text>
              </View>

              <View
                style={
                  styles.statusContent
                }
              >
                <Text
                  style={[
                    styles.statusTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Profile complete
                </Text>

                <Text
                  style={[
                    styles.statusSubtitle,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  Your profile is ready
                  to be discovered.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= PREMIUM ================= */}

        <Pressable
          onPress={() =>
            router.push("/premium")
          }
          style={({ pressed }) => [
            styles.premiumCard,
            {
              backgroundColor:
                isDark
                  ? "#211D29"
                  : "#F3EEFF",

              borderColor:
                isDark
                  ? "#40384A"
                  : "#DED4FF",

              opacity: pressed
                ? 0.9
                : 1,
            },
          ]}
        >
          <View
            style={[
              styles.premiumIconBox,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={
                styles.premiumIcon
              }
            >
              ✦
            </Text>
          </View>

          <View
            style={
              styles.premiumContent
            }
          >
            <Text
              style={[
                styles.premiumTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Vibe Premium
            </Text>

            <Text
              style={[
                styles.premiumSubtitle,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              Unlock more ways to
              connect
            </Text>
          </View>

          <Text
            style={[
              styles.premiumArrow,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            →
          </Text>
        </Pressable>

        <View
          style={{ height: 30 }}
        />
      </ScrollView>

      {/* ================= BOTTOM NAV ================= */}

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor:
              theme.background,

            borderTopColor:
              theme.border,
          },
        ]}
      >
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              "/discover"
            )
          }
        >
          <Text
            style={[
              styles.navIcon,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Discover
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/likes")
          }
        >
          <Text
            style={[
              styles.navIcon,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            ♡
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Likes
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              "/matches"
            )
          }
        >
          <Text
            style={[
              styles.navIcon,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            ◉
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Matches
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace(
              "/profile"
            )
          }
        >
          <Text
            style={[
              styles.navIconActive,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            ☻
          </Text>

          <Text
            style={[
              styles.navTextActive,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            Profile
          </Text>
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
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 90,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  logo: {
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -1,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  settingsIcon: {
    fontSize: 21,
  },

  /* ================= LOADING ================= */

  loadingBox: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  loadingText: {
    marginLeft: 9,
    fontSize: 13,
    fontWeight: "600",
  },

  /* ================= PROFILE CARD ================= */

  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },

  imageContainer: {
    width: "100%",
    height: 390,
    position: "relative",
  },

  photoScroll: {
    flex: 1,
  },

  photoPage: {
    height: "100%",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  emptyImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyImageText: {
    fontSize: 15,
    fontWeight: "700",
  },

  onlineBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  onlineText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* ================= PHOTO COUNTER ================= */

  photoCountBadge: {
    position: "absolute",
    right: 15,
    bottom: 15,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
  },

  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* ================= PHOTO INDICATORS ================= */

  photoIndicators: {
    position: "absolute",
    bottom: 17,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  photoIndicator: {
    height: 6,
    borderRadius: 999,
  },

  /* ================= SWIPE HINT ================= */

  swipeHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: "center",
  },

  swipeHintText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    backgroundColor:
      "rgba(23, 21, 28, 0.60)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: "hidden",
  },

  /* ================= PROFILE INFO ================= */

  profileInfo: {
    padding: 18,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  verified: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  locationStatus: {
    marginTop: 6,
    fontSize: 13,
  },

  bio: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },

  /* ================= ACTIONS ================= */

  mainActions: {
    marginTop: 14,
    gap: 10,
  },

  primaryButton: {
    height: 54,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  secondaryButton: {
    height: 52,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    ...typography.smallButton,
  },

  /* ================= SECTIONS ================= */

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  /* ================= ABOUT ================= */

  descriptionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
  },

  descriptionText: {
    fontSize: 15,
    lineHeight: 23,
  },

  /* ================= PERSONAL DETAILS ================= */

  detailGrid: {
    flexDirection: "row",
    gap: 10,
  },

  detailCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: "center",
  },

  detailLabel: {
    fontSize: 11,
  },

  detailValue: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
  },

  /* ================= INTERESTS ================= */

  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  interest: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },

  interestText: {
    fontSize: 13,
    fontWeight: "600",
  },

  /* ================= INFO CARD ================= */

  infoCard: {
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoIcon: {
    fontSize: 19,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
  },

  /* ================= PROMPT ================= */

  promptCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
  },

  promptQuestion: {
    fontSize: 13,
    fontWeight: "700",
  },

  promptAnswer: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },

  /* ================= PROFILE STATUS ================= */

  profileStatusCard: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  statusIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statusIcon: {
    fontSize: 21,
    fontWeight: "800",
  },

  statusContent: {
    flex: 1,
    marginLeft: 12,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  statusSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  /* ================= PREMIUM ================= */

  premiumCard: {
    marginTop: 28,
    minHeight: 76,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  premiumIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  premiumIcon: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  premiumContent: {
    flex: 1,
    marginLeft: 12,
  },

  premiumTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  premiumSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  premiumArrow: {
    fontSize: 21,
    fontWeight: "600",
  },

  /* ================= BOTTOM NAV ================= */

  bottomNav: {
    height: 72,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    minWidth: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    fontSize: 22,
  },

  navIconActive: {
    fontSize: 22,
  },

  navText: {
    marginTop: 3,
    fontSize: 10,
  },

  navTextActive: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
  },
});