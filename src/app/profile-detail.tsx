import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getPublicProfile } from "../services/profile.service";
import {
  likeProfile,
  passProfile,
  superlikeProfile,
} from "../services/interaction.service";

const COLORS = {
  plum: "#6D3DF5",
  darkPurple: "#4B22B8",
  coral: "#FF6B8A",
  peach: "#FFB38A",
  lavender: "#B9A2FF",
  cream: "#FFF9F5",
  white: "#FFFFFF",
  charcoal: "#17151C",
  muted: "#716D78",
  border: "#EDE9F0",
  success: "#35C98A",
  danger: "#FF5C72",
};

type PublicProfile = {
  id: string;
  user?: string;
  name: string;
  age: number;
  gender?: string;
  interestedIn?: string;
  bio: string;
  description?: string;
  interests: string[];
  photos: string[];
  primaryPhoto?: string | null;
  datingIntention: string;
  prompts: {
    question: string;
    answer: string;
  }[];
  isVerified: boolean;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ProfileDetailScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const profileId = useMemo(() => {
    if (Array.isArray(params.id)) {
      return params.id[0];
    }

    return params.id;
  }, [params.id]);

  const [profile, setProfile] =
    useState<PublicProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState<{
      title: string;
      message: string;
      type: "like" | "pass" | "superlike";
    } | null>(null);

  const [activePhotoIndex, setActivePhotoIndex] =
    useState(0);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!profileId) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const response =
          await getPublicProfile(profileId);

        if (!mounted) {
          return;
        }

        setProfile(response.data.profile);
      } catch (error) {
        console.error(
          "Profile detail error:",
          error
        );

        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [profileId]);

  const photos =
    profile?.photos?.length
      ? profile.photos
      : profile?.primaryPhoto
      ? [profile.primaryPhoto]
      : [];

  const currentPhoto =
    photos[activePhotoIndex] ||
    photos[0] ||
    null;

const handleBack = () => {
  router.back();
};

  const handlePreviousPhoto = () => {
    if (photos.length <= 1) {
      return;
    }

    setActivePhotoIndex((current) =>
      current === 0
        ? photos.length - 1
        : current - 1
    );
  };

  const handleNextPhoto = () => {
    if (photos.length <= 1) {
      return;
    }

    setActivePhotoIndex((current) =>
      current === photos.length - 1
        ? 0
        : current + 1
    );
  };

