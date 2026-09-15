import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

const initialNotifications = [
  {
    id: "1",
    type: "like",
    icon: "💜",
    title: "Someone liked you",
    message: "You have a new like waiting for you.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "match",
    icon: "✨",
    title: "It's a match!",
    message: "You matched with Maya.",
    time: "15 min ago",
    unread: true,
  },
  {
    id: "3",
    type: "message",
    icon: "💬",
    title: "New message",
    message: "Maya sent you a message.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "4",
    type: "superlike",
    icon: "⭐",
    title: "You got a Super Like",
    message: "Someone really wants to meet you.",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "5",
    type: "profile",
    icon: "❤️",
    title: "Your profile is getting attention",
    message: "People are checking out your profile.",
    time: "Yesterday",
    unread: false,
  },
];

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();

  const [notificationList, setNotificationList] =
    useState(initialNotifications);

  const unreadCount = notificationList.filter(
    (item) => item.unread
  ).length;

  const iconBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "rgba(109, 61, 245, 0.08)";

  const unreadBackground = isDark
    ? "rgba(154, 122, 255, 0.08)"
    : "rgba(109, 61, 245, 0.035)";

  const markAllAsRead = () => {
    setNotificationList((currentList) =>
      currentList.map((item) => ({
        ...item,
        unread: false,
      }))
    );
  };

  const openNotification = (
    item: (typeof initialNotifications)[0]
  ) => {
    if (item.unread) {
      setNotificationList((currentList) =>
        currentList.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                unread: false,
              }
            : notification
        )
      );
    }

    // Match notification
    if (item.type === "match") {
      router.push("/matches");
      return;
    }

    // Message notification
    if (item.type === "message") {
      router.push("/chat");
      return;
    }

    // Like notification
    if (item.type === "like") {
      router.push("/likes");
      return;
    }
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
          Notifications
        </Text>

        <Pressable
          style={styles.markButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markText,
              {
                color:
                  unreadCount === 0
                    ? theme.textMuted
                    : theme.primary,
              },
            ]}
          >
            {unreadCount > 0
              ? "Read all"
              : "All read ✓"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Section Title */}
        <Text
          style={[
            styles.todayTitle,
            {
              color: theme.textMuted,
            },
          ]}
        >
          RECENT
        </Text>

        {/* Notification Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {notificationList.map((item, index) => (
            <React.Fragment key={item.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.notificationRow,
                  item.unread && {
                    backgroundColor: unreadBackground,
                  },
                  pressed && {
                    opacity: 0.78,
                  },
                ]}
                onPress={() => openNotification(item)}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: iconBackground,
                    },
                  ]}
                >
                  <Text style={styles.icon}>
                    {item.icon}
                  </Text>
                </View>

                {/* Content */}
                <View style={styles.notificationContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {item.title}
                    </Text>

                    {item.unread && (
                      <View
                        style={[
                          styles.unreadDot,
                          {
                            backgroundColor:
                              theme.primary,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.notificationMessage,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    {item.message}
                  </Text>

                  <Text
                    style={[
                      styles.time,
                      {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
              </Pressable>

              {index !==
                notificationList.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: theme.border,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Bottom Message */}
        <View style={styles.bottomMessage}>
          <Text style={styles.bottomEmoji}>
            💜
          </Text>

          <Text
            style={[
              styles.bottomText,
              {
                color: theme.text,
              },
            ]}
          >
            You're all caught up!
          </Text>

          <Text
            style={[
              styles.bottomSubtext,
              {
                color: theme.textMuted,
              },
            ]}
          >
            We'll let you know when something new
            happens.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Header */
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

  markButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    minWidth: 60,
    alignItems: "flex-end",
  },

  markText: {
    ...typography.smallButton,
    fontSize: 11,
  },

  /* Content */
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },

  todayTitle: {
    ...typography.captionMedium,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  /* Notification Card */
  card: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
  },

  notificationRow: {
    minHeight: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  icon: {
    fontSize: 21,
  },

  notificationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    ...typography.bodyMedium,
    fontSize: 14,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },

  notificationMessage: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },

  time: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
  },

  divider: {
    height: 1,
    marginLeft: 74,
  },

  /* Bottom Message */
  bottomMessage: {
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: spacing.xxl,
  },

  bottomEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },

  bottomText: {
    ...typography.bodyMedium,
    fontSize: 15,
  },

  bottomSubtext: {
    ...typography.caption,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});