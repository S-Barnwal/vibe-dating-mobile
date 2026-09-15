import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

export default function FiltersScreen() {
  const { theme, isDark } = useTheme();

  const [ageRange, setAgeRange] = useState("22 - 30");
  const [distance, setDistance] = useState("10 km");
  const [gender, setGender] = useState("Everyone");
  const [intention, setIntention] = useState("Anything");

  const optionActiveBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "rgba(109, 61, 245, 0.06)";

  const applyFilters = () => {
    router.back();
  };

  const resetFilters = () => {
    setAgeRange("22 - 30");
    setDistance("10 km");
    setGender("Everyone");
    setIntention("Anything");
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
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
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
              styles.backIcon,
              {
                color: theme.text,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Filters
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            {
              opacity: pressed ? 0.65 : 1,
            },
          ]}
          onPress={resetFilters}
        >
          <Text
            style={[
              styles.resetText,
              {
                color: theme.primary,
              },
            ]}
          >
            Reset
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Age */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Age range
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Choose the age range you'd like to meet
          </Text>

          <View style={styles.optionsRow}>
            {["18 - 21", "22 - 30", "31 - 40", "40+"].map(
              (option) => {
                const selected = ageRange === option;

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: selected
                          ? theme.primary
                          : theme.surface,
                        borderColor: selected
                          ? theme.primary
                          : theme.border,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                    onPress={() => setAgeRange(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selected
                            ? "#FFFFFF"
                            : theme.textMuted,
                        },
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Maximum distance
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Show people within this distance
          </Text>

          <View style={styles.optionsRow}>
            {["5 km", "10 km", "25 km", "50 km"].map(
              (option) => {
                const selected = distance === option;

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: selected
                          ? theme.primary
                          : theme.surface,
                        borderColor: selected
                          ? theme.primary
                          : theme.border,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                    onPress={() => setDistance(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selected
                            ? "#FFFFFF"
                            : theme.textMuted,
                        },
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Interested in
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Who would you like to discover?
          </Text>

          <View style={styles.cardOptions}>
            {["Everyone", "Women", "Men"].map(
              (option) => {
                const selected = gender === option;

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.cardOption,
                      {
                        backgroundColor: selected
                          ? optionActiveBackground
                          : theme.surface,
                        borderColor: selected
                          ? theme.primary
                          : theme.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text
                      style={[
                        styles.cardOptionText,
                        {
                          color: selected
                            ? theme.primary
                            : theme.text,
                          fontWeight: selected
                            ? "800"
                            : "600",
                        },
                      ]}
                    >
                      {option}
                    </Text>

                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: selected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                    >
                      {selected && (
                        <View
                          style={[
                            styles.radioInner,
                            {
                              backgroundColor:
                                theme.primary,
                            },
                          ]}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>

        {/* Dating Intention */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Dating intention
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            What are you looking for?
          </Text>

          <View style={styles.cardOptions}>
            {[
              "Anything",
              "Something serious",
              "Something casual",
              "New friends",
            ].map((option) => {
              const selected = intention === option;

              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.cardOption,
                    {
                      backgroundColor: selected
                        ? optionActiveBackground
                        : theme.surface,
                      borderColor: selected
                        ? theme.primary
                        : theme.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => setIntention(option)}
                >
                  <Text
                    style={[
                      styles.cardOptionText,
                      {
                        color: selected
                          ? theme.primary
                          : theme.text,
                        fontWeight: selected
                          ? "800"
                          : "600",
                      },
                    ]}
                  >
                    {option}
                  </Text>

                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: selected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.radioInner,
                          {
                            backgroundColor:
                              theme.primary,
                          },
                        ]}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Apply Button */}
        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={applyFilters}
        >
          <Text style={styles.applyButtonText}>
            Apply filters
          </Text>
        </Pressable>

        <Text
          style={[
            styles.note,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Filters help us show people who are more likely
          to match your vibe.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 70,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 38,
  },

  headerTitle: {
    ...typography.h3,
  },

  resetButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },

  resetText: {
    ...typography.smallButton,
    fontSize: 12,
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },

  section: {
    marginBottom: spacing.xxxl,
  },

  sectionTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
  },

  sectionSubtitle: {
    marginTop: spacing.xs,
    ...typography.caption,
    lineHeight: 18,
  },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  option: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
  },

  optionText: {
    ...typography.smallButton,
    fontSize: 12,
  },

  cardOptions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  cardOption: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardOptionText: {
    ...typography.body,
    fontSize: 13,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  applyButton: {
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },

  applyButtonText: {
    ...typography.button,
    color: "#FFFFFF",
  },

  note: {
    textAlign: "center",
    ...typography.caption,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
});