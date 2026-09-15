import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

const initialBlockedUsers = [
  {
    id: "1",
    name: "Alex",
    age: 24,
    image: "👨🏻",
  },
  {
    id: "2",
    name: "Ryan",
    age: 25,
    image: "👨🏼",
  },
];

export default function BlockedUsersScreen() {
  const { theme, isDark } = useTheme();

  const [blockedUsers, setBlockedUsers] =
    useState(initialBlockedUsers);

  const iconBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "rgba(109, 61, 245, 0.08)";

  const handleUnblock = (
    id: string,
    name: string
  ) => {
    Alert.alert(
      `Unblock ${name}?`,
      "This person will be able to interact with you again.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unblock",
          onPress: () => {
            setBlockedUsers((users) =>
              users.filter((user) => user.id !== id)
            );
          },
        },
      ]
    );
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
      {/* HEADER */}
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
          Blocked Users
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* DESCRIPTION */}
        <View
          style={[
            styles.introBox,
            {
              backgroundColor: isDark
                ? "rgba(154, 122, 255, 0.08)"
                : "rgba(109, 61, 245, 0.05)",
              borderColor: isDark
                ? "rgba(154, 122, 255, 0.16)"
                : "rgba(109, 61, 245, 0.10)",
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: iconBackground,
              },
            ]}
          >
            <Text style={styles.introEmoji}>
              🛡️
            </Text>
          </View>

          <Text
            style={[
              styles.description,
              {
                color: theme.textMuted,
              },
            ]}
          >
            People you block won't be able to see
            your profile, message you, or interact
            with you.
          </Text>
        </View>

        {/* BLOCKED USERS */}
        {blockedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: iconBackground,
                },
              ]}
            >
              <Text style={styles.emptyEmoji}>
                🛡️
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
              No blocked users
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              You haven't blocked anyone yet.
            </Text>
          </View>
        ) : (
          <View style={styles.userList}>
            <Text
              style={[
                styles.listLabel,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              BLOCKED PEOPLE
            </Text>

            {blockedUsers.map((user) => (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                {/* AVATAR */}
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: iconBackground,
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {user.image}
                  </Text>
                </View>

                {/* USER INFO */}
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {user.name}, {user.age}
                  </Text>

                  <View style={styles.blockedRow}>
                    <View
                      style={[
                        styles.blockedDot,
                        {
                          backgroundColor:
                            theme.danger,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.blockedText,
                        {
                          color: theme.danger,
                        },
                      ]}
                    >
                      Blocked
                    </Text>
                  </View>
                </View>

                {/* UNBLOCK */}
                <Pressable
                  style={({ pressed }) => [
                    styles.unblockButton,
                    {
                      backgroundColor:
                        iconBackground,
                      borderColor: isDark
                        ? "rgba(154, 122, 255, 0.22)"
                        : "rgba(109, 61, 245, 0.12)",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() =>
                    handleUnblock(
                      user.id,
                      user.name
                    )
                  }
                >
                  <Text
                    style={[
                      styles.unblockText,
                      {
                        color: theme.primary,
                      },
                    ]}
                  >
                    Unblock
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* PRIVACY INFO */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark
                ? "rgba(53, 201, 138, 0.08)"
                : "rgba(53, 201, 138, 0.07)",
              borderColor: isDark
                ? "rgba(53, 201, 138, 0.16)"
                : "rgba(53, 201, 138, 0.12)",
            },
          ]}
        >
          <View
            style={[
              styles.infoIconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(53, 201, 138, 0.12)"
                  : "rgba(53, 201, 138, 0.10)",
              },
            ]}
          >
            <Text style={styles.infoIcon}>
              🔒
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Your privacy matters
            </Text>

            <Text
              style={[
                styles.infoText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Blocking someone is private. They
              won't be notified that you've blocked
              them.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* HEADER */

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

  headerSpace: {
    width: 42,
  },

  /* CONTENT */

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
  },

  /* INTRO */

  introBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  introIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  introEmoji: {
    fontSize: 20,
  },

  description: {
    flex: 1,
    ...typography.caption,
    lineHeight: 19,
  },

  /* LIST */

  userList: {
    gap: spacing.md,
  },

  listLabel: {
    ...typography.captionMedium,
    letterSpacing: 1,
    marginLeft: spacing.xs,
    marginBottom: -2,
  },

  userCard: {
    minHeight: 80,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  avatarText: {
    fontSize: 28,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    ...typography.bodyMedium,
    marginBottom: 5,
  },

  blockedRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  blockedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  blockedText: {
    ...typography.captionMedium,
  },

  unblockButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
  },

  unblockText: {
    ...typography.smallButton,
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    paddingTop: 65,
    paddingHorizontal: spacing.xxxl,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  emptyEmoji: {
    fontSize: 34,
  },

  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },

  emptyText: {
    ...typography.caption,
    textAlign: "center",
  },

  /* INFO */

  infoBox: {
    marginTop: spacing.xxl,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  infoIcon: {
    fontSize: 16,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    ...typography.captionMedium,
    marginBottom: 3,
  },

  infoText: {
    ...typography.caption,
    lineHeight: 18,
  },
});