import { useEffect, useRef, useState } from "react";

import {
  startCall,
  endCall,
  type Call,
} from "../services/call.service";

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

import {
  router,
  useLocalSearchParams,
} from "expo-router";

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

import {
  connectSocket,
  getSocket,
} from "../services/socket.service";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300";

/* =========================================================
   HELPERS
========================================================= */

const formatMessageTime = (
  dateString: string
) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getActiveText = (
  lastActiveAt: string | null
) => {
  if (!lastActiveAt) {
    return "Active recently";
  }

  const lastActive = new Date(
    lastActiveAt
  ).getTime();

  if (Number.isNaN(lastActive)) {
    return "Active recently";
  }

  const difference =
    Date.now() - lastActive;

  const oneMinute = 60 * 1000;
  const fiveMinutes = 5 * oneMinute;
  const oneHour = 60 * oneMinute;

  if (difference <= fiveMinutes) {
    return "Active now";
  }

  if (difference < oneHour) {
    const minutes = Math.max(
      1,
      Math.floor(
        difference / oneMinute
      )
    );

    return `Active ${minutes}m ago`;
  }

  const hours = Math.floor(
    difference / oneHour
  );

  if (hours < 24) {
    return `Active ${hours}h ago`;
  }

  return "Active recently";
};

/* =========================================================
   CHAT SCREEN
========================================================= */

