import { useEffect, useState } from "react";
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
  forgotPassword,
  verifyResetOtp,
} from "../services/auth.service";

export default function VerifyResetOtpScreen() {
  const { theme } = useTheme();

  const { email } = useLocalSearchParams<{
    email?: string;
  }>();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        "Email information is missing. Please start again."
      );
      return;
    }

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      await verifyResetOtp({
        email,
        otp: cleanOtp,
      });

      router.push({
        pathname: "/reset-password",
        params: {
          email,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || secondsLeft > 0) return;

    setError("");
    setSuccess("");

    try {
      setResending(true);

      await forgotPassword(email);

      setOtp("");
      setSecondsLeft(60);
      setSuccess(
        "A new reset code has been sent to your email."
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to resend the reset code.";

      setError(message);
    } finally {
      setResending(false);
    }
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
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.primary + "14",
              },
            ]}
          >
            <Text style={styles.icon}>🔑</Text>
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
            Enter your code
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            We sent a 6-digit reset code to
          </Text>

          <Text
            style={[
              styles.email,
              {
                color: theme.text,
              },
            ]}
          >
            {email || "your email"}
          </Text>
        </View>

        <View style={styles.form}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Reset code
          </Text>

          <TextInput
            value={otp}
            onChangeText={(value) => {
              setOtp(
                value.replace(/\D/g, "").slice(0, 6)
              );
              setError("");
              setSuccess("");
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

          <Pressable
            onPress={handleVerify}
            disabled={loading || resending}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.primary,
                opacity:
                  pressed ||
                  loading ||
                  resending
                    ? 0.85
                    : 1,
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
                <Text style={styles.buttonText}>
                  Verify Code
                </Text>

                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </Pressable>

          <View style={styles.resendRow}>
            <Text
              style={[
                styles.resendLabel,
                {
                  color: theme.textMuted,
                },
              ]}
            >
              Didn't receive it?
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
                    styles.resendText,
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
  },

  form: {
    gap: 10,
  },

  label: {
    ...typography.captionMedium,
    fontSize: 14,
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
  },

  messageBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 14,
  },

  resendLabel: {
    ...typography.caption,
    fontSize: 13,
  },

  resendText: {
    ...typography.captionMedium,
    fontSize: 13,
  },

  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: 30,
  },
});