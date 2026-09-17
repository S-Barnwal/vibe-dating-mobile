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

export type OutgoingCall = {
  _id: string;
  caller: CallUser;
  receiver: CallUser;
  type: "voice";
  status:
    | "ringing"
    | "accepted"
    | "rejected"
    | "ended"
    | "cancelled";
  channelName: string;
};

type Props = {
  call: OutgoingCall | null;
  onCancel: () => void;
};

export default function OutgoingCallModal({
  call,
  onCancel,
}: Props) {
  const { theme } = useTheme();

  if (!call) {
    return null;
  }

  const receiverName =
    call.receiver?.name ||
    call.receiver?.username ||
    "Someone";

  return (
    <Modal
      visible={!!call}
      animationType="fade"
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
            styles.status,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {call.status === "accepted"
            ? "CONNECTED"
            : "CALLING..."}
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
          {call.receiver?.profileImage ? (
            <Image
              source={{
                uri: call.receiver.profileImage,
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
              {receiverName
                .charAt(0)
                .toUpperCase()}
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
          {receiverName}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.textMuted,
            },
          ]}
        >
          {call.status === "accepted"
            ? "Call connected 📞"
            : "Waiting for them to answer..."}
        </Text>

        <View style={styles.callAnimation}>
          <View
            style={[
              styles.ring,
              {
                borderColor:
                  theme.primary + "30",
              },
            ]}
          />

          <View
            style={[
              styles.phoneCircle,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text style={styles.phoneIcon}>
              ☎
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.cancelIcon}>
            ✕
          </Text>

          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </Pressable>
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

  status: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 35,
  },

  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },

  avatarText: {
    fontSize: 54,
    fontWeight: "800",
  },

  name: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },

  callAnimation: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 55,
    marginBottom: 65,
  },

  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },

  phoneCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  phoneIcon: {
    color: "#fff",
    fontSize: 30,
  },

  cancelButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelIcon: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
  },

  cancelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
});