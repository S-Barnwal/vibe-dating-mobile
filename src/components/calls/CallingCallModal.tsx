import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

import { useTheme } from "../../hooks/use-theme";

type CallUser = {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string;
};

export type ActiveCall = {
  _id: string;
  caller: CallUser;
  receiver: CallUser;
  type: "voice";
  status:
    | "ringing"
    | "accepted"
    | "rejected"
    | "ended"
    | "missed"
    | "cancelled";
  channelName: string;
  startedAt: string;
  answeredAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number;
};

type Props = {
  call: ActiveCall | null;
  onEnd: () => void;
};

export default function CallingCallModal({
  call,
  onEnd,
}: Props) {
  const { theme } = useTheme();

  if (!call) {
    return null;
  }

  const receiver =
    call.receiver || {};

  const name =
    receiver.name ||
    receiver.username ||
    "User";

  return (
    <Modal
      visible={!!call}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          {call.status === "accepted"
            ? "Connected"
            : "Calling..."}
        </Text>

        <View
          style={[
            styles.avatarWrapper,
            {
              backgroundColor:
                theme.primary + "18",
              borderColor:
                theme.primary + "45",
            },
          ]}
        >
          {receiver.profileImage ? (
            <Image
              source={{
                uri: receiver.profileImage,
              }}
              style={styles.avatar}
            />
          ) : (
            <Text
              style={[
                styles.avatarText,
                {
                  color: theme.primary,
                },
              ]}
            >
              {name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.name,
            {
              color: theme.text,
            },
          ]}
        >
          {name}
        </Text>

        <Text
          style={[
            styles.status,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {call.status === "accepted"
            ? "You're on a voice call"
            : "Waiting for them to answer..."}
        </Text>

        <View style={styles.bottomArea}>
          <Pressable
            onPress={onEnd}
            style={({ pressed }) => [
              styles.endButton,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={styles.endIcon}>
              ☎
            </Text>
          </Pressable>

          <Text
            style={[
              styles.endText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            End call
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 40,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },

  avatarText: {
    fontSize: 48,
    fontWeight: "800",
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },

  status: {
    fontSize: 15,
  },

  bottomArea: {
    position: "absolute",
    bottom: 70,
    alignItems: "center",
  },

  endButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },

  endIcon: {
    color: "#fff",
    fontSize: 30,
    transform: [{ rotate: "135deg" }],
  },

  endText: {
    marginTop: 12,
    fontSize: 14,
  },
});