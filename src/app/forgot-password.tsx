import { useState } from "react";
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
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";
import { forgotPassword } from "../services/auth.service";

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(trimmedEmail);

      router.push({
        pathname: "/verify-reset-otp",
        params: {
          email: trimmedEmail,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to send reset code.";

      setError(message);
    } finally {
      setLoading(false);
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
          disabled={loading}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity:
                pressed || loading ? 0.7 : 1,
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
            <Text style={styles.icon}>🔐</Text>
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
            Forgot password?
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Enter your email and we'll send you a
            verification code to reset your password.
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
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError("");
            }}
            placeholder="Enter your email"
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!loading}
            style={[
              styles.input,
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
                styles.errorBox,
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
                  styles.errorText,
                  {
                    color: theme.danger,
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.primary,
                opacity:
                  pressed || loading ? 0.9 : 1,
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
                <Text style={styles.buttonText}>
                  Send Reset Code
                </Text>

                <Text style={styles.arrow}>
                  →
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.replace("/login")}
          disabled={loading}
          style={styles.loginButton}
        >
          <Text
            style={[
              styles.loginText,
              {
                color: theme.primary,
              },
            ]}
          >
            Back to Log In
          </Text>
        </Pressable>

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
    marginBottom: 35,
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

  form: {
    gap: 10,
  },

  label: {
    ...typography.captionMedium,
    fontSize: 14,
    marginTop: 4,
  },

  input: {
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 17,
    fontSize: 15,
    marginBottom: 5,
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 3,
  },

  errorText: {
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
    marginTop: 14,
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

  loginButton: {
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    ...typography.captionMedium,
    fontSize: 14,
  },

  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: 25,
  },
});