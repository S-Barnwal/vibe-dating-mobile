import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../constants/theme";
import {
  getNewHereProfiles,
  type NewHereProfile,
} from "../services/profile.service";

const NewHereScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [profiles, setProfiles] = useState<NewHereProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadNewHere = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getNewHereProfiles();

        if (!mounted) {
          return;
        }

        setProfiles(response.data?.profiles || []);
      } catch (err) {
        console.error("New here screen error:", err);

        if (mounted) {
          setProfiles([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load new profiles."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNewHere();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBack = () => {
    router.replace("/discover");
  };

  const openProfile = (profile: NewHereProfile) => {
    router.push({
      pathname: "/profile-detail",
      params: {
        id: profile.id,
        name: profile.name ?? "",
      },
    });
  };

  const renderProfile = ({
    item,
  }: {
    item: NewHereProfile;
  }) => {
    return (
      <Pressable
        onPress={() => openProfile(item)}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.imageWrapper}>
          {item.primaryPhoto ? (
            <Image
              source={{ uri: item.primaryPhoto }}
              style={styles.image}
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  backgroundColor: isDark
                    ? "#211D29"
                    : "#F4F0F7",
                },
              ]}
            >
              <Ionicons
                name="person"
                size={42}
                color={colors.muted}
              />
            </View>
          )}

          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark"
                size={12}
                color="#FFFFFF"
              />
            </View>
          )}

          {item.photos.length > 1 && (
            <View style={styles.photoCount}>
              <Ionicons
                name="images-outline"
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.photoCountText}>
                {item.photos.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.name,
                {
                  color: colors.text,
                },
              ]}
            >
              {item.name || "Vibe Member"}
              {item.age ? `, ${item.age}` : ""}
            </Text>
          </View>

          {item.distance && (
            <View style={styles.distanceRow}>
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.muted}
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.distance,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {item.distance}
              </Text>
            </View>
          )}

          {item.bio ? (
            <Text
              numberOfLines={2}
              style={[
                styles.bio,
                {
                  color: colors.muted,
                },
              ]}
            >
              {item.bio}
            </Text>
          ) : null}

          {item.interests?.length > 0 && (
            <View style={styles.interests}>
              {item.interests.slice(0, 2).map((interest) => (
                <View
                  key={interest}
                  style={[
                    styles.interestChip,
                    {
                      backgroundColor: isDark
                        ? "#211D29"
                        : "#F6F1FF",
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.interestText,
                      {
                        color: isDark
                          ? "#B9A2FF"
                          : "#6D3DF5",
                      },
                    ]}
                  >
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => openProfile(item)}
            style={styles.viewProfileButton}
          >
            <Text style={styles.viewProfileText}>
              View Profile
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={handleBack}
          style={[
            styles.backButton,
            {
              backgroundColor: isDark
                ? "#211D29"
                : "#F5F1F7",
            },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerContent}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            New Here
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.muted,
              },
            ]}
          >
            Fresh faces, fresh vibes ✨
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#6D3DF5"
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: colors.muted,
              },
            ]}
          >
            Finding fresh vibes...
          </Text>
        </View>
      ) : error ? (
        /* Error */
        <View style={styles.center}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "#211D29"
                  : "#F6F1FF",
              },
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={30}
              color="#6D3DF5"
            />
          </View>

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Couldn't load profiles
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.muted,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      ) : profiles.length === 0 ? (
        /* Empty */
        <View style={styles.center}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "#211D29"
                  : "#F6F1FF",
              },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={30}
              color="#6D3DF5"
            />
          </View>

          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            No new vibes yet
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.muted,
              },
            ]}
          >
            New people will appear here as they join Vibe.
          </Text>
        </View>
      ) : (
        /* Profiles */
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderProfile}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </SafeAreaView>
  );
};

export default NewHereScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "500",
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },

  imageWrapper: {
    width: "100%",
    height: 190,
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6D3DF5",
    alignItems: "center",
    justifyContent: "center",
  },

  photoCount: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  content: {
    padding: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 3,
  },

  distance: {
    fontSize: 12,
    fontWeight: "500",
  },

  bio: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
  },

  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 9,
  },

  interestChip: {
    maxWidth: "100%",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
  },

  interestText: {
    fontSize: 10,
    fontWeight: "700",
  },

  viewProfileButton: {
    marginTop: 12,
    minHeight: 36,
    borderRadius: 12,
    backgroundColor: "#6D3DF5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  viewProfileText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});