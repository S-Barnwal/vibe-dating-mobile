import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";
import {
  resendEmailOtp,
  verifyEmailOtp,
} from "../services/auth.service";

export default function VerifyEmailScreen() {
  const { theme } = useTheme();

  const { email } = useLocalSearchParams<{
    email?: string;
  }>();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRef = useRef<TextInput>(null);

  const [secondsLeft, setSecondsLeft] =
    useState(60);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    setError("");
    setSuccess("");

    const cleanOtp = otp.replace(/\D/g, "");

    if (!email) {
      setError(
        "Email information is missing. Please sign up again."
      );
      return;
    }

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      await verifyEmailOtp({
        email,
        otp: cleanOtp,
      });

      setSuccess("Email verified successfully! 🎉");

      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to verify your email.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Email information is missing. Please sign up again."
      );
      return;
    }

    if (secondsLeft > 0) return;

    try {
      setResending(true);

      await resendEmailOtp(email);

      setOtp("");
      setSecondsLeft(60);
      setSuccess(
        "A new verification code has been sent to your email."
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to resend the verification code.";

      setError(message);
    } finally {
      setResending(false);
    }
  };

  const formattedEmail =
    email && email.length > 34
      ? `${email.slice(0, 30)}...`
      : email || "your email";

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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}

        <Pressable
          onPress={() => router.back()}
          disabled={loading || resending}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity:
                pressed || loading || resending
                  ? 0.7
                  : 1,
            },
          ]}
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

        {/* Header */}

        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.primary + "14",
              },
            ]}
          >
            <Text style={styles.icon}>✉️</Text>
          </View>

          <Text
            style={[
              styles.logo,
              {
                color: theme.primary,
              },
            ]}
          >
            vibe
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Verify your email
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            We sent a 6-digit verification code to
          </Text>

          <Text
            style={[
              styles.email,
              {
                color: theme.text,
              },
            ]}
          >
            {formattedEmail}
          </Text>
        </View>

        {/* OTP */}

        <View style={styles.form}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Verification code
          </Text>

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(value) => {
              setError("");
              setSuccess("");
              setOtp(
                value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              );
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={theme.textMuted}
            editable={!loading}
            autoFocus
            style={[
              styles.otpInput,
              {
                backgroundColor: theme.surface,
                borderColor: error
                  ? theme.danger
                  : theme.border,
                color: theme.text,
              },
            ]}
          />

          {/* Error */}

          {error ? (
            <View
              style={[
                styles.messageBox,
                {
                  backgroundColor:
                    theme.danger + "12",
                  borderColor:
                    theme.danger + "35",
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: theme.danger,
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Success */}

          {success ? (
            <View
              style={[
                styles.messageBox,
                {
                  backgroundColor:
                    theme.success + "12",
                  borderColor:
                    theme.success + "35",
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: theme.success,
                  },
                ]}
              >
                {success}
              </Text>
            </View>
          ) : null}

          {/* Verify */}

          <Pressable
            onPress={handleVerify}
            disabled={loading || resending}
            style={({ pressed }) => [
              styles.verifyButton,
              {
                backgroundColor: theme.primary,
                opacity:
                  pressed ||
                  loading ||
                  resending
                    ? 0.85
                    : 1,
                transform: [
                  {
                    scale: pressed ? 0.98 : 1,
                  },
                ],
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text style={styles.verifyText}>
                  Verify Email
                </Text>

                <Text style={styles.arrow}>
                  →
                </Text>
              </>
            )}
          </Pressable>

          {/* Resend */}

          <View style={styles.resendContainer}>
            <Text
              style={[
                styles.resendLabel,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Didn't receive the code?
            </Text>

            <Pressable
              onPress={handleResend}
              disabled={
                secondsLeft > 0 ||
                loading ||
                resending
              }
            >
              {resending ? (
                <ActivityIndicator
                  size="small"
                  color={theme.primary}
                />
              ) : (
                <Text
                  style={[
                    styles.resendButton,
                    {
                      color:
                        secondsLeft > 0
                          ? theme.textMuted
                          : theme.primary,
                    },
                  ]}
                >
                  {secondsLeft > 0
                    ? `Resend in ${secondsLeft}s`
                    : "Resend code"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Help */}

        <View
          style={[
            styles.helpBox,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={styles.helpEmoji}>
            💜
          </Text>

          <View style={styles.helpContent}>
            <Text
              style={[
                styles.helpTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Check your inbox
            </Text>

            <Text
              style={[
                styles.helpText,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              The verification code expires in 10
              minutes. Check your spam folder if you
              don't see it.
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.footer,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Your vibe starts here ✨
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: 55,
    paddingBottom: spacing.xxxl,
  },

  /* Back */

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
    marginTop: -3,
  },

  /* Header */

  header: {
    alignItems: "center",
    marginBottom: 34,
  },

  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  icon: {
    fontSize: 30,
  },

  logo: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 22,
  },

  title: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 37,
    textAlign: "center",
  },

  subtitle: {
    ...typography.body,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },

  email: {
    ...typography.bodyMedium,
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },

  /* Form */

  form: {
    gap: 10,
  },

  label: {
    ...typography.captionMedium,
    fontSize: 14,
    marginTop: 4,
  },

  otpInput: {
    height: 62,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 10,
    textAlign: "center",
    marginBottom: 5,
  },

  /* Messages */

  messageBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 3,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  /* Verify */

  verifyButton: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 14,
  },

  verifyText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  /* Resend */

  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 18,
  },

  resendLabel: {
    ...typography.caption,
    fontSize: 13,
  },

  resendButton: {
    ...typography.captionMedium,
    fontSize: 13,
  },

  /* Help */

  helpBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 32,
  },

  helpEmoji: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 1,
  },

  helpContent: {
    flex: 1,
  },

  helpTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },

  helpText: {
    fontSize: 12,
    lineHeight: 18,
  },

  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: 25,
  },
});