export default function ChatScreen() {
  const { theme, isDark } =
    useTheme();

  const { userId, name } =
    useLocalSearchParams<{
      userId?: string;
      name?: string;
    }>();

  const scrollViewRef =
    useRef<ScrollView>(null);

  /* =======================================================
     CHAT STATE
  ======================================================= */

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [profile, setProfile] =
    useState<ChatUser | null>(null);

  /* =======================================================
     MORE MENU
  ======================================================= */

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [showSearch, setShowSearch] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<ChatMessage[]>([]);

  const [searching, setSearching] =
    useState(false);

  /* =======================================================
     BLOCK
  ======================================================= */

  const [isBlocked, setIsBlocked] =
    useState(false);

  const [blockedByOther, setBlockedByOther] =
    useState(false);

  const [blockLoading, setBlockLoading] =
    useState(false);

  const [showBlockConfirm, setShowBlockConfirm] =
    useState(false);

  /* =======================================================
     VOICE CALL
  ======================================================= */

  const [outgoingCall, setOutgoingCall] =
    useState<Call | null>(null);

  const [startingCall, setStartingCall] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isSpeakerOn, setIsSpeakerOn] =
    useState(false);

  const [callSeconds, setCallSeconds] =
    useState(0);

  /* =======================================================
     PROFILE DISPLAY
  ======================================================= */

  const profileName =
    profile?.name ||
    (typeof name === "string" &&
    name.trim()
      ? name
      : "Your Match");

  const profileImage =
    profile?.primaryPhoto ||
    profile?.photos?.[0] ||
    DEFAULT_AVATAR;

  const profileAge =
    profile?.age ?? null;

  const isVerified =
    profile?.isVerified || false;

  const activeText =
    getActiveText(
      profile?.lastActiveAt || null
    );

  const isActiveNow =
    activeText === "Active now";

  /* =======================================================
     LOAD CONVERSATION
  ======================================================= */

  useEffect(() => {
    const loadConversation =
      async () => {
        if (!userId) {
          setError(
            "Matched user could not be found."
          );

          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await getConversation(
              userId
            );

          setProfile(
            response.data.otherUser
          );

          setMessages(
            response.data.messages
          );

          try {
            await markMessagesAsRead(
              userId
            );
          } catch (
            readError
          ) {
            console.log(
              "Unable to mark messages as read:",
              readError
            );
          }
        } catch (err) {
          console.error(
            "Load conversation error:",
            err
          );

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

  /* =======================================================
     LOAD BLOCK STATUS
  ======================================================= */

  useEffect(() => {
    const loadBlockStatus =
      async () => {
        if (!userId) {
          return;
        }

        try {
          const response =
            await getBlockStatus(
              userId
            );

          setIsBlocked(
            response.data.isBlocked
          );

          setBlockedByOther(
            response.data.blockedByOther
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

  /* =======================================================
     VOICE CALL SOCKET EVENTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;
    let socket: ReturnType<typeof getSocket> = null;

    const handleCallAccepted = ({
      call,
    }: {
      call: Call;
    }) => {
      if (!mounted) {
        return;
      }

      console.log("CALL ACCEPTED:", call);

      setOutgoingCall((currentCall) => {
        if (
          !currentCall ||
          currentCall._id !== call._id
        ) {
          return currentCall;
        }

        return call;
      });
    };

    const handleCallRejected = ({
      call,
    }: {
      call: Call;
    }) => {
      if (!mounted) {
        return;
      }

      console.log("CALL REJECTED:", call);

      setOutgoingCall((currentCall) => {
        if (
          !currentCall ||
          currentCall._id !== call._id
        ) {
          return currentCall;
        }

        return null;
      });

      setStartingCall(false);

      Alert.alert(
        "Call declined",
        `${profileName} declined your call.`
      );
    };

    const handleCallEnded = ({
      call,
    }: {
      call: Call;
    }) => {
      if (!mounted) {
        return;
      }

      console.log("CALL ENDED:", call);

      setOutgoingCall((currentCall) => {
        if (
          !currentCall ||
          currentCall._id !== call._id
        ) {
          return currentCall;
        }

        return null;
      });

      setStartingCall(false);
    };

    const setupCallSocket = async () => {
      try {
        await connectSocket();

        if (!mounted) {
          return;
        }

        socket = getSocket();

        if (!socket) {
          console.log(
            "Call socket is not available"
          );
          return;
        }

        socket.on(
          "call_accepted",
          handleCallAccepted
        );

        socket.on(
          "call_rejected",
          handleCallRejected
        );

        socket.on(
          "call_ended",
          handleCallEnded
        );
      } catch (socketError) {
        console.error(
          "Call socket setup error:",
          socketError
        );
      }
    };

    setupCallSocket();

    return () => {
      mounted = false;

      if (!socket) {
        return;
      }

      socket.off(
        "call_accepted",
        handleCallAccepted
      );

      socket.off(
        "call_rejected",
        handleCallRejected
      );

      socket.off(
        "call_ended",
        handleCallEnded
      );
    };
  }, [profileName]);

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = async () => {
    const cleanText =
      text.trim();

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

      const response =
        await sendChatMessage(
          userId,
          cleanText
        );

      setMessages(
        (current) => [
          ...current,
          response.data.message,
        ]
      );

      setText("");

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd(
          {
            animated: true,
          }
        );
      }, 50);
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

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

  /* =======================================================
     OPEN PROFILE
  ======================================================= */

  const openProfile = () => {
    if (
      !profile?.id ||
      !profile?.profileId
    ) {
      return;
    }

    router.push({
      pathname:
        "/profile-detail",
      params: {
        id: profile.profileId,
        name: profile.name,
      },
    });
  };

  /* =======================================================
     MORE OPTIONS
  ======================================================= */

  const handleMoreOptions = () => {
    setShowMoreMenu(true);
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = () => {
    setShowMoreMenu(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(true);
  };

  const performSearch = async (
    query: string
  ) => {
    setSearchQuery(query);

    if (
      !query.trim() ||
      !userId
    ) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const response =
        await searchMessages(
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

  /* =======================================================
     CALL TIMER
  ======================================================= */

  useEffect(() => {
    if (!outgoingCall) {
      setCallSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds(
        (seconds) => seconds + 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [outgoingCall]);

  const formatCallDuration = (
    seconds: number
  ) => {
    const minutes = Math.floor(
      seconds / 60
    )
      .toString()
      .padStart(2, "0");

    const remainingSeconds = (
      seconds % 60
    )
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  /* =======================================================
     VOICE CALL
  ======================================================= */

  const handleVoiceCall =
    async () => {
      setShowMoreMenu(false);

      if (
        !userId ||
        startingCall ||
        outgoingCall ||
        isBlocked ||
        blockedByOther
      ) {
        return;
      }

      try {
        setStartingCall(true);

        const call =
          await startCall(
            userId
          );

        console.log(
          "Voice call created:",
          call
        );

        setOutgoingCall(call);
      } catch (error) {
        console.error(
          "Start voice call error:",
          error
        );

        Alert.alert(
          "Unable to call",
          error instanceof Error
            ? error.message
            : "Something went wrong while starting the call."
        );
      } finally {
        setStartingCall(false);
      }
    };

  /* =======================================================
     CANCEL OUTGOING CALL
  ======================================================= */

  const handleCancelCall =
    async () => {
      if (!outgoingCall) {
        return;
      }

      const callId =
        outgoingCall._id;

      try {
        await endCall(
          callId
        );

        console.log(
          "Voice call cancelled:",
          callId
        );

        setOutgoingCall(null);
        setStartingCall(false);
      } catch (error) {
        console.error(
          "Cancel call error:",
          error
        );

        Alert.alert(
          "Unable to cancel call",
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      }
    };

  /* =======================================================
     END VOICE CALL
  ======================================================= */

  const handleEndCall = async () => {
    if (!outgoingCall) {
      return;
    }

    const currentCallId =
      outgoingCall._id;

    setOutgoingCall(null);
    setCallSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(false);

    try {
      await endCall(currentCallId);

      console.log(
        "Voice call ended:",
        currentCallId
      );
    } catch (error) {
      console.error(
        "End call error:",
        error
      );
    }
  };

  const toggleMute = () => {
    setIsMuted(
      (current) => !current
    );
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(
      (current) => !current
    );
  };

  /* =======================================================
     VIDEO CALL
  ======================================================= */

  const handleVideoCall = () => {
    setShowMoreMenu(false);

    Alert.alert(
      "Video call",
      `Video calling with ${profileName} will be connected here.`
    );
  };

  /* =======================================================
     BLOCK / UNBLOCK
  ======================================================= */

  const handleBlockUser = () => {
    setShowMoreMenu(false);

    if (
      !userId ||
      blockLoading
    ) {
      return;
    }

    setShowBlockConfirm(true);
  };

  const confirmBlockAction =
    async () => {
      if (
        !userId ||
        blockLoading
      ) {
        return;
      }

      const currentlyBlocked =
        isBlocked;

      try {
        setBlockLoading(true);

        if (currentlyBlocked) {
          await unblockUser(
            userId
          );

          setIsBlocked(false);
          setText("");
        } else {
          await blockUser(
            userId
          );

          setIsBlocked(true);
          setText("");
        }

        setShowBlockConfirm(
          false
        );
      } catch (err) {
        console.error(
          currentlyBlocked
            ? "Unblock user error:"
            : "Block user error:",
          err
        );

        Alert.alert(
          currentlyBlocked
            ? "Unable to unblock"
            : "Unable to block",
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setBlockLoading(false);
      }
    };

  /* =======================================================
     REPORT
  ======================================================= */

  const handleReportUser = () => {
    setShowMoreMenu(false);

    router.push({
      pathname:
        "/report-user",
      params: {
        userId:
          profile?.id ||
          userId ||
          "",
      },
    });
  };

  /* =======================================================
     CLEAR CHAT
  ======================================================= */

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

  /* =======================================================
     LOADING
  ======================================================= */

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
          Loading your conversation...
        </Text>
      </View>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <Text
          style={
            styles.errorEmoji
          }
        >
          🫧
        </Text>

        <Text
          style={[
            styles.errorTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Something went wrong
        </Text>

        <Text
          style={[
            styles.errorText,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          {error}
        </Text>

        <Pressable
          style={[
            styles.errorButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.errorButtonText
            }
          >
            Go back
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
            backgroundColor:
              theme.background,
          },
        ]}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        {showSearch ? (
          <View
            style={[
              styles.searchHeader,
              {
                backgroundColor:
                  theme.surface,
                borderBottomColor:
                  theme.border,
              },
            ]}
          >
            <Pressable
              style={
                styles.searchBack
              }
              onPress={
                closeSearch
              }
            >
              <Text
                style={[
                  styles.searchBackText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                ‹
              </Text>
            </Pressable>

            <TextInput
              value={
                searchQuery
              }
              onChangeText={
                performSearch
              }
              placeholder="Search messages..."
              placeholderTextColor={
                theme.textMuted
              }
              autoFocus
              style={[
                styles.searchInput,
                {
                  backgroundColor:
                    theme.background,
                  color:
                    theme.text,
                  borderColor:
                    theme.border,
                },
              ]}
            />

            {searchQuery.length >
              0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery(
                    ""
                  );
                  setSearchResults(
                    []
                  );
                }}
                style={
                  styles.searchClear
                }
              >
                <Text
                  style={[
                    styles.searchClearText,
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
        ) : (
          <View
            style={[
              styles.header,
              {
                backgroundColor:
                  theme.surface,
                borderBottomColor:
                  theme.border,
              },
            ]}
          >
            <Pressable
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Text
                style={[
                  styles.backText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                ‹
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.profileHeaderButton
              }
              onPress={
                openProfile
              }
            >
              <View
                style={
                  styles.avatarContainer
                }
              >
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={
                    styles.avatar
                  }
                />

                <View
                  style={[
                    styles.avatarOnline,
                    {
                      backgroundColor:
                        isActiveNow
                          ? "#22C55E"
                          : theme.textMuted,
                      borderColor:
                        theme.surface,
                    },
                  ]}
                />
              </View>

              <View
                style={
                  styles.headerInfo
                }
              >
                <View
                  style={
                    styles.headerNameRow
                  }
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.name,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    {profileName}
                    {profileAge !==
                    null
                      ? `, ${profileAge}`
                      : ""}
                  </Text>

                  {isVerified && (
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
                  style={
                    styles.onlineRow
                  }
                >
                  <Text
                    style={[
                      styles.onlineText,
                      {
                        color:
                          isActiveNow
                            ? "#22C55E"
                            : theme.textMuted,
                      },
                    ]}
                  >
                    {activeText}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.moreButton,
                {
                  backgroundColor:
                    isDark
                      ? "#211D29"
                      : "#F3EEFF",
                  opacity:
                    pressed ? 0.7 : 1,
                },
              ]}
              onPress={
                handleMoreOptions
              }
            >
              <Text
                style={[
                  styles.moreText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                •••
              </Text>
            </Pressable>
          </View>
        )}

        {/* =================================================
            SEARCH SUMMARY
        ================================================= */}

        {showSearch &&
          searchQuery.trim()
            .length > 0 && (
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
                    color:
                      theme.textMuted,
                  },
                ]}
              >
                {searching
                  ? "Searching..."
                  : `${searchResults.length} ${
                      searchResults.length ===
                      1
                        ? "message"
                        : "messages"
                    } found`}
              </Text>
            </View>
          )}

        {/* =================================================
            BLOCK STATUS
        ================================================= */}

        {!showSearch &&
          (isBlocked ||
            blockedByOther) && (
            <View
              style={[
                styles.blockedBanner,
                {
                  backgroundColor:
                    isDark
                      ? "#2A1D23"
                      : "#FFF1F3",
                  borderColor:
                    isDark
                      ? "#4A2932"
                      : "#FFD7DE",
                },
              ]}
            >
              <Text
                style={
                  styles.blockedBannerEmoji
                }
              >
                {isBlocked
                  ? "🚫"
                  : "🔒"}
              </Text>

              <View
                style={
                  styles.blockedBannerInfo
                }
              >
                <Text
                  style={[
                    styles.blockedBannerTitle,
                    {
                      color:
                        theme.danger,
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
                      color:
                        theme.textMuted,
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

        {/* =================================================
            MATCH BANNER
        ================================================= */}

        {!showSearch &&
          !isBlocked &&
          !blockedByOther && (
            <View
              style={[
                styles.matchBanner,
                {
                  backgroundColor:
                    isDark
                      ? "rgba(154, 122, 255, 0.12)"
                      : "rgba(109, 61, 245, 0.08)",
                  borderColor:
                    isDark
                      ? "rgba(154, 122, 255, 0.20)"
                      : "rgba(109, 61, 245, 0.12)",
                },
              ]}
            >
              <View
                style={[
                  styles.matchEmojiContainer,
                  {
                    backgroundColor:
                      isDark
                        ? "#302A3A"
                        : "#FFFFFF",
                  },
                ]}
              >
                <Text
                  style={
                    styles.matchEmoji
                  }
                >
                  💜
                </Text>
              </View>

              <View
                style={
                  styles.matchInfo
                }
              >
                <Text
                  style={[
                    styles.matchTitle,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  It's a match!
                </Text>

                <Text
                  style={[
                    styles.matchSubtitle,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  You and{" "}
                  {profileName}{" "}
                  liked each other.
                </Text>
              </View>

              <Text
                style={[
                  styles.matchSpark,
                  {
                    color:
                      theme.coral,
                  },
                ]}
              >
                ✦
              </Text>
            </View>
          )}

        {/* =================================================
            SEARCH RESULTS
        ================================================= */}

        {showSearch ? (
          <ScrollView
            style={
              styles.messages
            }
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
          >
            {searchQuery.trim()
              .length === 0 ? (
              <View
                style={
                  styles.searchEmpty
                }
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
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Search your
                  conversation
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
                  Type something
                  to find messages
                  with{" "}
                  {profileName}.
                </Text>
              </View>
            ) : searching ? (
              <View
                style={
                  styles.searchLoading
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    theme.primary
                  }
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
                  Searching
                  messages...
                </Text>
              </View>
            ) : searchResults.length ===
              0 ? (
              <View
                style={
                  styles.searchEmpty
                }
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
                      color:
                        theme.text,
                    },
                  ]}
                >
                  No messages
                  found
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
                  Try searching
                  for another
                  word or phrase.
                </Text>
              </View>
            ) : (
              searchResults.map(
                (message, index) => {
                  const messageKey =
                    String(
                      message.id ??
                        (message as any)
                          ._id ??
                        (message as any)
                          .message_id ??
                        `search-message-${index}`
                    );

                  return (
                    <View
                      key={
                        messageKey
                      }
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
                              color:
                                message.mine
                                  ? "#FFFFFF"
                                  : theme.text,
                            },
                          ]}
                        >
                          {
                            message.text
                          }
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
                  );
                }
              )
            )}
          </ScrollView>
        ) : (
          /* =================================================
             MESSAGES
          ================================================= */

          <ScrollView
            ref={
              scrollViewRef
            }
            style={
              styles.messages
            }
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd(
                {
                  animated: false,
                }
              )
            }
          >
            <Text
              style={[
                styles.date,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              TODAY
            </Text>

            {messages.length ===
            0 ? (
              <View
                style={
                  styles.emptyChat
                }
              >
                <Text
                  style={
                    styles.emptyChatEmoji
                  }
                >
                  💜
                </Text>

                <Text
                  style={[
                    styles.emptyChatTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Start the
                  conversation
                </Text>

                <Text
                  style={[
                    styles.emptyChatText,
                    {
                      color:
                        theme.textMuted,
                    },
                  ]}
                >
                  Say hello to{" "}
                  {profileName} ✨
                </Text>
              </View>
            ) : (
              messages.map(
                (message, index) => {
                  const messageKey =
                    String(
                      message.id ??
                        (message as any)
                          ._id ??
                        (message as any)
                          .message_id ??
                        `message-${index}`
                    );

                  return (
                    <View
                      key={
                        messageKey
                      }
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
                              color:
                                message.mine
                                  ? "#FFFFFF"
                                  : theme.text,
                            },
                          ]}
                        >
                          {
                            message.text
                          }
                        </Text>

                        <Text
                          style={[
                            styles.time,
                            {
                              color:
                                message.mine
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
                  );
                }
              )
            )}
          </ScrollView>
        )}

        {/* =================================================
            INPUT
        ================================================= */}

        {!showSearch &&
          !isBlocked &&
          !blockedByOther && (
            <View
              style={[
                styles.inputArea,
                {
                  backgroundColor:
                    theme.surface,
                  borderTopColor:
                    theme.border,
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  {
                    backgroundColor:
                      isDark
                        ? "#211D29"
                        : "#F3EEFF",
                    opacity:
                      pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.addButtonText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  +
                </Text>
              </Pressable>

              <TextInput
                value={text}
                onChangeText={
                  setText
                }
                placeholder="Type a message..."
                placeholderTextColor={
                  theme.textMuted
                }
                multiline
                style={[
                  styles.messageInput,
                  {
                    backgroundColor:
                      theme.background,
                    color:
                      theme.text,
                    borderColor:
                      theme.border,
                  },
                ]}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    backgroundColor:
                      theme.primary,
                    opacity:
                      pressed ||
                      !text.trim() ||
                      sending
                        ? 0.55
                        : 1,
                  },
                ]}
                onPress={
                  sendMessage
                }
                disabled={
                  !text.trim() ||
                  sending
                }
              >
                {sending ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.sendButtonText
                    }
                  >
                    ↑
                  </Text>
                )}
              </Pressable>
            </View>
          )}
      </KeyboardAvoidingView>

      {/* =====================================================
          BLOCK CONFIRMATION MODAL
      ===================================================== */}

      <Modal
        visible={
          showBlockConfirm
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowBlockConfirm(
            false
          )
        }
      >
        <View
          style={
            styles.blockModalOverlay
          }
        >
          <View
            style={[
              styles.blockModal,
              {
                backgroundColor:
                  theme.surface,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <Text
              style={
                styles.blockModalEmoji
              }
            >
              {isBlocked
                ? "🔓"
                : "🚫"}
            </Text>

            <Text
              style={[
                styles.blockModalTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {isBlocked
                ? "Unblock user?"
                : "Block user?"}
            </Text>

            <Text
              style={[
                styles.blockModalText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              {isBlocked
                ? `You'll be able to message ${profileName} again.`
                : `You won't be able to message ${profileName}.`}
            </Text>

            <View
              style={
                styles.blockModalActions
              }
            >
              <Pressable
                style={[
                  styles.blockCancelButton,
                  {
                    borderColor:
                      theme.border,
                  },
                ]}
                onPress={() =>
                  setShowBlockConfirm(
                    false
                  )
                }
              >
                <Text
                  style={[
                    styles.blockCancelText,
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
                style={[
                  styles.blockConfirmButton,
                  {
                    backgroundColor:
                      isBlocked
                        ? theme.primary
                        : theme.danger,
                  },
                ]}
                onPress={
                  confirmBlockAction
                }
                disabled={
                  blockLoading
                }
              >
                {blockLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.blockConfirmText
                    }
                  >
                    {isBlocked
                      ? "Unblock"
                      : "Block"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          MORE OPTIONS MENU
      ===================================================== */}

      <Modal
        visible={
          showMoreMenu
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowMoreMenu(
            false
          )
        }
      >
        <Pressable
          style={
            styles.menuOverlay
          }
          onPress={() =>
            setShowMoreMenu(
              false
            )
          }
        >
          <Pressable
            style={[
              styles.moreMenu,
              {
                backgroundColor:
                  theme.surface,
                borderColor:
                  theme.border,
              },
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.menuHeader
              }
            >
              <View
                style={
                  styles.menuUserInfo
                }
              >
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={
                    styles.menuAvatar
                  }
                />

                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      {
                        color:
                          theme.text,
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
                  setShowMoreMenu(
                    false
                  )
                }
                style={
                  styles.menuClose
                }
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
              style={
                styles.menuItem
              }
              onPress={
                handleSearch
              }
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
                <Text
                  style={
                    styles.menuEmoji
                  }
                >
                  🔍
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Search in chat
              </Text>
            </Pressable>

            {/* VOICE CALL */}

            <Pressable
              style={[
                styles.menuItem,
                (startingCall ||
                  !!outgoingCall ||
                  isBlocked ||
                  blockedByOther) && {
                  opacity: 0.55,
                },
              ]}
              onPress={
                handleVoiceCall
              }
              disabled={
                startingCall ||
                !!outgoingCall ||
                isBlocked ||
                blockedByOther
              }
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
                <Text
                  style={
                    styles.menuEmoji
                  }
                >
                  📞
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {startingCall
                  ? "Calling..."
                  : outgoingCall
                    ? "Call in progress"
                    : "Voice call"}
              </Text>
            </Pressable>

            {/* VIDEO CALL */}

            <Pressable
              style={
                styles.menuItem
              }
              onPress={
                handleVideoCall
              }
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
                <Text
                  style={
                    styles.menuEmoji
                  }
                >
                  🎥
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color:
                      theme.text,
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
              style={
                styles.menuItem
              }
              onPress={
                handleBlockUser
              }
              disabled={
                blockLoading
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      isBlocked
                        ? isDark
                          ? "#2A2238"
                          : "#F3EEFF"
                        : isDark
                          ? "#3A252C"
                          : "#FFF0F3",
                  },
                ]}
              >
                <Text
                  style={
                    styles.menuEmoji
                  }
                >
                  {isBlocked
                    ? "🔓"
                    : "🚫"}
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color:
                      isBlocked
                        ? theme.primary
                        : theme.danger,
                  },
                ]}
              >
                {blockLoading
                  ? "Updating..."
                  : isBlocked
                    ? "Unblock user"
                    : "Block user"}
              </Text>
            </Pressable>

            {/* REPORT */}

            <Pressable
              style={
                styles.menuItem
              }
              onPress={
                handleReportUser
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      isDark
                        ? "#302A3A"
                        : "#FFF4E8",
                  },
                ]}
              >
                <Text
                  style={
                    styles.menuEmoji
                  }
                >
                  ⚠️
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Report user
              </Text>
            </Pressable>

            {/* CLEAR CHAT */}

            <Pressable
              style={
                styles.menuItem
              }
              onPress={
                handleClearChat
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      isDark
                        ? "#3A252C"
                        : "#FFF0F3",
                  },
                ]}
              >
                <Text
                  style={
                    styles.menuEmoji
                  }
                >
                  🗑
                </Text>
              </View>

              <Text
                style={[
                  styles.menuItemText,
                  {
                    color:
                      theme.danger,
                  },
                ]}
              >
                Clear chat
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          FULL SCREEN VOICE CALL
      ===================================================== */}

      <Modal
        visible={!!outgoingCall}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={handleEndCall}
      >
        <View style={styles.callScreen}>
          {/* TOP */}
          <View style={styles.callTop}>
            <Text style={styles.callTopTitle}>
              Vibe Call
            </Text>

            <Text style={styles.callEncryption}>
              🔒 End-to-end encrypted
            </Text>
          </View>

          {/* USER */}
          <View style={styles.callUserSection}>
            <View style={styles.callAvatarWrapper}>
              <Image
                source={{
                  uri: profileImage,
                }}
                style={styles.callAvatar}
              />

              <View style={styles.callAvatarRing} />
            </View>

            <Text
              style={styles.callUserName}
              numberOfLines={1}
            >
              {profileName}
            </Text>

            <Text style={styles.callStatus}>
              {outgoingCall?.status === "accepted"
                ? formatCallDuration(
                    callSeconds
                  )
                : "Calling..."}
            </Text>

            {outgoingCall?.status === "ringing" && (
              <View style={styles.callDots}>
                <View style={styles.callDot} />
                <View style={styles.callDot} />
                <View style={styles.callDot} />
              </View>
            )}
          </View>

          {/* BOTTOM CONTROLS */}
          <View style={styles.callBottom}>
            <View style={styles.callControls}>
              {/* MUTE */}
              <Pressable
                onPress={toggleMute}
                style={[
                  styles.callControl,
                  isMuted &&
                    styles.callControlActive,
                ]}
              >
                <Text
                  style={styles.callControlIcon}
                >
                  {isMuted ? "🔇" : "🎙️"}
                </Text>

                <Text
                  style={styles.callControlLabel}
                >
                  {isMuted
                    ? "Unmute"
                    : "Mute"}
                </Text>
              </Pressable>

              {/* SPEAKER */}
              <Pressable
                onPress={toggleSpeaker}
                style={[
                  styles.callControl,
                  isSpeakerOn &&
                    styles.callControlActive,
                ]}
              >
                <Text
                  style={styles.callControlIcon}
                >
                  🔊
                </Text>

                <Text
                  style={styles.callControlLabel}
                >
                  Speaker
                </Text>
              </Pressable>

              {/* MORE */}
              <Pressable
                style={styles.callControl}
                onPress={() => {
                  Alert.alert(
                    "Coming soon",
                    "More call options will be available soon."
                  );
                }}
              >
                <Text
                  style={styles.callControlIcon}
                >
                  ⋯
                </Text>

                <Text
                  style={styles.callControlLabel}
                >
                  More
                </Text>
              </Pressable>
            </View>

            {/* END */}
            <Pressable
              onPress={handleEndCall}
              style={styles.endCallButton}
            >
              <Text style={styles.endCallIcon}>
                ☎
              </Text>
            </Pressable>

            <Text style={styles.endCallText}>
              End call
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    /* =====================================================
       LOADING
    ===================================================== */

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

    /* =====================================================
       ERROR
    ===================================================== */

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

    /* =====================================================
       HEADER
    ===================================================== */

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
      marginTop: 3,
    },

    onlineText: {
      fontSize: 10,
    },

    moreButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
    },

    moreText: {
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: 2,
      marginTop: -5,
    },

    /* =====================================================
       SEARCH HEADER
    ===================================================== */

    searchHeader: {
      height: 82,
      paddingTop: 25,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
    },

    searchBack: {
      width: 40,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
    },

    searchBackText: {
      fontSize: 34,
      lineHeight: 38,
    },

    searchInput: {
      flex: 1,
      height: 42,
      borderWidth: 1,
      borderRadius: 21,
      paddingHorizontal: 16,
      fontSize: 13,
    },

    searchClear: {
      width: 40,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -40,
    },

    searchClearText: {
      fontSize: 24,
      fontWeight: "300",
    },

    searchSummary: {
      minHeight: 38,
      paddingHorizontal: 16,
      justifyContent: "center",
      borderBottomWidth: 1,
    },

    searchSummaryText: {
      fontSize: 11,
      fontWeight: "700",
    },

    /* =====================================================
       BLOCKED
    ===================================================== */

    blockedBanner: {
      marginHorizontal: 14,
      marginTop: 10,
      borderRadius: 17,
      borderWidth: 1,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    blockedBannerEmoji: {
      fontSize: 21,
      marginRight: 10,
    },

    blockedBannerInfo: {
      flex: 1,
    },

    blockedBannerTitle: {
      fontSize: 12,
      fontWeight: "800",
    },

    blockedBannerText: {
      fontSize: 10,
      lineHeight: 16,
      marginTop: 3,
    },

    /* =====================================================
       MATCH BANNER
    ===================================================== */

    matchBanner: {
      marginHorizontal: 16,
      marginTop: 12,
      minHeight: 76,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    matchEmojiContainer: {
      width: 48,
      height: 48,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },

    matchEmoji: {
      fontSize: 24,
    },

    matchInfo: {
      flex: 1,
      marginLeft: 11,
    },

    matchTitle: {
      fontSize: 14,
      fontWeight: "900",
    },

    matchSubtitle: {
      fontSize: 10,
      marginTop: 3,
    },

    matchSpark: {
      fontSize: 20,
      marginLeft: 8,
    },

    /* =====================================================
       MESSAGES
    ===================================================== */

    messages: {
      flex: 1,
    },

    messagesContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },

    date: {
      textAlign: "center",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 16,
    },

    messageRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 9,
    },

    myMessageRow: {
      justifyContent: "flex-end",
    },

    bubble: {
      maxWidth: "78%",
      borderRadius: 18,
      paddingHorizontal: 13,
      paddingVertical: 9,
    },

    myBubble: {
      borderBottomRightRadius: 5,
    },

    otherBubble: {
      borderWidth: 1,
      borderBottomLeftRadius: 5,
    },

    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },

    time: {
      fontSize: 9,
      marginTop: 4,
      alignSelf: "flex-end",
    },

    emptyChat: {
      alignItems: "center",
      paddingTop: 80,
      paddingHorizontal: 35,
    },

    emptyChatEmoji: {
      fontSize: 38,
      marginBottom: 13,
    },

    emptyChatTitle: {
      fontSize: 17,
      fontWeight: "800",
      marginBottom: 5,
    },

    emptyChatText: {
      fontSize: 12,
      textAlign: "center",
    },

    /* =====================================================
       SEARCH
    ===================================================== */

    searchEmpty: {
      alignItems: "center",
      paddingTop: 90,
      paddingHorizontal: 35,
    },

    searchEmptyEmoji: {
      fontSize: 38,
      marginBottom: 14,
    },

    searchEmptyTitle: {
      fontSize: 17,
      fontWeight: "800",
      textAlign: "center",
    },

    searchEmptyText: {
      fontSize: 12,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 6,
    },

    searchLoading: {
      alignItems: "center",
      paddingTop: 90,
    },

    searchLoadingText: {
      marginTop: 12,
      fontSize: 12,
    },

    searchResultCard: {
      borderWidth: 1,
      borderRadius: 17,
      padding: 11,
      marginBottom: 10,
    },

    searchResultBubble: {
      borderRadius: 13,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    searchResultText: {
      fontSize: 13,
      lineHeight: 19,
    },

    searchResultMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 7,
      paddingHorizontal: 2,
    },

    searchResultSender: {
      fontSize: 10,
      fontWeight: "700",
    },

    searchResultTime: {
      fontSize: 10,
    },

    /* =====================================================
       INPUT
    ===================================================== */

    inputArea: {
      minHeight: 68,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
    },

    addButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    addButtonText: {
      fontSize: 25,
      fontWeight: "500",
      marginTop: -2,
    },

    messageInput: {
      flex: 1,
      minHeight: 44,
      maxHeight: 110,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 13,
    },

    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },

    sendButtonText: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "800",
    },

    /* =====================================================
       BLOCK MODAL
    ===================================================== */

    blockModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 25,
    },

    blockModal: {
      width: "100%",
      maxWidth: 390,
      borderRadius: 25,
      borderWidth: 1,
      padding: 22,
      alignItems: "center",
    },

    blockModalEmoji: {
      fontSize: 34,
      marginBottom: 10,
    },

    blockModalTitle: {
      fontSize: 19,
      fontWeight: "900",
    },

    blockModalText: {
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 8,
    },

    blockModalActions: {
      width: "100%",
      flexDirection: "row",
      gap: 10,
      marginTop: 22,
    },

    blockCancelButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    blockCancelText: {
      fontSize: 13,
      fontWeight: "800",
    },

    blockConfirmButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    blockConfirmText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },

    /* =====================================================
       VOICE CALL SCREEN
    ===================================================== */

    callScreen: {
      flex: 1,
      backgroundColor: "#071217",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 70,
      paddingBottom: 45,
    },

    callTop: {
      alignItems: "center",
    },

    callTopTitle: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.3,
    },

    callEncryption: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 12,
      marginTop: 6,
    },

    callUserSection: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    callAvatarWrapper: {
      width: 190,
      height: 190,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    callAvatar: {
      width: 155,
      height: 155,
      borderRadius: 78,
    },

    callAvatarRing: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.12)",
    },

    callUserName: {
      maxWidth: "85%",
      color: "#FFFFFF",
      fontSize: 27,
      fontWeight: "800",
      marginTop: 28,
    },

    callStatus: {
      color: "rgba(255,255,255,0.65)",
      fontSize: 15,
      marginTop: 8,
    },

    callDots: {
      flexDirection: "row",
      gap: 5,
      marginTop: 12,
    },

    callDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        "rgba(255,255,255,0.55)",
    },

    callBottom: {
      width: "100%",
      alignItems: "center",
    },

    callControls: {
      width: "90%",
      maxWidth: 420,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: 28,
    },

    callControl: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        "rgba(255,255,255,0.10)",
      alignItems: "center",
      justifyContent: "center",
    },

    callControlActive: {
      backgroundColor:
        "rgba(255,255,255,0.22)",
    },

    callControlIcon: {
      fontSize: 25,
    },

    callControlLabel: {
      color: "#FFFFFF",
      fontSize: 11,
      marginTop: 5,
      opacity: 0.8,
    },

    endCallButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: "#FF1744",
      alignItems: "center",
      justifyContent: "center",
    },

    endCallIcon: {
      color: "#FFFFFF",
      fontSize: 29,
      transform: [
        {
          rotate: "135deg",
        },
      ],
    },

    endCallText: {
      color: "#FFFFFF",
      fontSize: 12,
      marginTop: 7,
      opacity: 0.75,
    },

    /* =====================================================
       MORE MENU
    ===================================================== */

    menuOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor:
        "rgba(0,0,0,0.35)",
    },

    moreMenu: {
      width: "100%",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 28,
    },

    menuHeader: {
      minHeight: 62,
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
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 11,
    },

    menuTitle: {
      fontSize: 14,
      fontWeight: "800",
    },

    menuSubtitle: {
      fontSize: 10,
      marginTop: 2,
    },

    menuClose: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },

    menuCloseText: {
      fontSize: 27,
      fontWeight: "300",
    },

    menuItem: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
    },

    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    menuEmoji: {
      fontSize: 19,
    },

    menuItemText: {
      fontSize: 14,
      fontWeight: "700",
    },

    menuDivider: {
      height: 1,
      marginVertical: 6,
    },
  });