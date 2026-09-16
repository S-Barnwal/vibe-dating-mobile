import {
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
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

import {
  getSentLikes,
  getReceivedLikes,
  type LikeProfile,
} from "../services/interaction.service";

export default function LikesScreen() {
  const { theme, isDark } = useTheme();

  const [myLikes, setMyLikes] = useState<LikeProfile[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<LikeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const countBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "#F0E9FF";

  const loadLikes = async () => {
    try {
      setLoading(true);
      setError("");

      const [sentResponse, receivedResponse] =
        await Promise.all([
          getSentLikes(),
          getReceivedLikes(),
        ]);

      setMyLikes(sentResponse.data.likes);
      setReceivedLikes(receivedResponse.data.likes);
    } catch (err: any) {
      console.error("Likes loading error:", err);

      setError(
        err?.message ||
          "Unable to load likes right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikes();
  }, []);

  const openProfile = (person: LikeProfile) => {
    router.push({
      pathname: "/profile-detail",
      params: {
        id: person.id,
        name: person.name ?? "",
      },
    });
  };

  const renderCard = (
    person: LikeProfile,
    showInteraction = false
  ) => {
    const image =
      person.primaryPhoto ||
      person.photos?.[0];

    return (
      <Pressable
        key={person.id}
        style={[
          styles.card,
          {
            backgroundColor: theme.border,
          },
        ]}
        onPress={() => openProfile(person)}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              {
                backgroundColor: countBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.placeholderText,
                { color: theme.primary },
              ]}
            >
              ♡
            </Text>
          </View>
        )}

        <View style={styles.overlay} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {person.name ?? "Vibe"}
              {person.age
                ? `, ${person.age}`
                : ""}
            </Text>

            {person.isVerified && (
              <Text style={styles.verified}>
                ✓
              </Text>
            )}
          </View>

          {showInteraction &&
            person.interactionType ===
              "superlike" && (
              <Text style={styles.superLike}>
                ⭐ Super Like
              </Text>
            )}

          <Text style={styles.tap}>
            Tap to view
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = (message: string) => (
    <View style={styles.sectionEmpty}>
      <View
        style={[
          styles.smallEmptyIcon,
          {
            backgroundColor: countBackground,
          },
        ]}
      >
        <Text
          style={[
            styles.smallEmptyIconText,
            { color: theme.primary },
          ]}
        >
          ♡
        </Text>
      </View>

      <Text
        style={[
          styles.sectionEmptyText,
          { color: theme.textMuted },
        ]}
      >
        {message}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.logo,
              { color: theme.primary },
            ]}
          >
            vibe
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.textMuted },
            ]}
          >
            People who liked you
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor:
                countBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: theme.primary },
            ]}
          >
            {receivedLikes.length}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerState}>
          <Text
            style={[
              styles.stateText,
              { color: theme.textMuted },
            ]}
          >
            Loading likes...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text
            style={[
              styles.stateTitle,
              { color: theme.text },
            ]}
          >
            Something went wrong
          </Text>

          <Text
            style={[
              styles.stateText,
              { color: theme.textMuted },
            ]}
          >
            {error}
          </Text>

          <Pressable
            style={[
              styles.retryButton,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
            onPress={loadLikes}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* Your Likes */}
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Your likes
          </Text>

          <Text
            style={[
              styles.sectionDescription,
              { color: theme.textMuted },
            ]}
          >
            People you liked or super liked
          </Text>

          {myLikes.length > 0 ? (
            <View style={styles.grid}>
              {myLikes.map((person) =>
                renderCard(person, true)
              )}
            </View>
          ) : (
            renderEmpty(
              "People you like will appear here."
            )
          )}

          {/* See Who Liked You */}
          <View style={styles.secondSection}>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.text },
                  ]}
                >
                  See who liked you
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  Maybe there's a vibe waiting 💜
                </Text>
              </View>

              <View
                style={[
                  styles.sectionCount,
                  {
                    backgroundColor:
                      countBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionCountText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  {receivedLikes.length}
                </Text>
              </View>
            </View>

            {receivedLikes.length > 0 ? (
              <View style={styles.grid}>
                {receivedLikes.map((person) =>
                  renderCard(person)
                )}
              </View>
            ) : (
              renderEmpty(
                "No one has liked you yet. Keep discovering!"
              )
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor:
              theme.background,
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
              styles.navIcon,
              { color: theme.textMuted },
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.navText,
              { color: theme.textMuted },
            ]}
          >
            Discover
          </Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Text
            style={[
              styles.navIconActive,
              { color: theme.primary },
            ]}
          >
            ♡
          </Text>

          <Text
            style={[
              styles.navTextActive,
              { color: theme.primary },
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
              { color: theme.textMuted },
            ]}
          >
            ◉
          </Text>

          <Text
            style={[
              styles.navText,
              { color: theme.textMuted },
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
              { color: theme.textMuted },
            ]}
          >
            ☻
          </Text>

          <Text
            style={[
              styles.navText,
              { color: theme.textMuted },
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
    paddingTop: 55,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 2,
    ...typography.caption,
    fontSize: 12,
  },

  countBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    ...typography.captionMedium,
    fontSize: 14,
    fontWeight: "800",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  title: {
    marginTop: 28,
    marginBottom: 4,
    ...typography.h2,
    fontSize: 25,
    fontWeight: "800",
  },

  sectionTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "800",
  },

  sectionDescription: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },

  secondSection: {
    marginTop: 34,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionCount: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionCountText: {
    ...typography.captionMedium,
    fontSize: 13,
    fontWeight: "800",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    width: "47.8%",
    height: 235,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 40,
    fontWeight: "300",
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor:
      "rgba(0,0,0,0.45)",
  },

  info: {
    position: "absolute",
    left: 13,
    right: 13,
    bottom: 13,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  name: {
    flex: 1,
    color: "#FFFFFF",
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: "800",
  },

  verified: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  superLike: {
    marginTop: 3,
    color: "#FFFFFF",
    ...typography.captionMedium,
    fontSize: 10,
    fontWeight: "700",
  },

  tap: {
    marginTop: 3,
    color: "#FFFFFF",
    ...typography.caption,
    fontSize: 11,
  },

  sectionEmpty: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  smallEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  smallEmptyIconText: {
    fontSize: 25,
    fontWeight: "300",
  },

  sectionEmptyText: {
    ...typography.caption,
    fontSize: 12,
    textAlign: "center",
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateTitle: {
    ...typography.h2,
    fontSize: 20,
    textAlign: "center",
  },

  stateText: {
    marginTop: 7,
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    height: 46,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    color: "#FFFFFF",
    ...typography.button,
    fontSize: 14,
  },

  bottomSpace: {
    height: 20,
  },

  bottomNav: {
    height: 72,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: -18,
    marginTop: "auto",
  },

  navItem: {
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
    ...typography.caption,
    fontSize: 10,
  },

  navTextActive: {
    marginTop: 3,
    ...typography.captionMedium,
    fontSize: 10,
  },
});