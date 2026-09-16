import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getMostCompatibleProfiles,
  type CompatibleProfile,
} from "../services/compatibility.service";
import { router, useFocusEffect } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

import {
  getDiscoverProfiles,
  getBecauseYouLikeProfiles,
  getNewHereProfiles,
  PublicProfile,
  type BecauseYouLikeProfile,
  type NewHereProfile,
} from "../services/profile.service";

import { useLikesStore } from "../store/likesStore";
import {
  likeProfile,
  passProfile,
  superlikeProfile,
} from "../services/interaction.service";

const exploreCategories = [
  {
    title: "Coffee Dates",
    icon: "☕",
    subtitle: "Meet coffee lovers",
  },
  {
    title: "Music Lovers",
    icon: "🎵",
    subtitle: "Share your playlist",
  },
  {
    title: "Travel",
    icon: "✈️",
    subtitle: "Find your travel buddy",
  },
  {
    title: "Movie Nights",
    icon: "🎬",
    subtitle: "For movie people",
  },
  {
    title: "Foodies",
    icon: "🍜",
    subtitle: "Good food, good vibes",
  },
  {
    title: "Fitness",
    icon: "🏋️",
    subtitle: "Stay active together",
  },
];

const intentionCards = [
  ["💜", "Something serious", "Looking for something real"],
  ["☕", "Something casual", "Keep it relaxed"],
  ["💍", "Marriage", "Ready for commitment"],
  ["💬", "New connections", "Meet interesting people"],
  ["🌱", "Figuring it out", "Open to possibilities"],
];

type DiscoverMyProfile = {
  id: string;
  interests: string[];
  datingIntention: string;
  gender: string;
  interestedIn: string;
};

const toLikeProfile = (profile: PublicProfile) => ({
  userId: profile.id,
  name: profile.name,
  age: profile.age,
  distance: profile.distance ?? "Distance unavailable",
  bio: profile.bio,
  image:
    profile.primaryPhoto ||
    profile.photos?.[0] ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900",
});

const getSharedInterests = (
  profile: PublicProfile,
  myInterests: string[]
) => {
  return profile.interests.filter((interest) =>
    myInterests.some(
      (mine) => mine.toLowerCase() === interest.toLowerCase()
    )
  );
};

