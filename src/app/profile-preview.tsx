import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { useProfileStore } from "../store/profileStore";
import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";
import {
  getMyProfile,
  type ProfileData,
  type ProfileUser,
} from "../services/profile.service";

export default function ProfilePreviewScreen() {
  const profile = useProfileStore((state) => state.profile);
  const updateLocalProfile = useProfileStore(
    (state) => state.updateProfile
  );

  const { theme, isDark } = useTheme();

  const [profileData, setProfileData] =
    useState<ProfileData | null>(null);

  const [userData, setUserData] =
    useState<ProfileUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [activePhotoIndex, setActivePhotoIndex] =
    useState(0);

  const [imageWidth, setImageWidth] =
    useState(0);

  const photoScrollRef =
    useRef<ScrollView>(null);

  const iconBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "rgba(109, 61, 245, 0.08)";

  const chipBackground = isDark
    ? "rgba(154, 122, 255, 0.16)"
    : "#F0E9FF";

  const infoBackground = isDark
    ? "rgba(255, 249, 245, 0.04)"
    : theme.background;

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await getMyProfile();

      const backendProfile = response.data.profile;
      const backendUser = response.data.user;

      setProfileData(backendProfile);
      setUserData(backendUser);

      /*
       * Keep local profile store synchronized
       * with the actual backend profile.
       */
      updateLocalProfile({
        name: backendUser.name,
        age: backendProfile.age,
        bio: backendProfile.bio,
        image:
          backendProfile.primaryPhoto ||
          backendProfile.photos?.[0] ||
          profile.image,
        interests: backendProfile.interests,
        datingIntention:
          backendProfile.datingIntention,
        promptQuestion:
          backendProfile.prompts?.[0]?.question ||
          "",
        promptAnswer:
          backendProfile.prompts?.[0]?.answer ||
          "",
      });
    } catch (error) {
      console.error(
        "Profile preview loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /*
   * Backend data is the source of truth.
   * Local store is only used as a fallback.
   */
  const displayName =
    userData?.name || profile.name;

  const displayAge =
    profileData?.age ?? profile.age;

  const displayBio =
    profileData?.bio || profile.bio;

  const displayInterests =
    profileData?.interests?.length
      ? profileData.interests
      : profile.interests;

  const displayDatingIntention =
    profileData?.datingIntention ||
    profile.datingIntention;

  const displayPromptQuestion =
    profileData?.prompts?.[0]?.question ||
    profile.promptQuestion;

  const displayPromptAnswer =
    profileData?.prompts?.[0]?.answer ||
    profile.promptAnswer;

  const description =
    profileData?.description || "";

  const hasLocation =
    Boolean(profileData?.location);

  const isVerified =
    profileData?.isVerified ?? false;

  /*
   * All photos from backend.
   */
  const galleryPhotos = useMemo(() => {
    if (
      profileData?.photos &&
      profileData.photos.length > 0
    ) {
      return profileData.photos;
    }

    if (profile.image) {
      return [profile.image];
    }

    return [];
  }, [
    profileData?.photos,
    profile.image,
  ]);

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

    photoScrollRef.current?.scrollTo({
      x: imageWidth * index,
      animated: true,
    });
  };

  /*
   * Reset gallery whenever fresh profile data
   * is loaded.
   */
  useEffect(() => {
    setActivePhotoIndex(0);

    photoScrollRef.current?.scrollTo({
      x: 0,
      animated: false,
    });
  }, [profileData?.id]);

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
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme.surface,
              borderColor:
                theme.border,
            },
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backIcon,
              {
                color:
                  theme.text,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View>
          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Profile preview
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
            How others see you
          </Text>
        </View>

        <View
          style={styles.headerSpacer}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
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
            style={styles.imageWrapper}
            onLayout={(event) => {
              setImageWidth(
                event.nativeEvent.layout
                  .width
              );
            }}
          >
            {galleryPhotos.length > 0 ? (
              <ScrollView
                ref={photoScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                scrollEventThrottle={16}
                onScroll={
                  handlePhotoScroll
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
                  Add photos
                </Text>
              </View>
            )}

            {/* ================= VERIFIED BADGE ================= */}

            {isVerified && (
              <View
                style={[
                  styles.verifiedBadge,
                  {
                    backgroundColor:
                      theme.primary,
                    borderColor:
                      theme.surface,
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

            {/* ================= PHOTO COUNTER ================= */}

            {galleryPhotos.length > 1 && (
              <View
                style={
                  styles.photoCounter
                }
              >
                <Text
                  style={
                    styles.photoCounterText
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

          {/* ================= NAME ================= */}

          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {displayName},{" "}
              {displayAge}
            </Text>

            {isVerified && (
              <View
                style={[
                  styles.smallVerified,
                  {
                    backgroundColor:
                      theme.primary,
                  },
                ]}
              >
                <Text
                  style={
                    styles.smallVerifiedText
                  }
                >
                  ✓
                </Text>
              </View>
            )}
          </View>

          {/* ================= LOCATION ================= */}

          <Text
            style={[
              styles.location,
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

          {/* ================= BIO ================= */}

          <Text
            style={[
              styles.bio,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {displayBio ||
              "Add a bio to tell people about you."}
          </Text>

          {/* ================= DESCRIPTION ================= */}

          {description.trim().length > 0 && (
            <View
              style={[
                styles.descriptionCard,
                {
                  backgroundColor:
                    infoBackground,
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
          )}

          {/* ================= INTERESTS ================= */}

          {displayInterests.length > 0 && (
            <View
              style={styles.interests}
            >
              {displayInterests.map(
                (interest) => (
                  <View
                    key={interest}
                    style={[
                      styles.interest,
                      {
                        backgroundColor:
                          chipBackground,
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
          )}

          {/* ================= LOOKING FOR ================= */}

          {displayDatingIntention && (
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor:
                    infoBackground,
                },
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      chipBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.infoIconText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  ♡
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
                  {
                    displayDatingIntention
                  }
                </Text>
              </View>
            </View>
          )}

          {/* ================= PROMPT ================= */}

          {displayPromptQuestion &&
            displayPromptAnswer && (
              <View
                style={[
                  styles.promptCard,
                  {
                    backgroundColor:
                      chipBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.promptLabel,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  {
                    displayPromptQuestion
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
                  "{displayPromptAnswer}"
                </Text>
              </View>
            )}
        </View>

        {/* ================= PREVIEW NOTICE ================= */}

        <View
          style={[
            styles.noticeCard,
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
              styles.noticeIcon,
              {
                backgroundColor:
                  iconBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.noticeIconText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              ◉
            </Text>
          </View>

          <View
            style={
              styles.noticeContent
            }
          >
            <Text
              style={[
                styles.noticeTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              This is your public profile
            </Text>

            <Text
              style={[
                styles.noticeText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              This is how your profile will
              appear to people while
              discovering you.
            </Text>
          </View>
        </View>

        {/* ================= EDIT ================= */}

        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            {
              backgroundColor:
                theme.primary,
              opacity: pressed
                ? 0.9
                : 1,
            },
          ]}
          onPress={() =>
            router.push(
              "/edit-profile"
            )
          }
        >
          <Text
            style={
              styles.editButtonText
            }
          >
            Edit Profile
          </Text>
        </Pressable>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
  },

  /* ================= HEADER ================= */

  header: {
    height: 66,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 31,
    fontWeight: "400",
    marginTop: -3,
  },

  headerTitle: {
    textAlign: "center",
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 2,
    textAlign: "center",
    ...typography.caption,
    fontSize: 11,
  },

  headerSpacer: {
    width: 42,
  },

  /* ================= CONTENT ================= */

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 35,
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
    borderRadius: 25,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 22,
  },

  /* ================= PHOTO ================= */

  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 390,
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

  verifiedBadge: {
    position: "absolute",
    right: 17,
    bottom: 17,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  /* ================= PHOTO COUNTER ================= */

  photoCounter: {
    position: "absolute",
    right: 15,
    top: 15,
    backgroundColor:
      "rgba(23, 21, 28, 0.72)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
  },

  photoCounterText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* ================= PHOTO DOTS ================= */

  photoIndicators: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    bottom: 47,
    alignItems: "center",
  },

  swipeHintText: {
    color: "#FFFFFF",
    backgroundColor:
      "rgba(23, 21, 28, 0.60)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "700",
  },

  /* ================= NAME ================= */

  nameRow: {
    marginTop: 17,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    ...typography.h2,
    fontSize: 27,
    fontWeight: "800",
  },

  smallVerified: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  smallVerifiedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  /* ================= LOCATION ================= */

  location: {
    paddingHorizontal: 18,
    marginTop: 5,
    ...typography.caption,
    fontSize: 13,
  },

  /* ================= BIO ================= */

  bio: {
    paddingHorizontal: 18,
    marginTop: 16,
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },

  /* ================= DESCRIPTION ================= */

  descriptionCard: {
    marginHorizontal: 18,
    marginTop: 16,
    padding: 14,
    borderRadius: 17,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
  },

  /* ================= INTERESTS ================= */

  interests: {
    paddingHorizontal: 18,
    marginTop: 17,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  interest: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },

  interestText: {
    ...typography.captionMedium,
    fontSize: 12,
  },

  /* ================= LOOKING FOR ================= */

  infoCard: {
    marginHorizontal: 18,
    marginTop: 20,
    padding: 14,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  infoIconText: {
    fontSize: 21,
  },

  infoContent: {
    marginLeft: 11,
    flex: 1,
  },

  infoLabel: {
    ...typography.caption,
    fontSize: 11,
  },

  infoValue: {
    marginTop: 2,
    ...typography.bodyMedium,
    fontSize: 14,
  },

  /* ================= PROMPT ================= */

  promptCard: {
    marginHorizontal: 18,
    marginTop: 12,
    padding: 16,
    borderRadius: 17,
  },

  promptLabel: {
    ...typography.captionMedium,
    fontSize: 12,
  },

  promptAnswer: {
    marginTop: 8,
    ...typography.body,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },

  /* ================= NOTICE ================= */

  noticeCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  noticeIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  noticeIconText: {
    fontSize: 17,
  },

  noticeContent: {
    flex: 1,
    marginLeft: 11,
  },

  noticeTitle: {
    ...typography.captionMedium,
    fontSize: 13,
  },

  noticeText: {
    marginTop: 3,
    ...typography.caption,
    fontSize: 11,
    lineHeight: 17,
  },

  /* ================= EDIT ================= */

  editButton: {
    height: 52,
    marginTop: 15,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    color: "#FFFFFF",
    ...typography.button,
    fontSize: 15,
  },

  bottomSpace: {
    height: 20,
  },
});