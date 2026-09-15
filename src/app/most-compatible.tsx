import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";

const compatibleProfiles = [
  {
    name: "Riya",
    age: 24,
    distance: "3 km away",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900",
    match: 94,
    reason:
      "You both love travel, coffee and dogs.",
    interests: ["Travel", "Coffee", "Dogs"],
    intention: "Something serious",
  },
  {
    name: "Ananya",
    age: 23,
    distance: "4 km away",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900",
    match: 91,
    reason:
      "You both enjoy music, movies and good food.",
    interests: ["Music", "Movies", "Food"],
    intention: "Long-term relationship",
  },
  {
    name: "Meera",
    age: 25,
    distance: "5 km away",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900",
    match: 89,
    reason:
      "Your travel, books and art interests line up.",
    interests: ["Books", "Travel", "Art"],
    intention: "Something serious",
  },
  {
    name: "Ishita",
    age: 24,
    distance: "6 km away",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900",
    match: 87,
    reason:
      "You both enjoy fitness, music and coffee.",
    interests: ["Fitness", "Music", "Coffee"],
    intention: "Long-term relationship",
  },
  {
    name: "Sara",
    age: 23,
    distance: "7 km away",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900",
    match: 85,
    reason:
      "You both love food, travel and movie nights.",
    interests: ["Food", "Travel", "Movies"],
    intention: "Something casual",
  },
  {
    name: "Naina",
    age: 26,
    distance: "8 km away",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900",
    match: 83,
    reason:
      "You have a lot in common around books and nature.",
    interests: ["Yoga", "Books", "Nature"],
    intention: "Something serious",
  },
];

export default function MostCompatibleScreen() {
  const { theme, isDark } = useTheme();

  const openProfile = (name: string) => {
    router.push({
      pathname: "/profile-detail",
      params: {
        name,
      },
    });
  };

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

      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => router.back()}
        >
          <Text
            style={[
              styles.backText,
              {
                color: theme.text,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerTitleBox}>
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
                color: theme.textMuted,
              },
            ]}
          >
            People you're most likely to vibe with
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ================= INTRO ================= */}

        <View
          style={[
            styles.introCard,
            {
              backgroundColor: isDark
                ? "rgba(109,61,245,0.13)"
                : "#F4F0FF",
              borderColor: isDark
                ? "rgba(154,122,255,0.25)"
                : "#E6DEFF",
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Text style={styles.introIconText}>💯</Text>
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
              Your strongest matches
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              We found people who closely match your
              interests, preferences and vibe.
            </Text>
          </View>
        </View>

        {/* ================= COUNT ================= */}

        <View style={styles.countRow}>
          <Text
            style={[
              styles.countTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {compatibleProfiles.length} people match your vibe
          </Text>

          <Text
            style={[
              styles.countSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Highest compatibility first
          </Text>
        </View>

        {/* ================= PROFILES ================= */}

        {compatibleProfiles.map((profile) => (
          <View
            key={profile.name}
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            {/* IMAGE */}

            <Pressable
              onPress={() => openProfile(profile.name)}
              style={styles.imageWrapper}
            >
              <Image
                source={{
                  uri: profile.image,
                }}
                style={styles.profileImage}
              />

              <View style={styles.imageOverlay} />

              <View style={styles.compatibleBadge}>
                <Text style={styles.compatibleBadgeText}>
                  ✨ Great match
                </Text>
              </View>

              <View style={styles.imageInfo}>
                <Text style={styles.imageName}>
                  {profile.name}, {profile.age}
                </Text>

                <Text style={styles.imageDistance}>
                  📍 {profile.distance}
                </Text>
              </View>
            </Pressable>

            {/* CONTENT */}

            <View style={styles.profileContent}>
              <View style={styles.topRow}>
                <View>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.name,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {profile.name}, {profile.age}
                    </Text>

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
                  </View>

                  <Text
                    style={[
                      styles.distance,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    📍 {profile.distance}
                  </Text>
                </View>

                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,107,138,0.14)"
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
                    {profile.match}%
                  </Text>

                  <Text
                    style={[
                      styles.matchText,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    match
                  </Text>
                </View>
              </View>

              {/* WHY MATCH */}

              <View
                style={[
                  styles.reasonBox,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reasonLabel,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  WHY YOU MATCH
                </Text>

                <Text
                  style={[
                    styles.reasonText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {profile.reason}
                </Text>
              </View>

              {/* INTERESTS */}

              <View style={styles.tagRow}>
                {profile.interests.map((interest) => (
                  <View
                    key={interest}
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
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>

              {/* INTENTION */}

              <View style={styles.intentionRow}>
                <Text style={styles.intentionIcon}>
                  🎯
                </Text>

                <Text
                  style={[
                    styles.intentionText,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  {profile.intention}
                </Text>
              </View>

              {/* VIEW PROFILE */}

              <Pressable
                style={({ pressed }) => [
                  styles.viewButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() =>
                  openProfile(profile.name)
                }
              >
                <Text style={styles.viewButtonText}>
                  View Profile
                </Text>

                <Text style={styles.viewButtonArrow}>
                  →
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* ================= END ================= */}

        <View
          style={[
            styles.endCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={styles.endEmoji}>💕</Text>

          <Text
            style={[
              styles.endTitle,
              {
                color: theme.text,
              },
            ]}
          >
            That's all your strongest matches
          </Text>

          <Text
            style={[
              styles.endText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Keep discovering to find more people
            you might connect with.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 94,
    paddingHorizontal: 18,
    paddingTop: 45,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 32,
    lineHeight: 36,
    marginTop: -2,
  },

  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  headerSubtitle: {
    fontSize: 9,
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  introCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  introIconText: {
    fontSize: 22,
  },

  introContent: {
    flex: 1,
    marginLeft: 11,
  },

  introTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  introText: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  countRow: {
    marginTop: 23,
    marginBottom: 12,
  },

  countTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  countSubtitle: {
    fontSize: 9,
    marginTop: 3,
  },

  profileCard: {
    borderRadius: 23,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 15,
  },

  imageWrapper: {
    height: 270,
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
    height: 120,
    backgroundColor: "rgba(0,0,0,0.52)",
  },

  compatibleBadge: {
    position: "absolute",
    top: 13,
    left: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  compatibleBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  imageInfo: {
    position: "absolute",
    left: 15,
    bottom: 14,
  },

  imageName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  imageDistance: {
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 4,
  },

  profileContent: {
    padding: 14,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 17,
    fontWeight: "900",
  },

  verified: {
    width: 17,
    height: 17,
    borderRadius: 9,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  distance: {
    fontSize: 9,
    marginTop: 4,
  },

  matchBadge: {
    minWidth: 54,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: "center",
  },

  matchPercent: {
    fontSize: 15,
    fontWeight: "900",
  },

  matchText: {
    fontSize: 7,
    marginTop: 1,
  },

  reasonBox: {
    marginTop: 13,
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
  },

  reasonLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  reasonText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
    fontWeight: "600",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 11,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },

  tagText: {
    fontSize: 9,
    fontWeight: "600",
  },

  intentionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
  },

  intentionIcon: {
    fontSize: 13,
    marginRight: 5,
  },

  intentionText: {
    fontSize: 9,
  },

  viewButton: {
    height: 40,
    borderRadius: 12,
    marginTop: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  viewButtonArrow: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 6,
  },

  endCard: {
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 25,
    alignItems: "center",
    marginTop: 5,
  },

  endEmoji: {
    fontSize: 27,
  },

  endTitle: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
  },

  endText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 5,
  },

  bottomSpace: {
    height: 15,
  },
});