const handleAction = async (
  type: "like" | "pass" | "superlike"
) => {
  Alert.alert(
    "Button Working 💜",
    `You pressed ${type}`
  );

  if (!profile || actionLoading) {
    return;
  }

  const targetUserId = profile.user;

  if (!targetUserId) {
    Alert.alert(
      "Oops 💜",
      "We couldn't connect with this profile right now."
    );
    return;
  }

  setActionLoading(true);

  // Show the sweet feedback immediately
  if (type === "like") {
    setActionMessage({
      title: "A little heart sent 💜",
      message: `You let ${profile.name} know you're interested.`,
      type: "like",
    });
  }

  if (type === "superlike") {
    setActionMessage({
      title: "Someone caught your eye ⭐",
      message: `Your Super Like is on its way to ${profile.name}.`,
      type: "superlike",
    });
  }

  if (type === "pass") {
    setActionMessage({
      title: "No worries, lovely 💜",
      message:
        "Vibes are personal. We'll keep looking for someone who feels right.",
      type: "pass",
    });
  }

  try {
    if (type === "like") {
      await likeProfile(targetUserId);
    }

    if (type === "pass") {
      await passProfile(targetUserId);
    }

    if (type === "superlike") {
      await superlikeProfile(targetUserId);
    }

    // Pass: safely leave the profile after the message appears
    if (type === "pass") {
  setTimeout(() => {
    router.replace("/discover");
  }, 1200);
}
  } catch (error) {
    console.error(
      "Profile action error:",
      error
    );

    setActionMessage({
      title: "Couldn't save that 💜",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      type,
    });
  } finally {
    setActionLoading(false);
  }
};




  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={COLORS.plum}
          />

          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.errorContainer}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>
              ♡
            </Text>
          </View>

          <Text style={styles.errorTitle}>
            Profile not found
          </Text>

          <Text style={styles.errorMessage}>
            This profile may no longer be
            available.
          </Text>

          <Pressable
            onPress={handleBack}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Profile
          </Text>

          <Pressable
            onPress={() =>
              Alert.alert(
                "More options",
                "Profile reporting and blocking will be available here."
              )
            }
            style={styles.headerButton}
          >
            <Text style={styles.moreText}>
              •••
            </Text>
          </Pressable>
        </View>

   

        {/* Photo */}
        <View style={styles.photoContainer}>
          {currentPhoto ? (
            <Image
              source={{
                uri: currentPhoto,
              }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                No photo
              </Text>
            </View>
          )}

          {photos.length > 1 && (
            <>
              <Pressable
                onPress={handlePreviousPhoto}
                style={[
                  styles.photoArrow,
                  styles.photoArrowLeft,
                ]}
              >
                <Text style={styles.photoArrowText}>
                  ‹
                </Text>
              </Pressable>

              <Pressable
                onPress={handleNextPhoto}
                style={[
                  styles.photoArrow,
                  styles.photoArrowRight,
                ]}
              >
                <Text style={styles.photoArrowText}>
                  ›
                </Text>
              </Pressable>

              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>
                  {activePhotoIndex + 1} /{" "}
                  {photos.length}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Photo dots */}
        {photos.length > 1 && (
          <View style={styles.dotsContainer}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activePhotoIndex &&
                    styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}

        {/* Basic info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.name}
              {profile.age
                ? `, ${profile.age}`
                : ""}
            </Text>

            {profile.isVerified && (
              <View
                style={styles.verifiedBadge}
              >
                <Text
                  style={styles.verifiedText}
                >
                  ✓
                </Text>
              </View>
            )}
          </View>

          {profile.gender && (
            <Text style={styles.metaText}>
              {profile.gender}
            </Text>
          )}

          {profile.interestedIn && (
            <Text style={styles.metaText}>
              Interested in{" "}
              {profile.interestedIn}
            </Text>
          )}

          {profile.lastActiveAt && (
            <View style={styles.activeRow}>
              <View
                style={styles.activeDotSmall}
              />

              <Text
                style={styles.activeText}
              >
                Recently active
              </Text>
            </View>
          )}
        </View>

        {/* Dating intention */}
        {profile.datingIntention && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              LOOKING FOR
            </Text>

            <View style={styles.intentionPill}>
              <Text style={styles.intentionText}>
                {profile.datingIntention}
              </Text>
            </View>
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              ABOUT
            </Text>

            <Text style={styles.bodyText}>
              {profile.bio}
            </Text>
          </View>
        )}

        {/* Description */}
        {profile.description && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              MORE ABOUT ME
            </Text>

            <Text style={styles.bodyText}>
              {profile.description}
            </Text>
          </View>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              INTERESTS
            </Text>

            <View style={styles.interestsContainer}>
              {profile.interests.map(
                (interest, index) => (
                  <View
                    key={`${interest}-${index}`}
                    style={styles.interestPill}
                  >
                    <Text
                      style={
                        styles.interestText
                      }
                    >
                      {interest}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {/* Prompts */}
        {profile.prompts?.length > 0 && (
          <View style={styles.promptsSection}>
            <Text style={styles.sectionLabel}>
              GET TO KNOW {profile.name.toUpperCase()}
            </Text>

            {profile.prompts.map(
              (prompt, index) => (
                <View
                  key={`${prompt.question}-${index}`}
                  style={styles.promptCard}
                >
                  <Text
                    style={styles.promptQuestion}
                  >
                    {prompt.question}
                  </Text>

                  <Text
                    style={styles.promptAnswer}
                  >
                    {prompt.answer}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

         {actionMessage && (
          <View
            style={[
              styles.actionMessageCard,
              actionMessage.type === "like" &&
                styles.actionMessageLike,
              actionMessage.type === "superlike" &&
                styles.actionMessageSuperlike,
              actionMessage.type === "pass" &&
                styles.actionMessagePass,
            ]}
          >
            <View style={styles.actionMessageIcon}>
              <Text style={styles.actionMessageIconText}>
                {actionMessage.type === "like"
                  ? "♥"
                  : actionMessage.type === "superlike"
                  ? "★"
                  : "♡"}
              </Text>
            </View>

            <View style={styles.actionMessageContent}>
              <Text style={styles.actionMessageTitle}>
                {actionMessage.title}
              </Text>

              <Text style={styles.actionMessageText}>
                {actionMessage.message}
              </Text>
            </View>

            <Pressable
              onPress={() => setActionMessage(null)}
              style={styles.actionMessageClose}
              hitSlop={8}
            >
              <Text style={styles.actionMessageCloseText}>
                ×
              </Text>
            </Pressable>
          </View>
        )}

        {/* Bottom actions */}
        <View style={styles.actionsSection}>
          <Pressable
            disabled={actionLoading}
            onPress={() =>
              handleAction("pass")
            }
            style={[
              styles.actionButton,
              styles.passButton,
            ]}
          >
            <Text style={styles.passIcon}>
              ×
            </Text>

            <Text style={styles.passText}>
              Pass
            </Text>
          </Pressable>

          <Pressable
            disabled={actionLoading}
            onPress={() =>
              handleAction("superlike")
            }
            style={[
              styles.actionButton,
              styles.superlikeButton,
            ]}
          >
            <Text
              style={styles.superlikeIcon}
            >
              ★
            </Text>

            <Text
              style={styles.superlikeText}
            >
              Super Like
            </Text>
          </Pressable>

          <Pressable
            disabled={actionLoading}
            onPress={() =>
              handleAction("like")
            }
            style={[
              styles.actionButton,
              styles.likeButton,
            ]}
          >
            <Text style={styles.likeIcon}>
              ♥
            </Text>

            <Text style={styles.likeText}>
              Like
            </Text>
          </Pressable>
        </View>


            

        {actionLoading && (
          <ActivityIndicator
            size="small"
            color={COLORS.plum}
            style={styles.actionLoader}
          />
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  content: {
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: COLORS.muted,
  },

  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cream,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerButtonText: {
    fontSize: 34,
    lineHeight: 38,
    color: COLORS.charcoal,
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.charcoal,
  },

  actionMessageCard: {
    marginHorizontal: 18,
    marginTop: 8,
    padding: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#17151C",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  actionMessageLike: {
    backgroundColor: "#F7F0FF",
    borderColor: "#E4D7FF",
  },

  actionMessageSuperlike: {
    backgroundColor: "#FFF5EE",
    borderColor: "#FFE0CE",
  },

  actionMessagePass: {
    backgroundColor: "#FFF7F8",
    borderColor: "#FFDDE3",
  },

  actionMessageIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  actionMessageIconText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.plum,
  },

  actionMessageContent: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },

  actionMessageTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.charcoal,
    marginBottom: 3,
  },

  actionMessageText: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },

  actionMessageClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  actionMessageCloseText: {
    fontSize: 20,
    lineHeight: 22,
    color: COLORS.muted,
  },

  moreText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.charcoal,
  },

  photoContainer: {
    marginHorizontal: 14,
    height: 430,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#EDE8F5",
  },

  mainPhoto: {
    width: "100%",
    height: "100%",
  },

  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  photoPlaceholderText: {
    fontSize: 16,
    color: COLORS.muted,
  },

  photoArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  photoArrowLeft: {
    left: 14,
  },

  photoArrowRight: {
    right: 14,
  },

  photoArrowText: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.charcoal,
    marginTop: -3,
  },

  photoCounter: {
    position: "absolute",
    right: 14,
    top: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor:
      "rgba(23,21,28,0.65)",
  },

  photoCounterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },

  activeDot: {
    width: 18,
    backgroundColor: COLORS.plum,
  },

  infoSection: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 8,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.charcoal,
    letterSpacing: -0.6,
  },

  verifiedBadge: {
    marginLeft: 9,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: COLORS.plum,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },

  metaText: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.muted,
  },

  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  activeDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 7,
  },

  activeText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: "600",
  },

  card: {
    marginHorizontal: 18,
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.muted,
    marginBottom: 12,
  },

  intentionPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#F1ECFF",
  },

  intentionText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.plum,
  },

  bodyText: {
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.charcoal,
  },

  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  interestPill: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#FAF7FF",
    borderWidth: 1,
    borderColor: "#E5DDFB",
  },

  interestText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.charcoal,
  },

  promptsSection: {
    marginHorizontal: 18,
    marginTop: 22,
  },

  promptCard: {
    padding: 19,
    borderRadius: 22,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  promptQuestion: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.plum,
    marginBottom: 9,
  },

  promptAnswer: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "700",
    color: COLORS.charcoal,
  },

  actionsSection: {
    flexDirection: "row",
    paddingHorizontal: 18,
    marginTop: 25,
    gap: 8,
  },

  actionButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  passButton: {
    backgroundColor: COLORS.white,
    borderColor: "#FFD8DF",
  },

  superlikeButton: {
    backgroundColor: "#F4F0FF",
    borderColor: "#DDD1FF",
  },

  likeButton: {
    backgroundColor: COLORS.plum,
    borderColor: COLORS.plum,
  },

  passIcon: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.danger,
  },

  passText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.danger,
  },

  superlikeIcon: {
    fontSize: 20,
    color: COLORS.plum,
  },

  superlikeText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.plum,
  },

  likeIcon: {
    fontSize: 19,
    color: COLORS.white,
  },

  likeText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.white,
  },

  actionLoader: {
    marginTop: 12,
  },

  bottomSpace: {
    height: 20,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  backButton: {
    position: "absolute",
    top: 20,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    fontSize: 34,
    lineHeight: 38,
    color: COLORS.charcoal,
    marginTop: -4,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  errorIconText: {
    fontSize: 34,
    color: COLORS.plum,
  },

  errorTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.charcoal,
    marginBottom: 8,
  },

  errorMessage: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.muted,
    marginBottom: 24,
  },

  primaryButton: {
    minWidth: 150,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: COLORS.plum,
    alignItems: "center",
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
});