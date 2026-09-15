import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useLikesStore } from "../store/likesStore";
import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

export default function LikesScreen() {
  const likes = useLikesStore(
    (state) => state.likedProfiles
  );

  const { theme, isDark } = useTheme();

  const countBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "#F0E9FF";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
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
            { backgroundColor: countBackground },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: theme.primary },
            ]}
          >
            {likes.length}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text
        style={[
          styles.title,
          { color: theme.text },
        ]}
      >
        Your likes
      </Text>

      {likes.length > 0 ? (
        <View style={styles.grid}>
          {likes.map((person) => (
            <Pressable
              key={person.name}
              style={[
                styles.card,
                {
                  backgroundColor: theme.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/profile-detail",
                  params: {
                    name: person.name,
                  },
                })
              }
            >
              <Image
                source={{ uri: person.image }}
                style={styles.image}
              />

              <View style={styles.overlay} />

              <View style={styles.info}>
                <Text style={styles.name}>
                  {person.name}, {person.age}
                </Text>

                <Text style={styles.tap}>
                  Tap to view
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        /* Empty State */
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: countBackground },
            ]}
          >
            <Text
              style={[
                styles.emptyIconText,
                { color: theme.primary },
              ]}
            >
              ♡
            </Text>
          </View>

          <Text
            style={[
              styles.emptyTitle,
              { color: theme.text },
            ]}
          >
            No likes yet
          </Text>

          <Text
            style={[
              styles.emptyText,
              { color: theme.textMuted },
            ]}
          >
            Keep discovering people and your
            likes will show up here.
          </Text>

          <Pressable
            style={[
              styles.discoverButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={() =>
              router.replace("/discover")
            }
          >
            <Text style={styles.discoverButtonText}>
              Discover people
            </Text>
          </Pressable>
        </View>
      )}

      {/* Bottom Navigation */}
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
          onPress={() => router.replace("/discover")}
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
          onPress={() => router.replace("/matches")}
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
          onPress={() => router.replace("/profile")}
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

  /* Header */

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

  /* Content */

  title: {
    marginTop: 28,
    marginBottom: 18,
    ...typography.h2,
    fontSize: 25,
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

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  info: {
    position: "absolute",
    left: 13,
    right: 13,
    bottom: 13,
  },

  name: {
    color: "#FFFFFF",
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: "800",
  },

  tap: {
    marginTop: 3,
    color: "#FFFFFF",
    ...typography.caption,
    fontSize: 11,
  },

  /* Empty State */

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    marginTop: -50,
  },

  emptyIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyIconText: {
    fontSize: 34,
    fontWeight: "300",
  },

  emptyTitle: {
    ...typography.h2,
    fontSize: 22,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 280,
  },

  discoverButton: {
    marginTop: 18,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  discoverButtonText: {
    color: "#FFFFFF",
    ...typography.button,
    fontSize: 14,
  },

  /* Bottom Navigation */

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