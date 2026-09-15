import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as Location from "expo-location";

import { useTheme } from "../../hooks/use-theme";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useOnboardingStore } from "../../store/onboardingStore";

export default function LocationScreen() {
  const { theme, isDark } = useTheme();

  const setLocation = useOnboardingStore(
    (state) => state.setLocation
  );

  const clearLocation = useOnboardingStore(
    (state) => state.clearLocation
  );

  const latitude = useOnboardingStore(
    (state) => state.latitude
  );

  const longitude = useOnboardingStore(
    (state) => state.longitude
  );

  const [loading, setLoading] = useState(false);

  const hasLocation =
    latitude !== null &&
    longitude !== null;

  const handleEnableLocation = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      /*
       * Check whether location services are enabled
       */
      const servicesEnabled =
        await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        Alert.alert(
          "Location is turned off",
          "Please turn on location services on your phone and try again."
        );

        return;
      }

      /*
       * Request foreground location permission
       */
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        clearLocation();

        Alert.alert(
          "Location permission needed",
          "Location helps us show you people nearby. You can allow it from your phone settings."
        );

        return;
      }

      /*
       * Get current location
       */
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });

      const { latitude, longitude } =
        currentLocation.coords;

      /*
       * Store coordinates temporarily.
       *
       * They will be sent to the backend
       * when the profile is completed.
       */
      setLocation(
        latitude,
        longitude
      );
    } catch (error) {
      console.error(
        "Location error:",
        error
      );

      Alert.alert(
        "Couldn't get your location",
        "Something went wrong while getting your location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.replace(
      "/onboarding/complete"
    );
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
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Progress */}
        <View
          style={
            styles.progressContainer
          }
        >
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
            />
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.step,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            ALMOST THERE
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Find your{"\n"}people nearby. 📍
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Turn on location to discover
            people around you and get
            accurate distance information.
          </Text>
        </View>

        {/* Location Card */}
        <View
          style={[
            styles.locationCard,
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
              styles.locationIconOuter,
              {
                backgroundColor:
                  isDark
                    ? "#211D29"
                    : "#F3EEFF",
              },
            ]}
          >
            <View
              style={[
                styles.locationIcon,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.locationPin
                }
              >
                ●
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.cardTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {hasLocation
              ? "Location enabled"
              : "Use your location"}
          </Text>

          <Text
            style={[
              styles.cardText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            {hasLocation
              ? "You're ready to discover people nearby."
              : "We'll use your approximate location to calculate distances."}
          </Text>

          {hasLocation ? (
            <View
              style={[
                styles.enabledBadge,
                {
                  backgroundColor:
                    isDark
                      ? "#173026"
                      : "#EAF9F2",
                },
              ]}
            >
              <Text
                style={[
                  styles.enabledBadgeText,
                  {
                    color:
                      theme.success,
                  },
                ]}
              >
                ✓ Location ready
              </Text>
            </View>
          ) : (
            <Pressable
              disabled={loading}
              onPress={
                handleEnableLocation
              }
              style={({ pressed }) => [
                styles.enableButton,
                {
                  backgroundColor:
                    theme.primary,
                  opacity:
                    pressed && !loading
                      ? 0.9
                      : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.enableButtonText
                  }
                >
                  Enable Location
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Privacy Info */}
        <View
          style={[
            styles.infoBox,
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
          <Text
            style={[
              styles.infoIcon,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.infoText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Your exact location is never
            shown to other people. Vibe only
            uses it to calculate an
            approximate distance.
          </Text>
        </View>

        {/* Continue without location */}
        {!hasLocation && (
          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={styles.skipButton}
          >
            <Text
              style={[
                styles.skipText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              Continue without location
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Continue */}
      {hasLocation && (
        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor:
                  theme.primary,
                opacity:
                  pressed ? 0.9 : 1,
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
                styles.buttonText
              }
            >
              Continue
            </Text>

            <Text
              style={
                styles.buttonArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal:
      spacing.xxxl,
    paddingTop: 55,
    paddingBottom: 35,
  },

  progressContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 35,
  },

  progressSegment: {
    height: 5,
    flex: 1,
    borderRadius:
      radius.pill,
  },

  header: {
    marginBottom: 28,
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
    lineHeight: 23,
  },

  locationCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },

  locationIconOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  locationIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },

  locationPin: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 28,
  },

  cardTitle: {
    ...typography.h3,
    textAlign: "center",
  },

  cardText: {
    ...typography.body,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 290,
  },

  enableButton: {
    width: "100%",
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  enableButtonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  enabledBadge: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },

  enabledBadgeText: {
    ...typography.captionMedium,
  },

  infoBox: {
    marginTop: 16,
    minHeight: 70,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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

  skipButton: {
    alignItems: "center",
    paddingVertical: 18,
  },

  skipText: {
    ...typography.captionMedium,
    textDecorationLine:
      "underline",
  },

  footer: {
    paddingHorizontal:
      spacing.xxxl,
    paddingBottom:
      spacing.xxxl,
    paddingTop: spacing.sm,
  },

  button: {
    height: 56,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
});