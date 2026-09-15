import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

const profiles = [
  {
    name: "Maya",
    age: 23,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300",
  },
  {
    name: "Ava",
    age: 24,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  },
  {
    name: "Sofia",
    age: 22,
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300",
  },
  {
    name: "Priya",
    age: 22,
    image:
      "https://t3.ftcdn.net/jpg/02/81/81/86/360_F_281818663_XXRCNuGktKeZsnknqWkKI0rR4JPWui3H.jpg",
  },
  {
    name: "Riya",
    age: 24,
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300",
  },
  {
    name: "Ananya",
    age: 25,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
  },
  {
    name: "Meera",
    age: 23,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
  },
  {
    name: "Ishita",
    age: 24,
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
  },
  {
    name: "Sara",
    age: 22,
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300",
  },
  {
    name: "Naina",
    age: 25,
    image:
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=300",
  },
];

const initialMessages = [
  {
    id: 1,
    text: "Hey! How's your day going? ✨",
    mine: false,
    time: "10:42 AM",
  },
  {
    id: 2,
    text: "Pretty good! Just got coffee ☕",
    mine: true,
    time: "10:44 AM",
  },
  {
    id: 3,
    text: "Okay, coffee person 😄 What's your go-to?",
    mine: false,
    time: "10:45 AM",
  },
];

export default function ChatScreen() {
  const { theme, isDark } = useTheme();

  const { name } = useLocalSearchParams<{
    name?: string;
  }>();

  const profile =
    profiles.find(
      (item) =>
        item.name.toLowerCase() ===
        (name ?? "").toLowerCase()
    ) || profiles[0];

  const [messages, setMessages] =
    useState(initialMessages);

  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        text: text.trim(),
        mine: true,
        time: "Now",
      },
    ]);

    setText("");
  };

  const handleMoreOptions = () => {
    Alert.alert(
      profile.name,
      "What would you like to do?",
      [
        {
          text: "Block User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              `Block ${profile.name}?`,
              `${profile.name} won't be able to message you or interact with your profile.`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Block",
                  style: "destructive",
                  onPress: () => {
                    Alert.alert(
                      "User blocked",
                      `${profile.name} has been blocked.`,
                      [
                        {
                          text: "OK",
                          onPress: () => router.back(),
                        },
                      ]
                    );
                  },
                },
              ]
            );
          },
        },
        {
          text: "Report User",
          onPress: () =>
            router.push("/report-user"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
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

        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: profile.image,
            }}
            style={styles.avatar}
          />

          <View
            style={[
              styles.avatarOnline,
              {
                backgroundColor: theme.success,
                borderColor: theme.surface,
              },
            ]}
          />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerNameRow}>
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
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <Text style={styles.verifiedText}>
                ✓
              </Text>
            </View>
          </View>

          <View style={styles.onlineRow}>
            <View
              style={[
                styles.onlineDot,
                {
                  backgroundColor: theme.success,
                },
              ]}
            />

            <Text
              style={[
                styles.onlineText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Active now
            </Text>
          </View>
        </View>

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
      </View>

      {/* ================= MATCH BANNER ================= */}

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
            You and {profile.name} liked each other.
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

      {/* ================= MESSAGES ================= */}

      <ScrollView
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

        {messages.map((message) => (
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
                {message.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ================= INPUT ================= */}

      <View
        style={[
          styles.inputArea,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
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

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          multiline
          maxLength={1000}
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: text.trim()
                ? theme.primary
                : isDark
                ? "#302A3A"
                : "#E6E1EA",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
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
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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