import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../../hooks/use-theme";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOnboardingStore } from "../../store/onboardingStore";

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function PhotosScreen() {
  const { theme, isDark } = useTheme();

  const storedPhotos = useOnboardingStore(
    (state) => state.photos
  );

  const setPhotos = useOnboardingStore(
    (state) => state.setPhotos
  );

  const [photos, setLocalPhotos] =
    useState<string[]>(storedPhotos);

  const pickPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        "Maximum photos",
        "You can add up to 6 photos."
      );
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to add your photos."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

    if (
      !result.canceled &&
      result.assets.length > 0
    ) {
      const newPhoto = result.assets[0].uri;

      setLocalPhotos((current) => [
        ...current,
        newPhoto,
      ]);
    }
  };

  const removePhoto = (index: number) => {
    setLocalPhotos((current) =>
      current.filter(
        (_, photoIndex) => photoIndex !== index
      )
    );
  };

  const canContinue =
    photos.length >= MIN_PHOTOS;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    setPhotos(photos);

   router.replace("/onboarding/profile-details");
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.step,
              {
                color: theme.primary,
              },
            ]}
          >
            LAST STEP
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Show them{"\n"}your vibe.
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Add your best photos so people can get
            to know the real you.
          </Text>
        </View>

        {/* Photo Count */}
        <View style={styles.countRow}>
          <Text
            style={[
              styles.count,
              {
                color: theme.primary,
              },
            ]}
          >
            {photos.length} / {MAX_PHOTOS} photos
          </Text>

          <Text
            style={[
              styles.minimum,
              {
                color: theme.textMuted,
              },
            ]}
          >
            {canContinue
              ? "Looking good ✨"
              : `${MIN_PHOTOS - photos.length} more needed`}
          </Text>
        </View>

        {/* Photo Grid */}
        <View style={styles.photoGrid}>
          {Array.from({
            length: MAX_PHOTOS,
          }).map((_, index) => {
            const photo = photos[index];

            return (
              <Pressable
                key={index}
                onPress={
                  photo ? undefined : pickPhoto
                }
                style={({ pressed }) => [
                  styles.photoBox,
                  {
                    backgroundColor: photo
                      ? theme.surface
                      : isDark
                      ? "#19161F"
                      : "#FFFFFF",

                    borderColor: photo
                      ? theme.border
                      : isDark
                      ? "#40384A"
                      : "#D8D0DF",

                    transform: [
                      {
                        scale:
                          pressed && !photo
                            ? 0.97
                            : 1,
                      },
                    ],
                  },
                ]}
              >
                {photo ? (
                  <>
                    {/* Photo */}
                    <Image
                      source={{ uri: photo }}
                      style={styles.photo}
                    />

                    {/* Main Photo Badge */}
                    {index === 0 && (
                      <View
                        style={[
                          styles.mainBadge,
                          {
                            backgroundColor:
                              theme.primary,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.mainBadgeText
                          }
                        >
                          Main
                        </Text>
                      </View>
                    )}

                    {/* Remove */}
                    <Pressable
                      style={[
                        styles.removeButton,
                        {
                          backgroundColor: isDark
                            ? "#FFFFFF"
                            : "#17151C",
                        },
                      ]}
                      onPress={() =>
                        removePhoto(index)
                      }
                      hitSlop={6}
                    >
                      <Text
                        style={[
                          styles.removeText,
                          {
                            color: isDark
                              ? "#17151C"
                              : "#FFFFFF",
                          },
                        ]}
                      >
                        ×
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {/* Add Icon */}
                    <View
                      style={[
                        styles.plusCircle,
                        {
                          backgroundColor: isDark
                            ? "#211D29"
                            : "#F3EEFF",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.plus,
                          {
                            color:
                              theme.primary,
                          },
                        ]}
                      >
                        +
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.addText,
                        {
                          color:
                            theme.textMuted,
                        },
                      ]}
                    >
                      Add photo
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Info */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark
                ? "#19161F"
                : "#FFFFFF",
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.infoIcon,
              {
                color: theme.primary,
              },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.infoText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Add at least 2 photos. Your first photo
            will be your main profile photo.
          </Text>
        </View>

        {/* Continue */}
        <Pressable
          disabled={!canContinue}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: canContinue
                ? theme.primary
                : isDark
                ? "#302A3A"
                : "#E6E1EA",

              opacity:
                pressed && canContinue
                  ? 0.9
                  : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: canContinue
                  ? "#FFFFFF"
                  : theme.textMuted,
              },
            ]}
          >
            Continue
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: 55,
    paddingBottom: spacing.xxxl,
  },

  /* Progress */

  progressContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 35,
  },

  progressActive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  /* Header */

  header: {
    marginBottom: 24,
  },

  step: {
    ...typography.captionMedium,
    marginBottom: 14,
  },

  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: spacing.md,
    ...typography.body,
    lineHeight: 22,
  },

  /* Count */

  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  count: {
    ...typography.captionMedium,
  },

  minimum: {
    ...typography.caption,
  },

  /* Photo Grid */

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  photoBox: {
    width: "31.8%",
    aspectRatio: 0.78,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  plus: {
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "300",
  },

  addText: {
    marginTop: 6,
    ...typography.captionMedium,
  },

  /* Main Badge */

  mainBadge: {
    position: "absolute",
    left: 7,
    bottom: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },

  mainBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  /* Remove */

  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "400",
  },

  /* Info */

  infoBox: {
    marginTop: 16,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    ...typography.caption,
    lineHeight: 18,
  },

  /* Button */

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },

  buttonText: {
    ...typography.button,
  },
});