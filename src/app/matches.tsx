import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";

import {
  getMatches,
  MatchProfile,
} from "../services/matches.service";
import { useTheme } from "../hooks/use-theme";
import { radius, spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

export default function MatchesScreen() {
  const { theme, isDark } = useTheme();

  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMatches();

      if (response.success) {
        setMatches(response.data.matches || []);
      } else {
        setMatches([]);
      }
    } catch (err: any) {
      console.error("Load matches error:", err);

      setError(
        err?.message || "Unable to load your matches."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
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
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            People you matched with
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: isDark
                ? "rgba(154, 122, 255, 0.14)"
                : "rgba(109, 61, 245, 0.08)",
              borderColor: isDark
                ? "rgba(154, 122, 255, 0.25)"
                : "rgba(109, 61, 245, 0.12)",
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
            {matches.length}
          </Text>
        </View>
      </View>

      {/* ================= TITLE ================= */}

      <View style={styles.titleRow}>
        <View>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Your matches
          </Text>

          <Text
            style={[
              styles.titleSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Start a conversation with someone you vibe with.
          </Text>
        </View>

        {matches.length > 0 && (
          <Text
            style={[
              styles.matchCount,
              {
                color: theme.primary,
              },
            ]}
          >
            {matches.length}{" "}
            {matches.length === 1
              ? "match"
              : "matches"}
          </Text>
        )}
      </View>

      {/* ================= LOADING ================= */}

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Finding your matches...
          </Text>
        </View>
      ) : error ? (
        /* ================= ERROR ================= */

        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "rgba(154, 122, 255, 0.12)"
                  : "rgba(109, 61, 245, 0.08)",
              },
            ]}
          >
            <Text
              style={[
                styles.emptyHeart,
                {
                  color: theme.primary,
                },
              ]}
            >
              !
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
            Couldn't load matches
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
            onPress={loadMatches}
            style={({ pressed }) => [
              styles.discoverButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [
                  {
                    scale: pressed ? 0.98 : 1,
                  },
                ],
              },
            ]}
          >
            <Text style={styles.discoverButtonText}>
              Try again
            </Text>

            <Text style={styles.discoverArrow}>
              ↻
            </Text>
          </Pressable>
        </View>
      ) : matches.length > 0 ? (
        /* ================= MATCHES ================= */

        <View style={styles.list}>
          {matches.map((person) => (
            <Pressable
              key={person.id}
              onPress={() =>
                router.push({
                  pathname: "/chat",
                  params: {
                    userId: person.userId,
                    name: person.name,
                  },
                })
              }
              style={({ pressed }) => [
                styles.matchCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pressed ? 0.88 : 1,
                  transform: [
                    {
                      scale: pressed ? 0.985 : 1,
                    },
                  ],
                },
              ]}
            >
              {/* Avatar */}

              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri:
                      person.primaryPhoto ||
                      person.photos?.[0] ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.avatar}
                />

                <View
                  style={[
                    styles.onlineDot,
                    {
                      backgroundColor: theme.success,
                      borderColor: theme.surface,
                    },
                  ]}
                />
              </View>

              {/* Match info */}

              <View style={styles.matchInfo}>
                <View style={styles.nameRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.name,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {person.name}
                    {person.age !== null
                      ? `, ${person.age}`
                      : ""}
                  </Text>

                  {person.isVerified && (
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

                <Text
                  numberOfLines={1}
                  style={[
                    styles.message,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  You matched! Start a conversation ✨
                </Text>
              </View>

              {/* Arrow */}

              <View
                style={[
                  styles.arrowContainer,
                  {
                    backgroundColor: isDark
                      ? "#211D29"
                      : "#F8F5FF",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.arrow,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  →
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        /* ================= EMPTY STATE ================= */

        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "rgba(154, 122, 255, 0.12)"
                  : "rgba(109, 61, 245, 0.08)",
              },
            ]}
          >
            <Text
              style={[
                styles.emptyHeart,
                {
                  color: theme.primary,
                },
              ]}
            >
              ♥
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
            No matches yet
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Keep exploring and start liking people
            you vibe with. Your matches will appear
            here.
          </Text>

          <Pressable
            onPress={() =>
              router.replace("/discover")
            }
            style={({ pressed }) => [
              styles.discoverButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [
                  {
                    scale: pressed ? 0.98 : 1,
                  },
                ],
              },
            ]}
          >
            <Text
              style={styles.discoverButtonText}
            >
              Discover people
            </Text>

            <Text style={styles.discoverArrow}>
              →
            </Text>
          </Pressable>
        </View>
      )}

      {/* ================= BOTTOM NAV ================= */}

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        {/* Discover */}

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/discover")
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
            ⌂
          </Text>

          <Text
            style={[
              styles.navText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Discover
          </Text>
        </Pressable>

        {/* Likes */}

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

        {/* Matches */}

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.replace("/matches")
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
            ◉
          </Text>

          <Text
            style={[
              styles.navTextActive,
              {
                color: theme.primary,
              },
            ]}
          >
            Matches
          </Text>
        </Pressable>

        {/* Profile */}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: 18,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 14,
    fontWeight: "800",
  },

  /* ================= TITLE ================= */

  titleRow: {
    marginTop: 28,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  titleSubtitle: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    maxWidth: 260,
  },

  matchCount: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
  },

  /* ================= LOADING ================= */

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 70,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },

  /* ================= MATCH LIST ================= */

  list: {
    gap: 12,
  },

  matchCard: {
    minHeight: 82,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  onlineDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },

  matchInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "800",
  },

  verified: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  message: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
  },

  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    fontSize: 18,
    fontWeight: "600",
  },

  /* ================= EMPTY / ERROR ================= */

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 60,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyHeart: {
    fontSize: 36,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },

  discoverButton: {
    marginTop: 22,
    minHeight: 50,
    paddingHorizontal: 21,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  discoverButtonText: {
    color: "#FFFFFF",
    ...typography.smallButton,
  },

  discoverArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 9,
  },

  /* ================= BOTTOM NAV ================= */

  bottomNav: {
    height: 72,
    marginHorizontal: -18,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: "auto",
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
    fontWeight: "700",
  },
});