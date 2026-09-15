import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Alert,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "../hooks/use-theme";
import { useThemeStore } from "../store/themeStore";
import { clearAuthSession } from "../services/auth.service";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

export default function SettingsScreen() {
    const { theme, isDark, mode } = useTheme();

    const setThemeMode = useThemeStore(
        (state) => state.setMode
    );

   const handleLogout = async () => {
    console.log("LOGOUT BUTTON PRESSED");

    let shouldLogout = false;

    // =====================================================
    // WEB
    // =====================================================

    if (Platform.OS === "web") {
        shouldLogout = window.confirm(
            "Are you sure you want to log out?"
        );

        if (!shouldLogout) {
            console.log("LOGOUT CANCELLED");
            return;
        }

        try {
            console.log("LOGOUT CONFIRMED");

            await clearAuthSession();

            console.log("AUTH SESSION CLEARED");

            router.replace("/");
        } catch (error) {
            console.error("Logout error:", error);

            window.alert(
                "Something went wrong while logging out. Please try again."
            );
        }

        return;
    }

    // =====================================================
    // ANDROID / IOS
    // =====================================================

    Alert.alert(
        "Log out",
        "Are you sure you want to log out?",
        [
            {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                    console.log("LOGOUT CANCELLED");
                },
            },
            {
                text: "Log out",
                style: "destructive",
                onPress: async () => {
                    try {
                        console.log("LOGOUT CONFIRMED");

                        await clearAuthSession();

                        console.log("AUTH SESSION CLEARED");

                        router.replace("/");
                    } catch (error) {
                        console.error(
                            "Logout error:",
                            error
                        );

                        Alert.alert(
                            "Logout failed",
                            "Something went wrong while logging out. Please try again."
                        );
                    }
                },
            },
        ]
    );
};
    const showComingSoon = (title: string) => {
        Alert.alert(
            title,
            `${title} settings will be available soon.`
        );
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.background },
            ]}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { backgroundColor: theme.background },
                ]}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={[
                        styles.backButton,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.backIcon,
                            { color: theme.text },
                        ]}
                    >
                        ‹
                    </Text>
                </Pressable>

                <Text
                    style={[
                        styles.headerTitle,
                        { color: theme.text },
                    ]}
                >
                    Settings
                </Text>

                <View style={styles.headerSpace} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Account */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme.textMuted },
                    ]}
                >
                    ACCOUNT
                </Text>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Pressable
                        style={styles.row}
                        onPress={() => router.push("/edit-profile")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>👤</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Edit Profile
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Update your profile information
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>

                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: theme.border },
                        ]}
                    />

                    <Pressable
                        style={styles.row}
                        onPress={() =>
                            showComingSoon("Password & Security")
                        }
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>🔒</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Password & Security
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Manage your account security
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>
                </View>

                {/* Privacy & Safety */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme.textMuted },
                    ]}
                >
                    PRIVACY & SAFETY
                </Text>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Pressable
                        style={styles.row}
                        onPress={() => showComingSoon("Privacy")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>🛡️</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Privacy
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Control who can see your profile
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>

                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: theme.border },
                        ]}
                    />

                    <Pressable
                        style={styles.row}
                        onPress={() => router.push("/blocked-users")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>🚫</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Blocked Users
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Manage people you've blocked
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>
                </View>

                {/* Preferences */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme.textMuted },
                    ]}
                >
                    PREFERENCES
                </Text>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Pressable
                        style={styles.row}
                        onPress={() => router.push("/notifications")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>🔔</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Notifications
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Manage your notification preferences
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>

                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: theme.border },
                        ]}
                    />

                    <Pressable
                        style={styles.row}
                        onPress={() => router.push("/filters")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>❤️</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Dating Preferences
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Change your discovery preferences
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>
                </View>

                {/* Appearance */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme.textMuted },
                    ]}
                >
                    APPEARANCE
                </Text>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View style={styles.appearanceHeader}>
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>
                                {mode === "dark"
                                    ? "🌙"
                                    : mode === "light"
                                      ? "☀️"
                                      : "⚙️"}
                            </Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Appearance
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Choose how Vibe looks on your device
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.themeOptions,
                            { borderTopColor: theme.border },
                        ]}
                    >
                        <Pressable
                            style={[
                                styles.themeOption,
                                mode === "system" && {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                            onPress={() => setThemeMode("system")}
                        >
                            <Text style={styles.themeOptionIcon}>⚙️</Text>

                            <Text
                                style={[
                                    styles.themeOptionText,
                                    {
                                        color:
                                            mode === "system"
                                                ? theme.primary
                                                : theme.text,
                                    },
                                ]}
                            >
                                System
                            </Text>

                            <View
                                style={[
                                    styles.radio,
                                    {
                                        borderColor:
                                            mode === "system"
                                                ? theme.primary
                                                : theme.border,
                                    },
                                ]}
                            >
                                {mode === "system" && (
                                    <View
                                        style={[
                                            styles.radioInner,
                                            {
                                                backgroundColor:
                                                    theme.primary,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.themeOption,
                                mode === "light" && {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                            onPress={() => setThemeMode("light")}
                        >
                            <Text style={styles.themeOptionIcon}>☀️</Text>

                            <Text
                                style={[
                                    styles.themeOptionText,
                                    {
                                        color:
                                            mode === "light"
                                                ? theme.primary
                                                : theme.text,
                                    },
                                ]}
                            >
                                Light
                            </Text>

                            <View
                                style={[
                                    styles.radio,
                                    {
                                        borderColor:
                                            mode === "light"
                                                ? theme.primary
                                                : theme.border,
                                    },
                                ]}
                            >
                                {mode === "light" && (
                                    <View
                                        style={[
                                            styles.radioInner,
                                            {
                                                backgroundColor:
                                                    theme.primary,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.themeOption,
                                mode === "dark" && {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                            onPress={() => setThemeMode("dark")}
                        >
                            <Text style={styles.themeOptionIcon}>🌙</Text>

                            <Text
                                style={[
                                    styles.themeOptionText,
                                    {
                                        color:
                                            mode === "dark"
                                                ? theme.primary
                                                : theme.text,
                                    },
                                ]}
                            >
                                Dark
                            </Text>

                            <View
                                style={[
                                    styles.radio,
                                    {
                                        borderColor:
                                            mode === "dark"
                                                ? theme.primary
                                                : theme.border,
                                    },
                                ]}
                            >
                                {mode === "dark" && (
                                    <View
                                        style={[
                                            styles.radioInner,
                                            {
                                                backgroundColor:
                                                    theme.primary,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Support */}
                <Text
                    style={[
                        styles.sectionTitle,
                        { color: theme.textMuted },
                    ]}
                >
                    SUPPORT
                </Text>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Pressable
                        style={styles.row}
                        onPress={() => showComingSoon("Help & Support")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>❓</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Help & Support
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Get help with Vibe
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>

                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: theme.border },
                        ]}
                    />

                    <Pressable
                        style={styles.row}
                        onPress={() => showComingSoon("Terms & Privacy")}
                    >
                        <View
                            style={[
                                styles.iconBox,
                                {
                                    backgroundColor: isDark
                                        ? "#2A2238"
                                        : "#F3EEFF",
                                },
                            ]}
                        >
                            <Text style={styles.icon}>📄</Text>
                        </View>

                        <View style={styles.rowContent}>
                            <Text
                                style={[
                                    styles.rowTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Terms & Privacy
                            </Text>

                            <Text
                                style={[
                                    styles.rowSubtitle,
                                    { color: theme.textMuted },
                                ]}
                            >
                                Read our terms and policies
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.arrow,
                                { color: theme.textMuted },
                            ]}
                        >
                            ›
                        </Text>
                    </Pressable>
                </View>

                {/* Logout */}
                <Pressable
                    onPress={handleLogout}
                    style={({ pressed }) => [
                        styles.logoutButton,
                        {
                            backgroundColor: theme.surface,
                            borderColor: isDark
                                ? "#4A2832"
                                : "#FFD9DF",
                            opacity: pressed ? 0.7 : 1,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.logoutText,
                            { color: theme.danger },
                        ]}
                    >
                        Log out
                    </Text>
                </Pressable>

                <Text
                    style={[
                        styles.version,
                        { color: theme.textMuted },
                    ]}
                >
                    Vibe • Version 1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    appearanceHeader: {
        minHeight: 72,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        flexDirection: "row",
        alignItems: "center",
    },

    themeOptions: {
        borderTopWidth: 1,
        padding: spacing.sm,
    },

    themeOption: {
        minHeight: 50,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        flexDirection: "row",
        alignItems: "center",
    },

    themeOptionIcon: {
        fontSize: 17,
        width: 30,
    },

    themeOptionText: {
        ...typography.bodyMedium,
        flex: 1,
    },

    radio: {
        width: 21,
        height: 21,
        borderRadius: radius.pill,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: radius.pill,
    },

    header: {
        height: 70,
        paddingHorizontal: spacing.xl,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },

    backIcon: {
        fontSize: 34,
        lineHeight: 38,
    },

    headerTitle: {
        ...typography.h3,
    },

    headerSpace: {
        width: 42,
    },

    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.sm,
        paddingBottom: spacing.massive,
    },

    sectionTitle: {
        ...typography.captionMedium,
        letterSpacing: 1,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },

    card: {
        borderRadius: radius.xl,
        overflow: "hidden",
        borderWidth: 1,
    },

    row: {
        minHeight: 72,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        flexDirection: "row",
        alignItems: "center",
    },

    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },

    icon: {
        fontSize: 19,
    },

    rowContent: {
        flex: 1,
    },

    rowTitle: {
        ...typography.bodyMedium,
        marginBottom: 3,
    },

    rowSubtitle: {
        ...typography.caption,
    },

    arrow: {
        fontSize: 27,
        marginLeft: spacing.sm,
    },

    modeLabel: {
        ...typography.captionMedium,
    },

    divider: {
        height: 1,
        marginLeft: 70,
    },

    logoutButton: {
        height: 52,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.xxl,
    },

    logoutText: {
        ...typography.bodyMedium,
    },

    version: {
        textAlign: "center",
        ...typography.caption,
        marginTop: spacing.lg,
    },
});