export default function DiscoverScreen() {
  const { theme, isDark } = useTheme();

  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [myProfile, setMyProfile] = useState<DiscoverMyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [compatibleProfiles, setCompatibleProfiles] = useState<
    CompatibleProfile[]
  >([]);

  const [compatibleLoading, setCompatibleLoading] =
    useState(true);

    const [becauseYouLikeProfiles, setBecauseYouLikeProfiles] =
  useState<BecauseYouLikeProfile[]>([]);

const [becauseYouLikeInterest, setBecauseYouLikeInterest] =
  useState<string | null>(null);

const [becauseYouLikeLoading, setBecauseYouLikeLoading] =
  useState(true);

  const [newHereProfiles, setNewHereProfiles] =
  useState<NewHereProfile[]>([]);

const [newHereLoading, setNewHereLoading] =
  useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionMessage, setActionMessage] =
  useState<{
    title: string;
    message: string;
    type: "like" | "pass" | "superlike";
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;

  const addLike = useLikesStore((state) => state.addLike);


  useEffect(() => {
  let mounted = true;

  const loadMostCompatible = async () => {
    try {
      setCompatibleLoading(true);

      const response =
        await getMostCompatibleProfiles();

      if (!mounted) {
        return;
      }

      setCompatibleProfiles(
        response.data?.profiles || []
      );
    } catch (error) {
      console.error(
        "Most compatible error:",
        error
      );

      if (mounted) {
        setCompatibleProfiles([]);
      }
    } finally {
      if (mounted) {
        setCompatibleLoading(false);
      }
    }
  };

  loadMostCompatible();

  return () => {
    mounted = false;
  };
}, []);


useEffect(() => {
  let mounted = true;

  const loadBecauseYouLike = async () => {
    try {
      setBecauseYouLikeLoading(true);

      const response =
        await getBecauseYouLikeProfiles();

      if (!mounted) {
        return;
      }

      setBecauseYouLikeInterest(
        response.data?.interest || null
      );

      setBecauseYouLikeProfiles(
        response.data?.profiles || []
      );
    } catch (error) {
      console.error(
        "Because you like error:",
        error
      );

      if (mounted) {
        setBecauseYouLikeInterest(null);
        setBecauseYouLikeProfiles([]);
      }
    } finally {
      if (mounted) {
        setBecauseYouLikeLoading(false);
      }
    }
  };

  loadBecauseYouLike();

  return () => {
    mounted = false;
  };
}, []);


useEffect(() => {
  let mounted = true;

  const loadNewHere = async () => {
    try {
      setNewHereLoading(true);

      const response = await getNewHereProfiles();

      if (!mounted) {
        return;
      }

      setNewHereProfiles(
        response.data?.profiles || []
      );
    } catch (error) {
      console.error(
        "New here error:",
        error
      );

      if (mounted) {
        setNewHereProfiles([]);
      }
    } finally {
      if (mounted) {
        setNewHereLoading(false);
      }
    }
  };

  loadNewHere();

  return () => {
    mounted = false;
  };
}, []);


  /*
   * =====================================================
   * LOAD DISCOVER PROFILES
   * =====================================================
   */

  const loadProfiles = useCallback(async () => {
    try {
      setError("");

      const response = await getDiscoverProfiles();

      setProfiles(response.data.profiles);
      setMyProfile(response.data.myProfile);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Discover profiles error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load profiles."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [loadProfiles])
  );

  /*
   * =====================================================
   * PROFILE DATA
   * =====================================================
   */

  const profile = profiles[currentIndex];

  /*
   * Temporary client-side profile signals.
   *
   * Later these can come directly from:
   * - discovery preferences
   * - compatibility engine
   * - activity service
   * - likes service
   */

  const topPicks = useMemo(() => {
    return profiles.slice(0, 5);
  }, [profiles]);

  const nearbyProfiles = useMemo(() => {
    return [...profiles]
      .filter((item) => item.distance !== null)
      .sort((a, b) => {
        const distanceA = Number.parseFloat(
          a.distance?.replace(/[^\d.]/g, "") || "999"
        );

        const distanceB = Number.parseFloat(
          b.distance?.replace(/[^\d.]/g, "") || "999"
        );

        return distanceA - distanceB;
      });
  }, [profiles]);

  // const newProfiles = useMemo(() => {
  //   return [...profiles]
  //     .sort((a, b) => {
  //       const aTime = a.createdAt
  //         ? new Date(a.createdAt).getTime()
  //         : new Date(a.lastActiveAt).getTime();

  //       const bTime = b.createdAt
  //         ? new Date(b.createdAt).getTime()
  //         : new Date(b.lastActiveAt).getTime();

  //       return bTime - aTime;
  //     })
  //     .slice(0, 4);
  // }, [profiles]);

  const activeProfiles = useMemo(() => {
    return [...profiles]
      .sort(
        (a, b) =>
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime()
      )
      .slice(0, 6);
  }, [profiles]);

  /*
   * =====================================================
   * MY INTERESTS
   *
   * Discover API currently doesn't return the owner's
   * interests, so shared-interest matching is inferred
   * from the profiles available to the screen.
   *
   * Once preference endpoint is added, replace this.
   * =====================================================
   */

  const sharedInterestProfiles = useMemo(() => {
    if (!myProfile) return [];

    return profiles
      .map((item) => ({
        ...item,
        shared: getSharedInterests(
          item,
          myProfile.interests || []
        ),
      }))
      .filter((item) => item.shared.length > 0)
      .sort((a, b) => b.shared.length - a.shared.length)
      .slice(0, 4);
  }, [profiles, myProfile]);

  const calculateCompatibility = useCallback(
    (item: PublicProfile) => {
      if (!myProfile) return 50;

      const mine = (myProfile.interests || []).map((x) =>
        x.toLowerCase()
      );
      const theirs = (item.interests || []).map((x) =>
        x.toLowerCase()
      );

      const shared = theirs.filter((x) => mine.includes(x)).length;
      const totalUnique = Math.max(
        new Set([...mine, ...theirs]).size,
        1
      );

      const interestScore = Math.round(
        (shared / totalUnique) * 60
      );

      const intentionScore =
        myProfile.datingIntention &&
          item.datingIntention?.toLowerCase() ===
          myProfile.datingIntention.toLowerCase()
          ? 20
          : 0;

      const genderScore =
        myProfile.interestedIn?.toLowerCase() ===
          item.gender?.toLowerCase()
          ? 10
          : 0;

      const km = Number.parseFloat(
        item.distance?.replace(/[^\d.]/g, "") || "999"
      );

      const distanceScore =
        km <= 5 ? 10 : km <= 10 ? 6 : km <= 20 ? 3 : 0;

      return Math.min(
        99,
        Math.max(
          50,
          interestScore +
          intentionScore +
          genderScore +
          distanceScore
        )
      );
    },
    [myProfile]
  );

  const mostCompatible = useMemo(() => {
  return compatibleProfiles.slice(0, 4);
}, [compatibleProfiles]);

  /*
   * =====================================================
   * NAVIGATION
   * =====================================================
   */

  const openProfile = (
  item: {
    id: string;
    name: string | null;
  }
) => {
  router.push({
    pathname: "/profile-detail",
    params: {
      id: item.id,
      name: item.name ?? "",
    },
  });
};

  /*
   * =====================================================
   * SWIPE
   * =====================================================
   */

  const nextProfile = () => {
    setCurrentIndex((current) => {
      if (profiles.length === 0) {
        return 0;
      }

      if (current < profiles.length - 1) {
        return current + 1;
      }

      return 0;
    });
  };



  // =====================================================
  // AUTOMATIC TOP PICKS SWIPE
  // =====================================================

  const AUTO_SWIPE_DELAY = 4000;
  const AUTO_SWIPE_DURATION = 500;

  const autoSwipeNext = useCallback(() => {
    if (
      isAnimating ||
      !profile ||
      profiles.length <= 1
    ) {
      return;
    }

    setIsAnimating(true);

    Animated.timing(position, {
      toValue: {
        x: -420,
        y: 0,
      },
      duration: AUTO_SWIPE_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        position.setValue({
          x: 0,
          y: 0,
        });

        setIsAnimating(false);
        return;
      }

      position.setValue({
        x: 0,
        y: 0,
      });

      nextProfile();

      setIsAnimating(false);
    });
  }, [
    isAnimating,
    profile,
    profiles.length,
    position,
  ]);

  useEffect(() => {
    if (
      loading ||
      profiles.length <= 1 ||
      !profile
    ) {
      return;
    }

    const timer = setInterval(() => {
      autoSwipeNext();
    }, AUTO_SWIPE_DELAY);

    return () => {
      clearInterval(timer);
    };
  }, [
    loading,
    profiles.length,
    profile,
    autoSwipeNext,
  ]);

  const swipeOut = async (
    direction: "left" | "right" | "up"
  ) => {
    if (isAnimating || !profile) {
      return;
    }

    const targetProfile = profile;
    setIsAnimating(true);

    try {
      if (direction === "right") {
        await likeProfile(targetProfile.id);
      } else if (direction === "left") {
        await passProfile(targetProfile.id);
      } else {
        await superlikeProfile(targetProfile.id);
      }

      if (direction === "right") {
        setActionMessage({
          title: "A little heart sent 💜",
          message: `You liked ${targetProfile.name}. Let's see where the vibe goes.`,
          type: "like",
        });
      }

      if (direction === "left") {
        setActionMessage({
          title: "No worries, vibe check done ✨",
          message: `${targetProfile.name} has been passed for now.`,
          type: "pass",
        });
      }

      if (direction === "up") {
        setActionMessage({
          title: "Super Like sent ⭐",
          message: `You gave ${targetProfile.name} a little extra sparkle.`,
          type: "superlike",
        });
      }

      let x = 0;
      let y = 0;

      if (direction === "right") {
        x = 500;
      }

      if (direction === "left") {
        x = -500;
      }

      if (direction === "up") {
        y = -650;
      }

      Animated.timing(position, {
        toValue: { x, y },
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        // Local cache is updated only after the backend succeeds.
        if (direction === "right") {
          addLike(toLikeProfile(targetProfile));
        }

        position.setValue({
          x: 0,
          y: 0,
        });

        nextProfile();
        setIsAnimating(false);
      });
    } catch (err) {
      console.error("Interaction error:", err);

      position.setValue({
        x: 0,
        y: 0,
      });

      setIsAnimating(false);

      Alert.alert(
        "Couldn't save that action",
        err instanceof Error
          ? err.message
          : "Please check your connection and try again."
      );
    }
  };



  

  /*
   * =====================================================
   * PAN RESPONDER
   * =====================================================
   */

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          return !isAnimating;
        },

        onMoveShouldSetPanResponder: (_, gesture) => {
          return (
            Math.abs(gesture.dx) > 5 ||
            Math.abs(gesture.dy) > 5
          );
        },

        onPanResponderMove: (_, gesture) => {
          position.setValue({
            x: gesture.dx,
            y: gesture.dy,
          });
        },

        onPanResponderRelease: (_, gesture) => {
          const horizontal =
            Math.abs(gesture.dx) > 120;

          const verticalUp =
            gesture.dy < -140 &&
            Math.abs(gesture.dy) >
            Math.abs(gesture.dx);

          if (verticalUp) {
            swipeOut("up");
            return;
          }

          if (horizontal) {
            swipeOut(
              gesture.dx > 0
                ? "right"
                : "left"
            );
            return;
          }

          Animated.spring(position, {
            toValue: {
              x: 0,
              y: 0,
            },
            useNativeDriver: true,
            friction: 5,
          }).start();
        },
      }),
    [position, profile, isAnimating]
  );

  /*
   * =====================================================
   * ANIMATION VALUES
   * =====================================================
   */

  const rotate = position.x.interpolate({
    inputRange: [-250, 0, 250],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-150, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const superOpacity = position.y.interpolate({
    inputRange: [-180, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  /*
   * =====================================================
   * ACTIONS
   * =====================================================
   */

  const handlePass = () => {
    swipeOut("left");
  };

  const handleLike = () => {
    swipeOut("right");
  };

  const handleSuperLike = () => {
    swipeOut("up");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfiles();
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
            styles.stateTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Finding your vibe...
        </Text>

        <Text
          style={[
            styles.stateText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Looking for people you'll actually
          vibe with.
        </Text>
      </View>
    );
  }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error && profiles.length === 0) {
    return (
      <View
        style={[
          styles.centerState,
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
          Couldn't load Discover
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
          onPress={handleRefresh}
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.primary,
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

  return (

    
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {actionMessage && (
        <View
          style={[
            styles.actionMessage,
            actionMessage.type === "like" &&
              styles.actionMessageLike,
            actionMessage.type === "superlike" &&
              styles.actionMessageSuper,
            actionMessage.type === "pass" &&
              styles.actionMessagePass,
          ]}
        >
          <Text style={styles.actionMessageIcon}>
            {actionMessage.type === "like"
              ? "♥"
              : actionMessage.type === "superlike"
              ? "★"
              : "♡"}
          </Text>

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
            hitSlop={10}
          >
            <Text style={styles.actionMessageClose}>
              ×
            </Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            HEADER
        ================================================= */}

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
                styles.location,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Discover people near you
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              style={({ pressed }) => [
                styles.headerButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              onPress={() =>
                router.push("/notifications")
              }
            >
              <Text
                style={[
                  styles.notificationIcon,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                ♡
              </Text>

              <View
                style={[
                  styles.notificationDot,
                  {
                    borderColor: theme.surface,
                  },
                ]}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open discovery filters"
              style={({ pressed }) => [
                styles.headerButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              onPress={() =>
                router.push("/filters")
              }
            >
              <Text
                style={[
                  styles.filterIcon,
                  {
                    color: theme.text,
                  },
                ]}
              >
                ☷
              </Text>
            </Pressable>
          </View>
        </View>

        {/* =================================================
            TOP PICKS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              ✨ Top Picks For You
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              People we think you'll really vibe with
            </Text>
          </View>
        </View>

        {/* =================================================
            SWIPE CARD
        ================================================= */}

        {profile ? (
          <>
            <View style={styles.swipeArea}>
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.card,
                  {
                    transform: [
                      ...position.getTranslateTransform(),
                      {
                        rotate,
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={{
                    uri:
                      profile.primaryPhoto ||
                      profile.photos?.[0],
                  }}
                  style={styles.profileImage}
                />

                <View style={styles.overlayTop} />
                <View style={styles.overlay} />

                {/* LIKE */}

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.swipeLabel,
                    styles.likeLabel,
                    {
                      opacity: likeOpacity,
                    },
                  ]}
                >
                  <Text style={styles.likeLabelText}>
                    LIKE
                  </Text>
                </Animated.View>

                {/* PASS */}

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.swipeLabel,
                    styles.passLabel,
                    {
                      opacity: passOpacity,
                    },
                  ]}
                >
                  <Text style={styles.passLabelText}>
                    PASS
                  </Text>
                </Animated.View>

                {/* SUPER LIKE */}

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.superSwipeLabel,
                    {
                      opacity: superOpacity,
                    },
                  ]}
                >
                  <Text style={styles.superLabelText}>
                    SUPER LIKE
                  </Text>
                </Animated.View>

                {/* ACTIVE */}

                <View style={styles.onlineBadge}>
                  <View
                    style={[
                      styles.onlineDot,
                      {
                        backgroundColor:
                          theme.success,
                      },
                    ]}
                  />

                  <Text style={styles.onlineText}>
                    Active recently
                  </Text>
                </View>

                {/* PHOTO COUNT */}

                <View style={styles.photoCount}>
                  <Text style={styles.photoCountText}>
                    1 / {Math.max(profile.photos?.length || 1, 1)}
                  </Text>
                </View>

                {/* PROFILE INFO */}

                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>
                      {profile.name}, {profile.age}
                    </Text>

                    {profile.isVerified && (
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
                          style={styles.verifiedText}
                        >
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.distanceRow}>
                    <Text style={styles.locationPin}>
                      ●
                    </Text>

                    <Text style={styles.distance}>
                      {profile.distance ||
                        "Distance unavailable"}
                    </Text>
                  </View>

                  <Text style={styles.bio}>
                    {profile.bio}
                  </Text>

                  {/* INTERESTS */}

                  {!!profile.interests?.length && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={
                        false
                      }
                      contentContainerStyle={
                        styles.cardInterestList
                      }
                    >
                      {profile.interests
                        .slice(0, 4)
                        .map((interest) => (
                          <View
                            key={interest}
                            style={
                              styles.cardInterest
                            }
                          >
                            <Text
                              style={
                                styles.cardInterestText
                              }
                            >
                              {interest}
                            </Text>
                          </View>
                        ))}
                    </ScrollView>
                  )}

                  <View style={styles.cardHint}>
                    <Text style={styles.cardHintText}>
                      Swipe to discover
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View ${profile.name}'s profile`}
                    style={styles.viewProfile}
                    onPress={() =>
                      openProfile(profile)
                    }
                  >
                    <Text
                      style={styles.viewProfileText}
                    >
                      View profile
                    </Text>

                    <Text
                      style={styles.viewProfileArrow}
                    >
                      →
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            </View>

            {/* ACTIONS */}

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pass"
                style={[
                  styles.actionButton,
                  styles.passButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={handlePass}
              >
                <Text
                  style={[
                    styles.passIcon,
                    {
                      color: theme.danger,
                    },
                  ]}
                >
                  ×
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Super Like"
                style={[
                  styles.actionButton,
                  styles.superButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={handleSuperLike}
              >
                <Text
                  style={[
                    styles.superIcon,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  ★
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Like"
                style={[
                  styles.actionButton,
                  styles.likeButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={handleLike}
              >
                <Text
                  style={[
                    styles.likeIcon,
                    {
                      color: theme.coral,
                    },
                  ]}
                >
                  ♥
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.emptyDiscovery,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.emptyEmoji}>
              👀
            </Text>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Looks like you've seen everyone
              around you 👀
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Try expanding your discovery
              preferences to meet more people.
            </Text>

            <Pressable
              style={[
                styles.retryButton,
                {
                  backgroundColor: theme.primary,
                },
              ]}
              onPress={() =>
                router.push("/filters")
              }
            >
              <Text style={styles.retryText}>
                Update Filters
              </Text>
            </Pressable>
          </View>
        )}

        {/* =================================================
            MOST COMPATIBLE
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              💯 Most Compatible
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              A strong match based on your preferences
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push("/most-compatible")
            }
            hitSlop={10}
          >
            <Text
              style={[
                styles.seeAll,
                {
                  color: theme.primary,
                },
              ]}
            >
              See all
            </Text>
          </Pressable>
        </View>

        {mostCompatible.length > 0 && (
          <Pressable
            style={[
              styles.compatibilityCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() =>
              openProfile(
                mostCompatible[0]
              )
            }
          >
            <Image
              source={{
                uri:
                  mostCompatible[0]
                    .primaryPhoto ||
                  mostCompatible[0].photos?.[0],
              }}
              style={styles.compatibilityImage}
            />

            <View style={styles.compatibilityContent}>
              <View style={styles.compatibilityTop}>
                <View>
                  <View style={styles.nameRowLight}>
                    <Text
                      style={[
                        styles.compatibilityName,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {mostCompatible[0].name},{" "}
                      {mostCompatible[0].age}
                    </Text>

                    {mostCompatible[0]
                      .isVerified && (
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

                  <Text
                    style={[
                      styles.compatibilityDistance,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    📍{" "}
                    {mostCompatible[0]
                      .distance ||
                      "Distance unavailable"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,107,138,0.15)"
                        : "#FFF0F4",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.matchPercent,
                      {
                        color: theme.coral,
                      },
                    ]}
                  >
                    {mostCompatible[0].compatibility}%
                  </Text>

                  <Text
                    style={[
                      styles.matchLabel,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    match
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.compatibilityText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {mostCompatible[0].bio}
              </Text>

              <View style={styles.tagRow}>
                {mostCompatible[0].interests
                  .slice(0, 3)
                  .map((item) => (
                    <View
                      key={item}
                      style={[
                        styles.tag,
                        {
                          backgroundColor:
                            theme.background,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          {
                            color: theme.text,
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </Pressable>
        )}

       {/* =================================================
    BECAUSE YOU LIKE
================================================= */}

{becauseYouLikeInterest &&
  becauseYouLikeProfiles.length > 0 && (
    <>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            ✨ Because You Like{" "}
            {becauseYouLikeInterest}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            People who share your love for{" "}
            {becauseYouLikeInterest.toLowerCase()}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/because-you-like")
          }
          hitSlop={10}
        >
          <Text
            style={[
              styles.seeAll,
              {
                color: theme.primary,
              },
            ]}
          >
            View All
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.horizontalList
        }
      >
        {becauseYouLikeProfiles
          .slice(0, 6)
          .map((item) => (
            <Pressable
              key={`because-${item.id}`}
              style={[
                styles.horizontalProfileCard,
                {
                  backgroundColor:
                    theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => openProfile(item)}
            >
              <Image
                source={{
                  uri:
                    item.primaryPhoto ||
                    item.photos?.[0],
                }}
                style={styles.horizontalImage}
              />

              <View
                style={styles.horizontalOverlay}
              />

              <View
                style={styles.horizontalInfo}
              >
                <Text
                  style={styles.horizontalName}
                >
                  {item.name}, {item.age}
                </Text>

                <Text
                  style={
                    styles.horizontalDistance
                  }
                >
                  📍{" "}
                  {item.distance ||
                    "Distance unavailable"}
                </Text>
              </View>
            </Pressable>
          ))}
      </ScrollView>
    </>
  )}

       {/* =================================================
    NEW HERE
================================================= */}

{newHereProfiles.length > 0 && (
  <>
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          🆕 New Here
        </Text>

        <Text
          style={[
            styles.sectionSubtitle,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Fresh faces worth saying hi to
        </Text>
      </View>

      <Pressable
        onPress={() =>
          router.push("/new-here")
        }
        hitSlop={10}
      >
        <Text
          style={[
            styles.seeAll,
            {
              color: theme.primary,
            },
          ]}
        >
          View All
        </Text>
      </Pressable>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        styles.horizontalList
      }
    >
      {newHereProfiles
        .slice(0, 6)
        .map((item) => (
          <Pressable
            key={`new-${item.id}`}
            style={[
              styles.newCard,
              {
                backgroundColor:
                  theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() =>
              openProfile(item)
            }
          >
            <Image
              source={{
                uri:
                  item.primaryPhoto ||
                  item.photos?.[0],
              }}
              style={styles.newImage}
            />

            <View style={styles.newContent}>
              <Text
                style={[
                  styles.newName,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {item.name}, {item.age}
              </Text>

              <Text
                style={[
                  styles.newDistance,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                📍{" "}
                {item.distance ||
                  "Distance unavailable"}
              </Text>
            </View>
          </Pressable>
        ))}
    </ScrollView>
  </>
)}

        {/* =================================================
            TRENDING NEAR YOU
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              🔥 Trending Near You
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Profiles getting attention lately
            </Text>
          </View>
        </View>

        {nearbyProfiles[0] && (
          <Pressable
            style={[
              styles.trendingCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() =>
              openProfile(nearbyProfiles[0])
            }
          >
            <Image
              source={{
                uri:
                  nearbyProfiles[0].primaryPhoto ||
                  nearbyProfiles[0].photos?.[0],
              }}
              style={styles.trendingImage}
            />

            <View style={styles.trendingOverlay} />

            <View style={styles.trendingBadge}>
              <Text style={styles.trendingBadgeText}>
                🔥 Trending
              </Text>
            </View>

            <View style={styles.trendingContent}>
              <View style={styles.trendingNameRow}>
                <Text style={styles.trendingName}>
                  {nearbyProfiles[0].name},{" "}
                  {nearbyProfiles[0].age}
                </Text>

                {nearbyProfiles[0].isVerified && (
                  <View
                    style={styles.trendingVerified}
                  >
                    <Text
                      style={
                        styles.trendingVerifiedText
                      }
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={styles.trendingDistance}
              >
                📍{" "}
                {nearbyProfiles[0].distance ||
                  "Distance unavailable"}
              </Text>

              <Text style={styles.trendingBio}>
                {nearbyProfiles[0].bio}
              </Text>
            </View>
          </Pressable>
        )}

        {/* =================================================
            SHARED INTERESTS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              💕 You Both Like
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Easy reasons to start a conversation
            </Text>
          </View>
        </View>

        {sharedInterestProfiles.map((item) => (
          <Pressable
            key={`shared-${item.id}`}
            style={[
              styles.sharedCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => openProfile(item)}
          >
            <Image
              source={{
                uri:
                  item.primaryPhoto ||
                  item.photos?.[0],
              }}
              style={styles.sharedImage}
            />

            <View style={styles.sharedContent}>
              <View style={styles.sharedNameRow}>
                <Text
                  style={[
                    styles.sharedName,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {item.name}, {item.age}
                </Text>

                <Text
                  style={[
                    styles.sharedDistance,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  {item.distance ||
                    "Distance unavailable"}
                </Text>
              </View>

              <Text
                style={[
                  styles.sharedText,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                You both like
              </Text>

              <View style={styles.sharedTags}>
                {item.shared.map((interest) => (
                  <View
                    key={interest}
                    style={[
                      styles.sharedTag,
                      {
                        backgroundColor:
                          theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sharedTagText,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        ))}

        {/* =================================================
            PEOPLE NEARBY
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              📍 People Nearby
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              People close enough to actually meet
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {nearbyProfiles
            .slice(0, 6)
            .map((item) => (
              <Pressable
                key={`nearby-${item.id}`}
                style={[
                  styles.gridCard,
                  {
                    backgroundColor:
                      theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => openProfile(item)}
              >
                <Image
                  source={{
                    uri:
                      item.primaryPhoto ||
                      item.photos?.[0],
                  }}
                  style={styles.gridImage}
                />

                <View style={styles.gridOverlay} />

                <View style={styles.gridInfo}>
                  <View
                    style={styles.gridNameRow}
                  >
                    <Text style={styles.gridName}>
                      {item.name}, {item.age}
                    </Text>

                    {item.isVerified && (
                      <Text
                        style={styles.gridVerified}
                      >
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text
                    style={styles.gridDistance}
                  >
                    📍{" "}
                    {item.distance ||
                      "Distance unavailable"}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>

        {/* =================================================
            LOOKING FOR
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              💜 Looking For
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Find people who want the same kind
              of connection
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.intentionList}
        >
          {intentionCards.map(
            ([icon, title, subtitle]) => (
              <Pressable
                key={title}
                style={[
                  styles.intentionCard,
                  {
                    backgroundColor:
                      theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.intentionIcon}>
                  {icon}
                </Text>

                <Text
                  style={[
                    styles.intentionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {title}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[
                    styles.intentionSubtitle,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  {subtitle}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* =================================================
            EXPLORE
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              🌎 Explore Your Vibe
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Find people through things you love
            </Text>
          </View>
        </View>

        <View style={styles.exploreGrid}>
          {exploreCategories.map((item) => (
            <Pressable
              key={item.title}
              style={[
                styles.exploreCard,
                {
                  backgroundColor:
                    theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.exploreIconBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#FFF5F7",
                  },
                ]}
              >
                <Text style={styles.exploreIcon}>
                  {item.icon}
                </Text>
              </View>

              <Text
                style={[
                  styles.exploreTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {item.title}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.exploreSubtitle,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                {item.subtitle}
              </Text>

              <Text
                style={[
                  styles.exploreArrow,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                →
              </Text>
            </Pressable>
          ))}
        </View>

        {/* =================================================
            CONVERSATION STARTER
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              💬 Start a Conversation
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Skip the boring hello
            </Text>
          </View>
        </View>

        {profile?.prompts?.length ? (
          <Pressable
            style={[
              styles.conversationCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => openProfile(profile)}
          >
            <View style={styles.conversationHeader}>
              <Image
                source={{
                  uri:
                    profile.primaryPhoto ||
                    profile.photos?.[0],
                }}
                style={styles.conversationImage}
              />

              <View style={styles.conversationPerson}>
                <Text
                  style={[
                    styles.conversationName,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {profile.name}, {profile.age}
                </Text>

                <Text
                  style={[
                    styles.conversationDistance,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  📍{" "}
                  {profile.distance ||
                    "Distance unavailable"}
                </Text>
              </View>

              <Text
                style={[
                  styles.conversationSpark,
                  {
                    color: theme.coral,
                  },
                ]}
              >
                ✨
              </Text>
            </View>

            <View
              style={[
                styles.promptBox,
                {
                  backgroundColor:
                    theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.promptLabel,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                THEIR PROMPT
              </Text>

              <Text
                style={[
                  styles.promptQuestion,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {profile.prompts[0].question}
              </Text>

              <Text
                style={[
                  styles.promptAnswer,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                {profile.prompts[0].answer}
              </Text>
            </View>

            <View
              style={[
                styles.replyButton,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
            >
              <Text style={styles.replyButtonText}>
                Reply to Prompt →
              </Text>
            </View>
          </Pressable>
        ) : profiles[0]?.prompts?.length ? (
          <Pressable
            style={[
              styles.conversationCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => openProfile(profiles[0])}
          >
            <View style={styles.conversationHeader}>
              <Image
                source={{
                  uri:
                    profiles[0].primaryPhoto ||
                    profiles[0].photos?.[0],
                }}
                style={styles.conversationImage}
              />

              <View style={styles.conversationPerson}>
                <Text
                  style={[
                    styles.conversationName,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {profiles[0].name},{" "}
                  {profiles[0].age}
                </Text>

                <Text
                  style={[
                    styles.conversationDistance,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  📍{" "}
                  {profiles[0].distance ||
                    "Distance unavailable"}
                </Text>
              </View>

              <Text
                style={[
                  styles.conversationSpark,
                  {
                    color: theme.coral,
                  },
                ]}
              >
                ✨
              </Text>
            </View>

            <View
              style={[
                styles.promptBox,
                {
                  backgroundColor:
                    theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.promptLabel,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                THEIR PROMPT
              </Text>

              <Text
                style={[
                  styles.promptQuestion,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {profiles[0].prompts[0].question}
              </Text>

              <Text
                style={[
                  styles.promptAnswer,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                {profiles[0].prompts[0].answer}
              </Text>
            </View>

            <View
              style={[
                styles.replyButton,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
            >
              <Text style={styles.replyButtonText}>
                Reply to Prompt →
              </Text>
            </View>
          </Pressable>
        ) : (
          <View
            style={[
              styles.noPromptCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.noPromptEmoji}>
              💬
            </Text>

            <Text
              style={[
                styles.noPromptTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Find your opening line
            </Text>

            <Text
              style={[
                styles.noPromptText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Explore profiles with prompts to
              skip the boring hello.
            </Text>
          </View>
        )}

        {/* =================================================
            RECENTLY ACTIVE
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              🟢 Recently Active
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              People who have been around lately
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeList}
        >
          {activeProfiles.map((item) => (
            <Pressable
              key={`active-${item.id}`}
              style={styles.activeProfile}
              onPress={() => openProfile(item)}
            >
              <View
                style={styles.activeImageWrapper}
              >
                <Image
                  source={{
                    uri:
                      item.primaryPhoto ||
                      item.photos?.[0],
                  }}
                  style={styles.activeImage}
                />

                <View
                  style={[
                    styles.activeStatus,
                    {
                      backgroundColor:
                        theme.success,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.activeName,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {item.name}, {item.age}
              </Text>

              <Text
                style={[
                  styles.activeText,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                Active recently
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* =================================================
            YOU MIGHT LIKE
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              👀 You Might Like
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              A few more people worth discovering
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {profiles
            .filter((item) => item.id !== profile?.id)
            .sort(
              (a, b) =>
                calculateCompatibility(b) -
                calculateCompatibility(a)
            )
            .slice(0, 4)
            .map((item) => (
              <Pressable
                key={`might-${item.id}`}
                style={[
                  styles.gridCard,
                  {
                    backgroundColor:
                      theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => openProfile(item)}
              >
                <Image
                  source={{
                    uri:
                      item.primaryPhoto ||
                      item.photos?.[0],
                  }}
                  style={styles.gridImage}
                />

                <View style={styles.gridOverlay} />

                <View style={styles.gridInfo}>
                  <View style={styles.gridNameRow}>
                    <Text style={styles.gridName}>
                      {item.name}, {item.age}
                    </Text>

                    {item.isVerified && (
                      <Text
                        style={styles.gridVerified}
                      >
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text style={styles.gridDistance}>
                    📍{" "}
                    {item.distance ||
                      "Distance unavailable"}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>

        {/* =================================================
            BACKEND ERROR NOTICE
        ================================================= */}

        {!!error && profiles.length > 0 && (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: isDark
                  ? "#21161C"
                  : "#FFF3F5",
                borderColor: theme.danger,
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                {
                  color: theme.danger,
                },
              ]}
            >
              Some discovery data could not be refreshed.
            </Text>

            <Pressable onPress={handleRefresh}>
              <Text
                style={[
                  styles.errorRetry,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* =================================================
            END DISCOVERY
        ================================================= */}

        {profiles.length > 0 && (
          <View
            style={[
              styles.endDiscovery,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.endIconCircle,
                {
                  backgroundColor: isDark
                    ? "rgba(255,107,138,0.15)"
                    : "#FFF0F4",
                },
              ]}
            >
              <Text style={styles.endIcon}>
                💕
              </Text>
            </View>

            <Text
              style={[
                styles.endTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              That's everyone for now
            </Text>

            <Text
              style={[
                styles.endText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Try expanding your discovery preferences
              to meet more people.
            </Text>

            <Pressable
              style={[
                styles.updateFilterButton,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
              onPress={() =>
                router.push("/filters")
              }
            >
              <Text style={styles.updateFilterText}>
                Update Filters
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* =================================================
          FIXED BOTTOM NAV
      ================================================= */}

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/discover")
          }
        >
          <Text
            style={[
              styles.navIconActive,
              {
                color: theme.primary,
              },
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.navTextActive,
              {
                color: theme.primary,
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
                color: theme.textMuted,
              },
            ]}
          >
            ♡
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Likes
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/matches")
          }
        >
          <Text
            style={[
              styles.navIcon,
              {
                color: theme.textMuted,
              },
            ]}
          >
            ◉
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Matches
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/profile")
          }
        >
          <Text
            style={[
              styles.navIcon,
              {
                color: theme.textMuted,
              },
            ]}
          >
            ☻
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color: theme.textMuted,
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
    paddingBottom: 25,
  },

  actionMessage: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  actionMessageLike: {
    backgroundColor: "#FFF0F4",
    borderColor: "#FFD4DE",
  },

  actionMessageSuper: {
    backgroundColor: "#F3EEFF",
    borderColor: "#D9CCFF",
  },

  actionMessagePass: {
    backgroundColor: "#FFF7F8",
    borderColor: "#FFE0E5",
  },

  actionMessageIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    fontSize: 21,
    textAlign: "center",
    lineHeight: 38,
  },

  actionMessageContent: {
    flex: 1,
    marginLeft: 11,
  },

  actionMessageTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17151C",
  },

  actionMessageText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#716D78",
  },

  actionMessageClose: {
    fontSize: 20,
    color: "#716D78",
    paddingLeft: 8,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loadingCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loadingEmoji: {
    fontSize: 32,
  },

  stateTitle: {
    marginTop: 15,
    ...typography.h3,
    textAlign: "center",
  },

  stateText: {
    marginTop: 7,
    ...typography.body,
    textAlign: "center",
    maxWidth: 300,
  },

  retryButton: {
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    color: "#FFFFFF",
    ...typography.smallButton,
  },

  header: {
    minHeight: 60,
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

  location: {
    marginTop: 3,
    fontSize: 11,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationIcon: {
    fontSize: 23,
  },

  notificationDot: {
    position: "absolute",
    right: 9,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B8A",
    borderWidth: 2,
  },

  filterIcon: {
    fontSize: 22,
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...typography.h3,
    fontSize: 19,
  },

  sectionSubtitle: {
    marginTop: 3,
    ...typography.caption,
  },

  seeAll: {
    ...typography.smallButton,
  },

  swipeArea: {
    height: 510,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    height: 500,
    borderRadius: 27,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlayTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 125,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 235,
    backgroundColor: "rgba(0,0,0,0.58)",
  },

  swipeLabel: {
    position: "absolute",
    top: 65,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 3,
    borderRadius: 10,
  },

  likeLabel: {
    right: 25,
    borderColor: "#35C98A",
    transform: [{ rotate: "12deg" }],
  },

  passLabel: {
    left: 25,
    borderColor: "#FF5C72",
    transform: [{ rotate: "-12deg" }],
  },

  superSwipeLabel: {
    position: "absolute",
    top: 58,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: "#B9A2FF",
    borderRadius: 10,
    transform: [{ rotate: "-4deg" }],
  },

  likeLabelText: {
    color: "#35C98A",
    fontSize: 17,
    fontWeight: "900",
  },

  passLabelText: {
    color: "#FF5C72",
    fontSize: 17,
    fontWeight: "900",
  },

  superLabelText: {
    color: "#B9A2FF",
    fontSize: 15,
    fontWeight: "900",
  },

  onlineBadge: {
    position: "absolute",
    left: 17,
    top: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  onlineText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  photoCount: {
    position: "absolute",
    right: 17,
    top: 17,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  profileInfo: {
    position: "absolute",
    left: 17,
    right: 17,
    bottom: 17,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
  },

  verified: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  locationPin: {
    color: "#FFFFFF",
    fontSize: 9,
    marginRight: 6,
  },

  distance: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  bio: {
    color: "#FFFFFF",
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
  },

  cardInterestList: {
    gap: 7,
    marginTop: 9,
  },

  cardInterest: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  cardInterestText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  cardHint: {
    marginTop: 8,
  },

  cardHintText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
  },

  viewProfile: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  viewProfileText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  viewProfileArrow: {
    color: "#FFFFFF",
    fontSize: 17,
    marginLeft: 5,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 2,
  },

  actionButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  passButton: {
    width: 55,
    height: 55,
    borderRadius: 28,
  },

  superButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  passIcon: {
    fontSize: 33,
    lineHeight: 35,
    fontWeight: "300",
  },

  superIcon: {
    fontSize: 24,
  },

  likeIcon: {
    fontSize: 25,
  },

  compatibilityCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 13,
    flexDirection: "row",
  },

  compatibilityImage: {
    width: 95,
    height: 120,
    borderRadius: 17,
  },

  compatibilityContent: {
    flex: 1,
    marginLeft: 13,
  },

  compatibilityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nameRowLight: {
    flexDirection: "row",
    alignItems: "center",
  },

  compatibilityName: {
    fontSize: 17,
    fontWeight: "800",
  },

  compatibilityDistance: {
    marginTop: 4,
    fontSize: 11,
  },

  smallVerified: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  smallVerifiedText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  matchBadge: {
    minWidth: 48,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 11,
    alignItems: "center",
  },

  matchPercent: {
    fontSize: 14,
    fontWeight: "900",
  },

  matchLabel: {
    fontSize: 9,
    marginTop: 1,
  },

  compatibilityText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
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

  horizontalList: {
    gap: 10,
    paddingRight: 5,
  },

  horizontalProfileCard: {
    width: 145,
    height: 190,
    borderRadius: 19,
    borderWidth: 1,
    overflow: "hidden",
  },

  horizontalImage: {
    width: "100%",
    height: "100%",
  },

  horizontalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 85,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  horizontalInfo: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },

  horizontalName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  horizontalDistance: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    marginTop: 3,
  },

  newCard: {
    width: 150,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },

  newImage: {
    width: "100%",
    height: 155,
  },

  newContent: {
    padding: 10,
  },

  newName: {
    fontSize: 14,
    fontWeight: "800",
  },

  newDistance: {
    marginTop: 4,
    fontSize: 10,
  },

  trendingCard: {
    height: 330,
    borderRadius: 23,
    borderWidth: 1,
    overflow: "hidden",
  },

  trendingImage: {
    width: "100%",
    height: "100%",
  },

  trendingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: "rgba(0,0,0,0.57)",
  },

  trendingBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  trendingBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  trendingContent: {
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 15,
  },

  trendingNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  trendingName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  trendingVerified: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#6D3DF5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  trendingVerifiedText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  trendingDistance: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 4,
  },

  trendingBio: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },

  sharedCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    marginBottom: 10,
  },

  sharedImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  sharedContent: {
    flex: 1,
    marginLeft: 12,
  },

  sharedNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sharedName: {
    fontSize: 15,
    fontWeight: "800",
  },

  sharedDistance: {
    fontSize: 10,
  },

  sharedText: {
    marginTop: 5,
    fontSize: 11,
  },

  sharedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },

  sharedTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  sharedTagText: {
    fontSize: 10,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  gridCard: {
    width: "48.4%",
    height: 220,
    borderRadius: 19,
    borderWidth: 1,
    overflow: "hidden",
  },

  gridImage: {
    width: "100%",
    height: "100%",
  },

  gridOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  gridInfo: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },

  gridNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  gridName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
  },

  gridVerified: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  gridDistance: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    marginTop: 3,
  },

  intentionList: {
    gap: 10,
    paddingRight: 5,
  },

  intentionCard: {
    width: 150,
    minHeight: 145,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },

  intentionIcon: {
    fontSize: 25,
  },

  intentionTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "800",
  },

  intentionSubtitle: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 15,
  },

  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  exploreCard: {
    width: "48.4%",
    minHeight: 155,
    borderRadius: 19,
    borderWidth: 1,
    padding: 13,
    position: "relative",
  },

  exploreIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  exploreIcon: {
    fontSize: 22,
  },

  exploreTitle: {
    marginTop: 13,
    fontSize: 14,
    fontWeight: "800",
  },

  exploreSubtitle: {
    marginTop: 4,
    fontSize: 10,
    paddingRight: 4,
  },

  exploreArrow: {
    position: "absolute",
    right: 13,
    bottom: 12,
    fontSize: 19,
    fontWeight: "700",
  },

  conversationCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 13,
  },

  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  conversationImage: {
    width: 55,
    height: 55,
    borderRadius: 18,
  },

  conversationPerson: {
    flex: 1,
    marginLeft: 11,
  },

  conversationName: {
    fontSize: 15,
    fontWeight: "800",
  },

  conversationDistance: {
    marginTop: 4,
    fontSize: 10,
  },

  conversationSpark: {
    fontSize: 22,
  },

  promptBox: {
    marginTop: 13,
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
  },

  promptLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  promptQuestion: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },

  promptAnswer: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
  },

  replyButton: {
    minHeight: 44,
    borderRadius: 13,
    marginTop: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  replyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  noPromptCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },

  noPromptEmoji: {
    fontSize: 28,
  },

  noPromptTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
  },

  noPromptText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },

  activeList: {
    gap: 16,
    paddingRight: 5,
  },

  activeProfile: {
    width: 78,
    alignItems: "center",
  },

  activeImageWrapper: {
    position: "relative",
  },

  activeImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },

  activeStatus: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  activeName: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },

  activeText: {
    marginTop: 2,
    fontSize: 9,
    textAlign: "center",
  },

  emptyDiscovery: {
    minHeight: 280,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyEmoji: {
    fontSize: 35,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 280,
  },

  errorBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  errorRetry: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: "800",
  },

  endDiscovery: {
    marginTop: 24,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
  },

  endIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  endIcon: {
    fontSize: 25,
  },

  endTitle: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  endText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 290,
  },

  updateFilterButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    minHeight: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  updateFilterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 90,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 65,
  },

  navIcon: {
    fontSize: 21,
  },

  navIconActive: {
    fontSize: 21,
  },

  navText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
  },

  navTextActive: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
  },
});