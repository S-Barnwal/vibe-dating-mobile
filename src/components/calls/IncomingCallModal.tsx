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

export type IncomingCall = {
  _id: string;
  caller: CallUser;
  receiver: CallUser;
  type: "voice";
  status: "ringing";
  channelName: string;
};

type Props = {
  call: IncomingCall | null;
  onAccept: () => void;
  onReject: () => void;
};

export default function IncomingCallModal({
  call,
  onAccept,
  onReject,
}: Props) {
  const { theme } = useTheme();

  if (!call) {
    return null;
  }

  const callerName =
    call.caller?.name ||
    call.caller?.username ||
    "Someone";

  return (
    <Modal
      visible={!!call}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.smallText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            INCOMING VOICE CALL
          </Text>

          {/* Profile Image */}

          <View
            style={[
              styles.avatarWrapper,
              {
                backgroundColor: theme.primary + "18",
                borderColor: theme.primary + "45",
              },
            ]}
          >
            {call.caller?.profileImage ? (
              <Image
                source={{
                  uri: call.caller.profileImage,
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
                {callerName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.callerName,
              {
                color: theme.text,
              },
            ]}
          >
            {callerName}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            wants to vibe with you 📞
          </Text>

          {/* Buttons */}

          <View style={styles.actions}>
            <Pressable
              onPress={onReject}
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                {
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text style={styles.actionIcon}>✕</Text>

              <Text style={styles.actionText}>
                Decline
              </Text>
            </Pressable>

            <Pressable
              onPress={onAccept}
              style={({ pressed }) => [
                styles.actionButton,
                styles.acceptButton,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text style={styles.actionIcon}>☎</Text>

              <Text style={styles.actionText}>
                Accept
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  container: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: "center",
  },

  smallText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 24,
  },

  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 18,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 38,
    fontWeight: "800",
  },

  callerName: {
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 7,
    marginBottom: 30,
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  rejectButton: {
    backgroundColor: "#EF4444",
  },

  acceptButton: {
    backgroundColor: "#22C55E",
  },

  actionIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});