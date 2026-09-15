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
import { signup } from "../services/auth.service";

export default function SignupScreen() {
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

    const response = await signup({
  name: trimmedName,
  email: trimmedEmail,
  password,
  confirmPassword,
});

if (response.data.user.isEmailVerified) {
  router.replace("/onboarding");
} else {
  router.push({
    pathname: "/verify-email",
    params: {
      email: trimmedEmail,
    },
  });
}


    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account.";

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
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          disabled={loading}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: pressed || loading ? 0.75 : 1,
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
            Create your account
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Let's get you started and find people you
            actually vibe with.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name */}
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />

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
            onChangeText={setEmail}
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
                borderColor: theme.border,
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
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />

          {/* Confirm Password */}
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Confirm Password
          </Text>

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />

          {/* Error */}
          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: theme.danger + "12",
                  borderColor: theme.danger + "35",
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

          {/* Create Account */}
          <Pressable
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
            onPress={handleSignup}
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
                  Create Account
                </Text>

                <Text style={styles.buttonArrow}>
                  →
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Login */}
        <View style={styles.bottom}>
          <Text
            style={[
              styles.bottomText,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Already have an account?
          </Text>

          <Pressable
            onPress={() => router.push("/login")}
            disabled={loading}
          >
            <Text
              style={[
                styles.loginLink,
                {
                  color: theme.primary,
                },
              ]}
            >
              {" "}Log in
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
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

  /* Bottom */

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

  loginLink: {
    ...typography.captionMedium,
    fontSize: 14,
  },

  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: 25,
  },
});