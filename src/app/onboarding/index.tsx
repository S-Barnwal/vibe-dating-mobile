import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { useTheme } from "../../hooks/use-theme";
import { useOnboardingStore } from "../../store/onboardingStore";
import { spacing, radius } from "../../constants/spacing";
import { typography } from "../../constants/typography";

export default function BirthdayScreen() {
  const { theme, isDark } = useTheme();

  const [birthday, setBirthday] = useState("");
  const [birthdayError, setBirthdayError] = useState("");

  const setStoreBirthday = useOnboardingStore(
    (state) => state.setBirthday
  );

  const validateBirthday = (value: string) => {
    const cleaned = value.replace(/\s/g, "");

    // Must be exactly DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) {
      return "Please enter your complete birthday.";
    }

    const [day, month, year] = cleaned
      .split("/")
      .map(Number);

    const today = new Date();

    // Basic year validation
    if (year < 1900) {
      return "Please enter a valid birthday.";
    }

    // Create date
    const birthDate = new Date(
      year,
      month - 1,
      day
    );

    // Check invalid dates like:
    // 31/02/2000
    // 32/01/2000
    // 29/02/2023
    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return "Please enter a valid date.";
    }

    // Birthday cannot be in the future
    if (birthDate > today) {
      return "Birthday cannot be in the future.";
    }

    // Calculate age
    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Dating app minimum age
    if (age < 18) {
      return "You must be at least 18 years old.";
    }

    // Prevent unrealistic age
    if (age > 100) {
      return "Please enter a valid birthday.";
    }

    return "";
  };

  const formatBirthday = (value: string) => {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 8);

    let formatted = numbers;

    if (numbers.length > 2) {
      formatted =
        numbers.slice(0, 2) +
        " / " +
        numbers.slice(2);
    }

    if (numbers.length > 4) {
      formatted =
        numbers.slice(0, 2) +
        " / " +
        numbers.slice(2, 4) +
        " / " +
        numbers.slice(4);
    }

    setBirthday(formatted);

    // Validate automatically once complete
    if (numbers.length === 8) {
      const error = validateBirthday(formatted);
      setBirthdayError(error);
    } else {
      setBirthdayError("");
    }
  };

  const birthdayIsComplete = birthday.length === 14;

  const canContinue =
    birthdayIsComplete && !birthdayError;

  const handleContinue = () => {
    const error = validateBirthday(birthday);

    if (error) {
      setBirthdayError(error);
      return;
    }

    setBirthdayError("");
    setStoreBirthday(birthday);

    router.push("/onboarding/gender");
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
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressActive,
              {
                backgroundColor: theme.primary,
              },
            ]}
          />

          <View
            style={[
              styles.progressInactive,
              {
                backgroundColor: theme.border,
              },
            ]}
          />

          <View
            style={[
              styles.progressInactive,
              {
                backgroundColor: theme.border,
              },
            ]}
          />

          <View
            style={[
              styles.progressInactive,
              {
                backgroundColor: theme.border,
              },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.step,
              {
                color: theme.primary,
              },
            ]}
          >
            01 / 04
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            When's your{"\n"}birthday?
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Your age helps us show you people in the
            {" "}
            right age range.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Date of birth
          </Text>

          <TextInput
            value={birthday}
            onChangeText={formatBirthday}
            placeholder="DD / MM / YYYY"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: birthdayError
                  ? theme.danger
                  : theme.border,
                color: theme.text,
              },
            ]}
            maxLength={14}
            returnKeyType="done"
          />

          {/* Validation Error */}
          {birthdayError ? (
            <Text
              style={[
                styles.error,
                {
                  color: theme.danger,
                },
              ]}
            >
              {birthdayError}
            </Text>
          ) : null}

          <Text
            style={[
              styles.info,
              {
                color: theme.textMuted,
              },
            ]}
          >
            Your birthday won't be shown publicly.
          </Text>
        </View>

        {/* Continue */}
        <Pressable
          disabled={!canContinue}
          onPress={handleContinue}
          style={[
            styles.button,
            {
              backgroundColor: canContinue
                ? theme.primary
                : isDark
                ? "#302A3A"
                : "#E6E1EA",
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: canContinue
                  ? "#FFFFFF"
                  : theme.textMuted,
              },
            ]}
          >
            Continue
          </Text>
        </Pressable>
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

  progressContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 45,
  },

  progressActive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  progressInactive: {
    height: 5,
    flex: 1,
    borderRadius: radius.pill,
  },

  header: {
    marginBottom: 42,
  },

  step: {
    ...typography.captionMedium,
    marginBottom: 14,
  },

  title: {
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: spacing.md,
    ...typography.body,
    lineHeight: 23,
  },

  form: {
    marginTop: 5,
  },

  label: {
    ...typography.bodyMedium,
    marginBottom: 10,
  },

  input: {
    height: 58,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 18,
    fontSize: 16,
  },

  error: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },

  info: {
    marginTop: spacing.sm,
    ...typography.caption,
  },

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },

  buttonText: {
    ...typography.button,
  },
});