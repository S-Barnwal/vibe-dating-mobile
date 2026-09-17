import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { useTheme } from "../hooks/use-theme";

import {
  spacing,
  radius,
} from "../constants/spacing";

import {
  typography,
} from "../constants/typography";

import {
  getBlockedUsers,
  unblockUser,
  type BlockedUser,
} from "../services/block.service";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300";

export default function BlockedUsersScreen() {
  const { theme, isDark } = useTheme();

  const [blockedUsers, setBlockedUsers] =
    useState<BlockedUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [unblockingId, setUnblockingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  // Selected user for unblock confirmation
  const [selectedUser, setSelectedUser] =
    useState<BlockedUser | null>(null);

  const [showUnblockModal, setShowUnblockModal] =
    useState(false);

  const iconBackground = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "rgba(109, 61, 245, 0.08)";

  /*
   * ==========================================
   * LOAD BLOCKED USERS
   * ==========================================
   */

  const loadBlockedUsers = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response =
        await getBlockedUsers();

      setBlockedUsers(
        response.data?.users || []
      );
    } catch (err) {
      console.error(
        "Load blocked users error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load blocked users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * ==========================================
   * REFRESH WHEN SCREEN OPENS
   * ==========================================
   */

  useFocusEffect(
    useCallback(() => {
      loadBlockedUsers();
    }, [])
  );

  /*
   * ==========================================
   * PULL TO REFRESH
   * ==========================================
   */

  const handleRefresh = () => {
    setRefreshing(true);
    loadBlockedUsers(false);
  };

  /*
   * ==========================================
   * OPEN UNBLOCK CONFIRMATION
   * ==========================================
   */

  const handleUnblockPress = (
    user: BlockedUser
  ) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
  };

  /*
   * ==========================================
   * CONFIRM UNBLOCK
   * ==========================================
   */

  const confirmUnblock = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setUnblockingId(
        selectedUser.userId
      );

      await unblockUser(
        selectedUser.userId
      );

      /*
       * Remove immediately from UI
       */

      setBlockedUsers(
        (users) =>
          users.filter(
            (item) =>
              item.userId !==
              selectedUser.userId
          )
      );

      setShowUnblockModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(
        "Unblock user error:",
        err
      );

      setShowUnblockModal(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to unblock this user."
      );
    } finally {
      setUnblockingId(null);
    }
  };

  /*
   * ==========================================
   * CLOSE MODAL
   * ==========================================
   */

  const closeUnblockModal = () => {
    if (unblockingId) {
      return;
    }

    setShowUnblockModal(false);
    setSelectedUser(null);
  };

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          Loading blocked users...
        </Text>
      </View>
    );
  }

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
      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor:
                theme.surface,
              borderColor:
                theme.border,
              opacity: pressed
                ? 0.7
                : 1,
            },
          ]}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={[
              styles.backIcon,
              {
                color:
                  theme.text,
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
              color:
                theme.text,
            },
          ]}
        >
          Blocked Users
        </Text>

        <View
          style={styles.headerSpace}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor={
              theme.primary
            }
          />
        }
      >
        {/* DESCRIPTION */}

        <View
          style={[
            styles.introBox,
            {
              backgroundColor:
                isDark
                  ? "rgba(154, 122, 255, 0.08)"
                  : "rgba(109, 61, 245, 0.05)",

              borderColor:
                isDark
                  ? "rgba(154, 122, 255, 0.16)"
                  : "rgba(109, 61, 245, 0.10)",
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor:
                  iconBackground,
              },
            ]}
          >
            <Text
              style={
                styles.introEmoji
              }
            >
              🛡️
            </Text>
          </View>

          <Text
            style={[
              styles.description,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            People you block won't
            be able to see your
            profile, message you, or
            interact with you.
          </Text>
        </View>

        {/* ERROR */}

        {error ? (
          <View
            style={
              styles.errorContainer
            }
          >
            <Text
              style={[
                styles.errorText,
                {
                  color:
                    theme.danger,
                },
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
              onPress={() =>
                loadBlockedUsers()
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : blockedUsers.length ===
          0 ? (
          /* EMPTY STATE */

          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >
              <Text
                style={
                  styles.emptyEmoji
                }
              >
                🛡️
              </Text>
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              No blocked users
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              You haven't blocked
              anyone yet.
            </Text>
          </View>
        ) : (
          /* BLOCKED USERS */

          <View
            style={styles.userList}
          >
            <Text
              style={[
                styles.listLabel,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              BLOCKED PEOPLE
            </Text>

            {blockedUsers.map(
              (user) => {
                const image =
                  user.primaryPhoto ||
                  user.photos?.[0] ||
                  DEFAULT_AVATAR;

                const isUnblocking =
                  unblockingId ===
                  user.userId;

                return (
                  <View
                    key={
                      user.userId
                    }
                    style={[
                      styles.userCard,
                      {
                        backgroundColor:
                          theme.surface,
                        borderColor:
                          theme.border,
                      },
                    ]}
                  >
                    {/* AVATAR */}

                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor:
                            iconBackground,
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri: image,
                        }}
                        style={
                          styles.avatarImage
                        }
                      />
                    </View>

                    {/* USER INFO */}

                    <View
                      style={
                        styles.userInfo
                      }
                    >
                      <Text
                        style={[
                          styles.userName,
                          {
                            color:
                              theme.text,
                          },
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {user.name}

                        {user.age !==
                        null
                          ? `, ${user.age}`
                          : ""}
                      </Text>

                      <View
                        style={
                          styles.blockedRow
                        }
                      >
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
                              color:
                                theme.danger,
                            },
                          ]}
                        >
                          Blocked
                        </Text>
                      </View>
                    </View>

                    {/* UNBLOCK */}

                    <Pressable
                      style={({
                        pressed,
                      }) => [
                        styles.unblockButton,
                        {
                          backgroundColor:
                            iconBackground,

                          borderColor:
                            isDark
                              ? "rgba(154, 122, 255, 0.22)"
                              : "rgba(109, 61, 245, 0.12)",

                          opacity:
                            pressed ||
                            isUnblocking
                              ? 0.7
                              : 1,
                        },
                      ]}
                      disabled={
                        isUnblocking
                      }
                      onPress={() =>
                        handleUnblockPress(
                          user
                        )
                      }
                    >
                      {isUnblocking ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            theme.primary
                          }
                        />
                      ) : (
                        <Text
                          style={[
                            styles.unblockText,
                            {
                              color:
                                theme.primary,
                            },
                          ]}
                        >
                          Unblock
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              }
            )}
          </View>
        )}

        {/* PRIVACY INFO */}

        <View
          style={[
            styles.infoBox,
            {
              backgroundColor:
                isDark
                  ? "rgba(53, 201, 138, 0.08)"
                  : "rgba(53, 201, 138, 0.07)",

              borderColor:
                isDark
                  ? "rgba(53, 201, 138, 0.16)"
                  : "rgba(53, 201, 138, 0.12)",
            },
          ]}
        >
          <View
            style={[
              styles.infoIconContainer,
              {
                backgroundColor:
                  isDark
                    ? "rgba(53, 201, 138, 0.12)"
                    : "rgba(53, 201, 138, 0.10)",
              },
            ]}
          >
            <Text
              style={styles.infoIcon}
            >
              🔒
            </Text>
          </View>

          <View
            style={
              styles.infoContent
            }
          >
            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Your privacy matters
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
              Blocking someone is
              private. They won't be
              notified that you've
              blocked them.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ==========================================
          UNBLOCK CONFIRMATION MODAL
          ========================================== */}

      <Modal
        visible={showUnblockModal}
        transparent
        animationType="fade"
        onRequestClose={
          closeUnblockModal
        }
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                isDark
                  ? "rgba(0, 0, 0, 0.72)"
                  : "rgba(23, 21, 28, 0.45)",
            },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  theme.surface,
                borderColor:
                  theme.border,
              },
            ]}
          >
            {/* ICON */}

            <View
              style={[
                styles.modalIcon,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >
              <Text
                style={
                  styles.modalEmoji
                }
              >
                🔓
              </Text>
            </View>

            {/* TITLE */}

            <Text
              style={[
                styles.modalTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Unblock{" "}
              {selectedUser?.name}?
            </Text>

            {/* DESCRIPTION */}

            <Text
              style={[
                styles.modalDescription,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              This person will be able
              to interact with you
              again.
            </Text>

            {/* ACTIONS */}

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor:
                      theme.background,
                    borderColor:
                      theme.border,
                    opacity:
                      pressed ? 0.7 : 1,
                  },
                ]}
                onPress={
                  closeUnblockModal
                }
                disabled={
                  !!unblockingId
                }
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  {
                    backgroundColor:
                      theme.primary,
                    opacity:
                      pressed ||
                      !!unblockingId
                        ? 0.7
                        : 1,
                  },
                ]}
                onPress={
                  confirmUnblock
                }
                disabled={
                  !!unblockingId
                }
              >
                {unblockingId ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.confirmButtonText
                    }
                  >
                    Unblock
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
    },

    /* HEADER */

    header: {
      height: 70,
      paddingHorizontal:
        spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius:
        radius.pill,
      alignItems: "center",
      justifyContent:
        "center",
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
      paddingHorizontal:
        spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom:
        spacing.massive,
    },

    /* INTRO */

    introBox: {
      borderRadius:
        radius.xl,
      borderWidth: 1,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      marginBottom:
        spacing.xxl,
    },

    introIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight:
        spacing.md,
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
      borderRadius:
        radius.xl,
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
      justifyContent:
        "center",
      marginRight:
        spacing.md,
      overflow: "hidden",
    },

    avatarImage: {
      width: "100%",
      height: "100%",
    },

    userInfo: {
      flex: 1,
      minWidth: 0,
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
      minWidth: 78,
      paddingHorizontal:
        spacing.md,
      paddingVertical: 9,
      borderRadius:
        radius.md,
      borderWidth: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    unblockText: {
      ...typography.smallButton,
    },

    /* EMPTY */

    emptyContainer: {
      alignItems: "center",
      paddingTop: 65,
      paddingHorizontal:
        spacing.xxxl,
    },

    emptyIcon: {
      width: 78,
      height: 78,
      borderRadius: 39,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom:
        spacing.lg,
    },

    emptyEmoji: {
      fontSize: 34,
    },

    emptyTitle: {
      ...typography.h3,
      marginBottom:
        spacing.xs,
    },

    emptyText: {
      ...typography.caption,
      textAlign: "center",
    },

    /* ERROR */

    errorContainer: {
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal:
        spacing.xxxl,
    },

    errorText: {
      ...typography.caption,
      textAlign: "center",
      lineHeight: 19,
    },

    retryButton: {
      marginTop: spacing.lg,
      paddingHorizontal:
        spacing.xl,
      paddingVertical: 10,
      borderRadius:
        radius.pill,
    },

    retryText: {
      color: "#FFFFFF",
      ...typography.smallButton,
    },

    /* INFO */

    infoBox: {
      marginTop:
        spacing.xxl,
      padding: spacing.md,
      borderRadius:
        radius.lg,
      borderWidth: 1,
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    infoIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight:
        spacing.md,
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

    /* ==========================================
       UNBLOCK MODAL
       ========================================== */

    modalOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },

    modalCard: {
      width: "100%",
      maxWidth: 430,
      borderRadius: 24,
      borderWidth: 1,
      padding: spacing.xl,
      alignItems: "center",
    },

    modalIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },

    modalEmoji: {
      fontSize: 28,
    },

    modalTitle: {
      ...typography.h3,
      textAlign: "center",
      marginBottom: spacing.sm,
    },

    modalDescription: {
      ...typography.caption,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 320,
    },

    modalActions: {
      width: "100%",
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.xl,
    },

    cancelButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButtonText: {
      ...typography.smallButton,
    },

    confirmButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },

    confirmButtonText: {
      color: "#FFFFFF",
      ...typography.smallButton,
    },
  });