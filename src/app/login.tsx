import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";
import { connectSocket } from "../services/socket.service";

import {
  login,
  resendEmailOtp,
  saveAuthSession,
} from "../services/auth.service";

export default function LoginScreen() {
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // LOGIN
      // =====================================================

      const response = await login({
        email: trimmedEmail,
        password,
      });

      const loggedInUser = response.data.user;
      const token = response.data.token;

      // =====================================================
      // SAVE AUTH SESSION
      // =====================================================

      await saveAuthSession({
        token,
        user: loggedInUser,
      });

      await connectSocket();

      // =====================================================
      // NAVIGATION
      //
      // Existing user with completed profile
      //      → Discover
      //
      // User whose profile is not completed
      //      → Onboarding
      // =====================================================

      if (loggedInUser.profileCompleted === true) {
        router.replace("/discover");
        return;
      }

      router.replace("/onboarding");
    } catch (err: any) {
      // =====================================================
      // EMAIL VERIFICATION
      // =====================================================

      if (
        err?.message ===
        "Please verify your email before logging in"
      ) {
        try {
          await resendEmailOtp(trimmedEmail);

          router.push({
            pathname: "/verify-email",
            params: {
              email: trimmedEmail,
            },
          });

          return;
        } catch {
          router.push({
            pathname: "/verify-email",
            params: {
              email: trimmedEmail,
            },
          });

          return;
        }
      }

      // =====================================================
      // NORMAL LOGIN ERROR
      // =====================================================

      const message =
        err instanceof Error
          ? err.message
          : "Unable to login. Please try again.";

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
        {/* =================================================
            BACK
        ================================================= */}

        <Pressable
          onPress={() => router.back()}
          disabled={loading}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity:
                pressed || loading
                  ? 0.75
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

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
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
            Welcome back 👋
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Log in to continue meeting people who match
            your energy.
          </Text>
        </View>

        {/* =================================================
            FORM
        ================================================= */}

        <View style={styles.form}>
          {/* Email */}

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

          {/* Password */}

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError("");
            }}
            placeholder="Enter your password"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
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

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          <Pressable
            style={styles.forgot}
            disabled={loading}
            onPress={() =>
              router.push("/forgot-password")
            }
          >
            <Text
              style={[
                styles.forgotText,
                {
                  color: theme.primary,
                },
              ]}
            >
              Forgot password?
            </Text>
          </Pressable>

          {/* =================================================
              ERROR
          ================================================= */}

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

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.primary,
                opacity:
                  pressed || loading
                    ? 0.9
                    : 1,
                transform: [
                  {
                    scale: pressed
                      ? 0.98
                      : 1,
                  },
                ],
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  Log In
                </Text>

                <Text style={styles.buttonArrow}>
                  →
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* =================================================
            SIGNUP
        ================================================= */}

        <View style={styles.bottom}>
          <Text
            style={[
              styles.bottomText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Don't have an account?
          </Text>

          <Pressable
            onPress={() => router.push("/signup")}
            disabled={loading}
          >
            <Text
              style={[
                styles.signupLink,
                {
                  color: theme.primary,
                },
              ]}
            >
              {" "}Sign up
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text
          style={[
            styles.footer,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Welcome back to your vibe ✨
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   STYLES
========================================================= */

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
    marginBottom: 35,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
    marginTop: -3,
  },

  /* Header */

  header: {
    marginBottom: 35,
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 25,
  },

  title: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
  },

  subtitle: {
    marginTop: 12,
    ...typography.body,
    lineHeight: 23,
  },

  /* Form */

  form: {
    gap: 10,
  },

  label: {
    ...typography.captionMedium,
    fontSize: 14,
    marginTop: 8,
  },

  input: {
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 17,
    fontSize: 15,
    marginBottom: 5,
  },

  /* Forgot */

  forgot: {
    alignSelf: "flex-end",
    marginTop: 2,
  },

  forgotText: {
    ...typography.captionMedium,
    fontSize: 13,
  },

  /* Error */

  errorBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 4,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  /* Button */

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 18,
  },

  buttonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  /* Signup */

  bottom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  bottomText: {
    ...typography.caption,
    fontSize: 14,
  },

  signupLink: {
    ...typography.captionMedium,
    fontSize: 14,
  },

  /* Footer */

  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: 25,
  },
});