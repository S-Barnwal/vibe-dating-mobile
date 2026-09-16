import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import {
  getConversation,
  markMessagesAsRead,
  searchMessages,
  sendMessage as sendChatMessage,
  type ChatMessage,
  type ChatUser,
} from "../services/chat.service";

import {
  blockUser,
  getBlockStatus,
  unblockUser,
} from "../services/block.service";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300";

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getActiveText = (lastActiveAt: string | null) => {
  if (!lastActiveAt) {
    return "Active recently";
  }

  const lastActive = new Date(lastActiveAt).getTime();

  if (Number.isNaN(lastActive)) {
    return "Active recently";
  }

  const difference = Date.now() - lastActive;

  const oneMinute = 60 * 1000;
  const fiveMinutes = 5 * oneMinute;
  const oneHour = 60 * oneMinute;

  if (difference <= fiveMinutes) {
    return "Active now";
  }

  if (difference < oneHour) {
    const minutes = Math.max(
      1,
      Math.floor(difference / oneMinute)
    );

    return `Active ${minutes}m ago`;
  }

  const hours = Math.floor(difference / oneHour);

  if (hours < 24) {
    return `Active ${hours}h ago`;
  }

  return "Active recently";
};

export default function ChatScreen() {
  const { theme, isDark } = useTheme();

  const { userId, name } =
    useLocalSearchParams<{
      userId?: string;
      name?: string;
    }>();

  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ChatUser | null>(null);

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  // Search
  const [showSearch, setShowSearch] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<ChatMessage[]>([]);

  const [searching, setSearching] = useState(false);

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByOther, setBlockedByOther] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);



  const profileName =
    profile?.name ||
    (typeof name === "string" && name.trim()
      ? name
      : "Your Match");

  const profileImage =
    profile?.primaryPhoto ||
    profile?.photos?.[0] ||
    DEFAULT_AVATAR;

  const profileAge = profile?.age ?? null;

  const profileVerified =
    profile?.isVerified ?? false;

  const activeText = getActiveText(
    profile?.lastActiveAt || null
  );

  const isActiveNow = activeText === "Active now";

  /*
   * ================================
   * LOAD CONVERSATION
   * ================================
   */

  useEffect(() => {
    const loadConversation = async () => {
      if (!userId) {
        setError("Matched user could not be found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getConversation(userId);

        setProfile(response.data.otherUser);
        setMessages(response.data.messages);

        try {
          await markMessagesAsRead(userId);
        } catch (readError) {
          console.log(
            "Unable to mark messages as read:",
            readError
          );
        }
      } catch (err) {
        console.error("Load conversation error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load conversation."
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [userId]);


  useEffect(() => {
  const loadBlockStatus = async () => {
    if (!userId) {
      return;
    }

    try {
      const blockStatus = await getBlockStatus(userId);

      setIsBlocked(blockStatus.data.isBlocked);
      setBlockedByOther(
        blockStatus.data.blockedByOther
      );
    } catch (blockError) {
      console.log(
        "Unable to load block status:",
        blockError
      );
    }
  };

  loadBlockStatus();
}, [userId]);

  /*
   * ================================
   * AUTO SCROLL
   * ================================
   */

  useEffect(() => {
    if (showSearch) {
      return;
    }

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, showSearch]);

  /*
   * ================================
   * SEND MESSAGE
   * ================================
   */

  const sendMessage = async () => {
    const cleanText = text.trim();

    if (
      !cleanText ||
      !userId ||
      sending ||
      isBlocked ||
      blockedByOther
    ) {
      return;
    }

    try {
      setSending(true);

      const response = await sendChatMessage(
        userId,
        cleanText
      );

      setMessages((current) => [
        ...current,
        response.data.message,
      ]);

      setText("");
    } catch (err) {
      console.error("Send message error:", err);

      Alert.alert(
        "Message not sent",
        err instanceof Error
          ? err.message
          : "Unable to send your message."
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * ================================
   * OPEN MATCH PROFILE
   * ================================
   */

  const openProfile = () => {
    if (!profile?.id || !profile?.profileId) {
      return;
    }

    router.push({
      pathname: "/profile-detail",
      params: {
        id: profile.profileId,
        name: profile.name,
      },
    });
  };

  /*
   * ================================
   * MORE OPTIONS
   * ================================
   */

  const handleMoreOptions = () => {
    setShowMoreMenu(true);
  };

  /*
   * ================================
   * SEARCH
   * ================================
   */

  const handleSearch = () => {
    setShowMoreMenu(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(true);
  };

  const performSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim() || !userId) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const response = await searchMessages(
        userId,
        query
      );

      setSearchResults(
        response.data.messages
      );
    } catch (err) {
      console.error(
        "Search messages error:",
        err
      );

      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearching(false);
  };

  /*
   * ================================
   * MENU ACTIONS
   * ================================
   */

  const handleVoiceCall = () => {
    setShowMoreMenu(false);

    Alert.alert(
      "Voice call",
      `Voice calling with ${profileName} will be connected here.`
    );
  };

  const handleVideoCall = () => {
    setShowMoreMenu(false);

    Alert.alert(
      "Video call",
      `Video calling with ${profileName} will be connected here.`
    );
  };

  const handleBlockUser = () => {
    setShowMoreMenu(false);

    if (!userId || blockLoading || blockedByOther) {
      return;
    }

    if (isBlocked) {
      Alert.alert(
        `Unblock ${profileName}?`,
        `You will be able to interact with ${profileName} again.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Unblock",
            onPress: async () => {
              try {
                setBlockLoading(true);

                await unblockUser(userId);

                setIsBlocked(false);
                setBlockedByOther(false);

                Alert.alert(
                  "User unblocked",
                  `${profileName} has been unblocked.`
                );
              } catch (err) {
                console.error(
                  "Unblock user error:",
                  err
                );

                Alert.alert(
                  "Unable to unblock",
                  err instanceof Error
                    ? err.message
                    : "Something went wrong."
                );
              } finally {
                setBlockLoading(false);
              }
            },
          },
        ]
      );

      return;
    }

    Alert.alert(
      `Block ${profileName}?`,
      `${profileName} won't be able to message you or interact with your profile.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              setBlockLoading(true);

              await blockUser(userId);

              setIsBlocked(true);
              setBlockedByOther(false);
              setText("");

              Alert.alert(
                "User blocked",
                `${profileName} has been blocked. You can unblock them anytime from the chat options.`
              );
            } catch (err) {
              console.error(
                "Block user error:",
                err
              );

              Alert.alert(
                "Unable to block",
                err instanceof Error
                  ? err.message
                  : "Something went wrong."
              );
            } finally {
              setBlockLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReportUser = () => {
    setShowMoreMenu(false);

    router.push({
      pathname: "/report-user",
      params: {
        userId: profile?.id || "",
      },
    });
  };

  const handleClearChat = () => {
    setShowMoreMenu(false);

    Alert.alert(
      "Clear chat?",
      "This will clear the messages currently shown in this chat.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setMessages([]);
          },
        },
      ]
    );
  };

  /*
   * ================================
   * LOADING
   * ================================
   */

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: theme.background,
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
              color: theme.textMuted,
            },
          ]}
        >
          Loading your conversation...
        </Text>
      </View>
    );
  }

  /*
   * ================================
   * ERROR
   * ================================
   */

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <Text style={styles.errorEmoji}>💬</Text>

        <Text
          style={[
            styles.errorTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Chat unavailable
        </Text>

        <Text
          style={[
            styles.errorText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {error}
        </Text>

        <Pressable
          style={[
            styles.errorButton,
            {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={() =>
            router.replace("/matches")
          }
        >
          <Text style={styles.errorButtonText}>
            Back to Matches
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
          },
        ]}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* ================= HEADER ================= */}

        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          {showSearch ? (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor: isDark
                      ? "#211D29"
                      : "#F8F5FF",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={closeSearch}
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

              <View
                style={[
                  styles.searchInputWrapper,
                  {
                    backgroundColor:
                      theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.searchIcon,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  🔍
                </Text>

                <TextInput
                  autoFocus
                  value={searchQuery}
                  onChangeText={performSearch}
                  placeholder="Search messages..."
                  placeholderTextColor={
                    theme.textMuted
                  }
                  style={[
                    styles.searchInput,
                    {
                      color: theme.text,
                    },
                  ]}
                  returnKeyType="search"
                  autoCorrect={false}
                />

                {searching && (
                  <ActivityIndicator
                    size="small"
                    color={theme.primary}
                  />
                )}

                {!searching &&
                  searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <Text
                        style={[
                          styles.searchClear,
                          {
                            color:
                              theme.textMuted,
                          },
                        ]}
                      >
                        ×
                      </Text>
                    </Pressable>
                  )}
              </View>
            </>
          ) : (
            <>
              {/* BACK */}

              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor: isDark
                      ? "#211D29"
                      : "#F8F5FF",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() =>
                  router.replace("/matches")
                }
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

              {/* PROFILE HEADER */}

              <Pressable
                style={({ pressed }) => [
                  styles.profileHeaderButton,
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={openProfile}
              >
                <View
                  style={styles.avatarContainer}
                >
                  <Image
                    source={{
                      uri: profileImage,
                    }}
                    style={styles.avatar}
                  />

                  {isActiveNow && (
                    <View
                      style={[
                        styles.avatarOnline,
                        {
                          backgroundColor:
                            theme.success,
                          borderColor:
                            theme.surface,
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.headerInfo}>
                  <View
                    style={styles.headerNameRow}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.name,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {profileName}

                      {profileAge !== null
                        ? `, ${profileAge}`
                        : ""}
                    </Text>

                    {profileVerified && (
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
                          style={
                            styles.verifiedText
                          }
                        >
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={styles.onlineRow}
                  >
                    {isActiveNow && (
                      <View
                        style={[
                          styles.onlineDot,
                          {
                            backgroundColor:
                              theme.success,
                          },
                        ]}
                      />
                    )}

                    <Text
                      style={[
                        styles.onlineText,
                        {
                          color:
                            theme.textMuted,
                        },
                      ]}
                    >
                      {activeText}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* MORE */}

              <Pressable
                style={({ pressed }) => [
                  styles.moreButton,
                  {
                    backgroundColor: isDark
                      ? "#211D29"
                      : "#F8F5FF",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={handleMoreOptions}
              >
                <Text
                  style={[
                    styles.moreText,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  •••
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* SEARCH RESULT COUNT */}

        {showSearch &&
          searchQuery.trim().length > 0 && (
            <View
              style={[
                styles.searchSummary,
                {
                  backgroundColor:
                    theme.surface,
                  borderBottomColor:
                    theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.searchSummaryText,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                {searching
                  ? "Searching..."
                  : `${searchResults.length} ${searchResults.length === 1
                    ? "message"
                    : "messages"
                  } found`}
              </Text>
            </View>
          )}

        {/* ================= BLOCK STATUS ================= */}

        {!showSearch &&
          (isBlocked || blockedByOther) && (
            <View
              style={[
                styles.blockedBanner,
                {
                  backgroundColor: isDark
                    ? "#2A1D23"
                    : "#FFF1F3",
                  borderColor: isDark
                    ? "#4A2932"
                    : "#FFD7DE",
                },
              ]}
            >
              <Text style={styles.blockedBannerEmoji}>
                {isBlocked ? "🚫" : "🔒"}
              </Text>

              <View style={styles.blockedBannerInfo}>
                <Text
                  style={[
                    styles.blockedBannerTitle,
                    {
                      color: theme.danger,
                    },
                  ]}
                >
                  {isBlocked
                    ? "You blocked this user"
                    : "You are blocked"}
                </Text>

                <Text
                  style={[
                    styles.blockedBannerText,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  {isBlocked
                    ? "Messages are disabled. You can unblock them from chat options."
                    : "You can't send messages to this person."}
                </Text>
              </View>
            </View>
          )}

        {/* ================= MATCH BANNER ================= */}

        {!showSearch && !isBlocked && !blockedByOther && (
          <View
            style={[
              styles.matchBanner,
              {
                backgroundColor: isDark
                  ? "rgba(154, 122, 255, 0.12)"
                  : "rgba(109, 61, 245, 0.08)",
                borderColor: isDark
                  ? "rgba(154, 122, 255, 0.20)"
                  : "rgba(109, 61, 245, 0.12)",
              },
            ]}
          >
            <View
              style={[
                styles.matchEmojiContainer,
                {
                  backgroundColor: isDark
                    ? "#302A3A"
                    : "#FFFFFF",
                },
              ]}
            >
              <Text style={styles.matchEmoji}>
                💜
              </Text>
            </View>

            <View style={styles.matchInfo}>
              <Text
                style={[
                  styles.matchTitle,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                It's a match!
              </Text>

              <Text
                style={[
                  styles.matchSubtitle,
                  {
                    color: theme.textMuted,
                  },
                ]}
              >
                You and {profileName} liked
                each other.
              </Text>
            </View>

            <Text
              style={[
                styles.matchSpark,
                {
                  color: theme.coral,
                },
              ]}
            >
              ✦
            </Text>
          </View>
        )}

        {/* ================= SEARCH RESULTS ================= */}

        {showSearch ? (
          <ScrollView
            style={styles.messages}
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {searchQuery.trim().length === 0 ? (
              <View
                style={styles.searchEmpty}
              >
                <Text
                  style={
                    styles.searchEmptyEmoji
                  }
                >
                  🔍
                </Text>

                <Text
                  style={[
                    styles.searchEmptyTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Search your conversation
                </Text>

                <Text
                  style={[
                    styles.searchEmptyText,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  Type something to find
                  messages with {profileName}.
                </Text>
              </View>
            ) : searching ? (
              <View
                style={styles.searchLoading}
              >
                <ActivityIndicator
                  size="large"
                  color={theme.primary}
                />

                <Text
                  style={[
                    styles.searchLoadingText,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  Searching messages...
                </Text>
              </View>
            ) : searchResults.length ===
              0 ? (
              <View
                style={styles.searchEmpty}
              >
                <Text
                  style={
                    styles.searchEmptyEmoji
                  }
                >
                  💭
                </Text>

                <Text
                  style={[
                    styles.searchEmptyTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  No messages found
                </Text>

                <Text
                  style={[
                    styles.searchEmptyText,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  Try searching for another
                  word or phrase.
                </Text>
              </View>
            ) : (
              searchResults.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.searchResultCard,
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
                      styles.searchResultBubble,
                      {
                        backgroundColor:
                          message.mine
                            ? theme.primary
                            : isDark
                              ? "#211D29"
                              : "#F8F5FF",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.searchResultText,
                        {
                          color: message.mine
                            ? "#FFFFFF"
                            : theme.text,
                        },
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.searchResultMeta
                    }
                  >
                    <Text
                      style={[
                        styles.searchResultSender,
                        {
                          color:
                            theme.textMuted,
                        },
                      ]}
                    >
                      {message.mine
                        ? "You"
                        : profileName}
                    </Text>

                    <Text
                      style={[
                        styles.searchResultTime,
                        {
                          color:
                            theme.textMuted,
                        },
                      ]}
                    >
                      {formatMessageTime(
                        message.createdAt
                      )}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          /* ================= MESSAGES ================= */

          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={[
                styles.date,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              TODAY
            </Text>

            {messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text
                  style={styles.emptyChatEmoji}
                >
                  💜
                </Text>

                <Text
                  style={[
                    styles.emptyChatTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Start the conversation
                </Text>

                <Text
                  style={[
                    styles.emptyChatText,
                    {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  Say hello to {profileName} ✨
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.mine &&
                    styles.myMessageRow,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      message.mine
                        ? [
                          styles.myBubble,
                          {
                            backgroundColor:
                              theme.primary,
                          },
                        ]
                        : [
                          styles.otherBubble,
                          {
                            backgroundColor:
                              theme.surface,
                            borderColor:
                              theme.border,
                          },
                        ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        {
                          color: message.mine
                            ? "#FFFFFF"
                            : theme.text,
                        },
                      ]}
                    >
                      {message.text}
                    </Text>

                    <Text
                      style={[
                        styles.time,
                        {
                          color: message.mine
                            ? "#DDD4FF"
                            : theme.textMuted,
                        },
                      ]}
                    >
                      {formatMessageTime(
                        message.createdAt
                      )}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* ================= INPUT ================= */}

        {!showSearch &&
          !isBlocked &&
          !blockedByOther && (
          <View
            style={[
              styles.inputArea,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
              },
            ]}
          >
            {/* PLUS */}

            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: isDark
                    ? "#211D29"
                    : "#F3EEFF",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.addText,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                +
              </Text>
            </Pressable>

            {/* INPUT */}

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={
                theme.textMuted
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              multiline
              maxLength={1000}
              editable={!sending}
            />

            {/* SEND */}

            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor:
                    text.trim() && !sending
                      ? theme.primary
                      : isDark
                        ? "#302A3A"
                        : "#E6E1EA",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={sendMessage}
              disabled={
                !text.trim() || sending
              }
            >
              {sending ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={[
                    styles.sendText,
                    {
                      color: text.trim()
                        ? "#FFFFFF"
                        : theme.textMuted,
                    },
                  ]}
                >
                  ↑
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ================= MORE OPTIONS MENU ================= */}

      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowMoreMenu(false)
        }
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() =>
            setShowMoreMenu(false)
          }
        >
          <Pressable
            style={[
              styles.moreMenu,
              {
                backgroundColor:
                  theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            {/* MENU HEADER */}

            <View style={styles.menuHeader}>
              <View
                style={styles.menuUserInfo}
              >
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={styles.menuAvatar}
                />

                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {profileName}
                  </Text>

                  <Text
                    style={[
                      styles.menuSubtitle,
                      {
                        color:
                          theme.textMuted,
                      },
                    ]}
                  >
                    Chat options
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  setShowMoreMenu(false)
                }
                style={styles.menuClose}
              >
                <Text
                  style={[
                    styles.menuCloseText,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>

            {/* SEARCH */}

            <Pressable
              style={styles.menuItem}
              onPress={handleSearch}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      isDark
                        ? "#211D29"
                        : "#F3EEFF",
                  },
                ]}
              >
                <Text style={styles.menuEmoji}>
                  🔍
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Search in chat
              </Text>
            </Pressable>

            {/* VOICE CALL */}

            <Pressable
              style={styles.menuItem}
              onPress={handleVoiceCall}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      isDark
                        ? "#211D29"
                        : "#F3EEFF",
                  },
                ]}
              >
                <Text style={styles.menuEmoji}>
                  📞
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Voice call
              </Text>
            </Pressable>

            {/* VIDEO CALL */}

            <Pressable
              style={styles.menuItem}
              onPress={handleVideoCall}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      isDark
                        ? "#211D29"
                        : "#F3EEFF",
                  },
                ]}
              >
                <Text style={styles.menuEmoji}>
                  🎥
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Video call
              </Text>
            </Pressable>

            <View
              style={[
                styles.menuDivider,
                {
                  backgroundColor:
                    theme.border,
                },
              ]}
            />

            {/* BLOCK */}

            <Pressable
              style={[
                styles.menuItem,
                blockedByOther && styles.menuItemDisabled,
              ]}
              onPress={handleBlockUser}
              disabled={blockedByOther || blockLoading}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: isDark
                      ? "#3A252C"
                      : "#FFF0F3",
                  },
                ]}
              >
                <Text style={styles.menuEmoji}>
                  {isBlocked
                    ? "🔓"
                    : blockedByOther
                      ? "🔒"
                      : "🚫"}
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: theme.danger,
                  },
                ]}
              >
                {isBlocked
                  ? "Unblock user"
                  : blockedByOther
                    ? "You are blocked"
                    : blockLoading
                      ? "Updating..."
                      : "Block user"}
              </Text>
            </Pressable>

            {/* REPORT */}

            <Pressable
              style={styles.menuItem}
              onPress={handleReportUser}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: isDark
                      ? "#302A3A"
                      : "#FFF4E8",
                  },
                ]}
              >
                <Text style={styles.menuEmoji}>
                  ⚠️
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Report user
              </Text>
            </Pressable>

            {/* CLEAR CHAT */}

            <Pressable
              style={styles.menuItem}
              onPress={handleClearChat}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: isDark
                      ? "#3A252C"
                      : "#FFF0F3",
                  },
                ]}
              >
                <Text style={styles.menuEmoji}>
                  🗑
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color: theme.danger,
                  },
                ]}
              >
                Clear chat
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ================= LOADING ================= */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },

  /* ================= ERROR ================= */

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  errorButton: {
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
  },

  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  /* ================= HEADER ================= */

  header: {
    height: 82,
    paddingTop: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  backText: {
    fontSize: 34,
    lineHeight: 38,
  },

  profileHeaderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  avatarOnline: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    maxWidth: "85%",
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

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  onlineText: {
    fontSize: 11,
  },

  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  moreText: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2,
  },

  /* ================= SEARCH ================= */

  searchInputWrapper: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchIcon: {
    fontSize: 15,
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    paddingVertical: 0,
  },

  searchClear: {
    fontSize: 24,
    lineHeight: 26,
    paddingLeft: 7,
  },

  searchSummary: {
    minHeight: 38,
    paddingHorizontal: 17,
    justifyContent: "center",
    borderBottomWidth: 1,
  },

  searchSummaryText: {
    fontSize: 11,
    fontWeight: "600",
  },

  searchEmpty: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  searchEmptyEmoji: {
    fontSize: 42,
    marginBottom: 14,
  },

  searchEmptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  searchEmptyText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },

  searchLoading: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
  },

  searchLoadingText: {
    marginTop: 12,
    fontSize: 12,
  },

  searchResultCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 12,
    marginBottom: 10,
  },

  searchResultBubble: {
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },

  searchResultText: {
    fontSize: 14,
    lineHeight: 20,
  },

  searchResultMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },

  searchResultSender: {
    fontSize: 10,
    fontWeight: "700",
  },

  searchResultTime: {
    fontSize: 10,
  },

  /* ================= MORE MENU ================= */

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },

  moreMenu: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
  },

  menuHeader: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  menuUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 11,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  menuSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  menuClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  menuCloseText: {
    fontSize: 28,
    lineHeight: 30,
  },

  menuItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },

  menuItemDisabled: {
    opacity: 0.55,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  menuEmoji: {
    fontSize: 18,
  },

  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
  },

  menuDivider: {
    height: 1,
    marginVertical: 7,
  },

  /* ================= BLOCK STATUS ================= */

  blockedBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  blockedBannerEmoji: {
    fontSize: 23,
    marginRight: 11,
  },

  blockedBannerInfo: {
    flex: 1,
  },

  blockedBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  blockedBannerText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
  },

  /* ================= MATCH BANNER ================= */

  matchBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  matchEmojiContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  matchEmoji: {
    fontSize: 23,
  },

  matchInfo: {
    flex: 1,
  },

  matchTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  matchSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  matchSpark: {
    fontSize: 19,
    marginLeft: 8,
  },

  /* ================= MESSAGES ================= */

  messages: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 15,
  },

  date: {
    alignSelf: "center",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 18,
  },

  messageRow: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  myMessageRow: {
    alignItems: "flex-end",
  },

  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
  },

  otherBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },

  myBubble: {
    borderBottomRightRadius: 5,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  time: {
    marginTop: 4,
    fontSize: 9,
    alignSelf: "flex-end",
  },

  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },

  emptyChatEmoji: {
    fontSize: 38,
    marginBottom: 12,
  },

  emptyChatTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  emptyChatText: {
    marginTop: 5,
    fontSize: 12,
  },

  /* ================= INPUT ================= */

  inputArea: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },

  addText: {
    fontSize: 25,
    fontWeight: "400",
  },

  input: {
    flex: 1,
    maxHeight: 90,
    minHeight: 40,
    marginHorizontal: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 14,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },

  sendText: {
    fontSize: 23,
    fontWeight: "700",
  },
});