import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

const benefits = [
  {
    icon: "♡",
    title: "See who likes you",
    text: "Know who's already interested in you.",
  },
  {
    icon: "↺",
    title: "Unlimited rewinds",
    text: "Go back to profiles you accidentally passed.",
  },
  {
    icon: "★",
    title: "More Super Likes",
    text: "Stand out and show someone you're interested.",
  },
  {
    icon: "♥",
    title: "Unlimited likes",
    text: "Keep discovering without daily like limits.",
  },
  {
    icon: "✦",
    title: "Priority discovery",
    text: "Get more visibility while discovering.",
  },
];

const plans = [
  {
    id: "monthly",
    title: "1 Month",
    subtitle: "Flexible monthly membership",
    price: "₹299",
    period: "/ month",
  },
  {
    id: "six",
    title: "6 Months",
    subtitle: "Better value for longer vibes",
    price: "₹1,299",
    period: "/ 6 months",
    popular: true,
  },
  {
    id: "yearly",
    title: "12 Months",
    subtitle: "Best value for serious vibes",
    price: "₹1,999",
    period: "/ year",
  },
];

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState("six");

  const { theme, isDark } = useTheme();

  const selectedPlanData =
    plans.find((plan) => plan.id === selectedPlan) || plans[1];

  const softPurple = isDark
    ? "rgba(154, 122, 255, 0.14)"
    : "#F0E9FF";

  const softSuccess = isDark
    ? "rgba(53, 201, 138, 0.14)"
    : "#E8FBF3";

  const softCoral = isDark
    ? "rgba(255, 113, 143, 0.14)"
    : "#FFF0F4";

  const selectedPlanBackground = isDark
    ? "rgba(154, 122, 255, 0.07)"
    : "#FCFAFF";

  const handleSubscribe = () => {
    Alert.alert(
      "Vibe Premium ✨",
      `${selectedPlanData.title} plan selected.\n\nPayments will be connected with Google Play / App Store billing when the production version is ready.`,
      [
        {
          text: "Okay",
        },
      ]
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
      <View style={styles.header}>
        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.back()}
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

        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              { color: theme.text },
            ]}
          >
            Vibe Premium
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.textMuted },
            ]}
          >
            Upgrade your vibe
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            { backgroundColor: theme.primary },
          ]}
        >
          <View style={styles.glowOne} />
          <View style={styles.glowTwo} />

          <View style={styles.sparkleOne}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>

          <View style={styles.sparkleTwo}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>

          <View style={styles.crownCircle}>
            <Text
              style={[
                styles.crown,
                { color: theme.primary },
              ]}
            >
              ♛
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Date with intention.
          </Text>

          <Text style={styles.heroText}>
            Unlock more ways to connect,
            discover and find your vibe.
          </Text>

          <View style={styles.premiumPill}>
            <Text style={styles.premiumPillText}>
              ✨ PREMIUM EXPERIENCE
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Premium gives you more
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.textMuted },
            ]}
          >
            More control. More visibility. More vibes.
          </Text>
        </View>

        <View
          style={[
            styles.benefitsCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {benefits.map((benefit, index) => (
            <View
              key={benefit.title}
              style={[
                styles.benefitRow,
                {
                  borderBottomColor: theme.border,
                },
                index === benefits.length - 1 &&
                  styles.lastBenefit,
              ]}
            >
              <View
                style={[
                  styles.benefitIcon,
                  { backgroundColor: softPurple },
                ]}
              >
                <Text
                  style={[
                    styles.benefitIconText,
                    { color: theme.primary },
                  ]}
                >
                  {benefit.icon}
                </Text>
              </View>

              <View style={styles.benefitContent}>
                <Text
                  style={[
                    styles.benefitTitle,
                    { color: theme.text },
                  ]}
                >
                  {benefit.title}
                </Text>

                <Text
                  style={[
                    styles.benefitText,
                    { color: theme.textMuted },
                  ]}
                >
                  {benefit.text}
                </Text>
              </View>

              <View
                style={[
                  styles.checkCircle,
                  { backgroundColor: softSuccess },
                ]}
              >
                <Text
                  style={[
                    styles.check,
                    { color: theme.success },
                  ]}
                >
                  ✓
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Choose your plan
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.textMuted },
            ]}
          >
            Pick the plan that works for you.
          </Text>
        </View>

        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              style={[
                styles.planCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
                isSelected && {
                  borderColor: theme.primary,
                  backgroundColor: selectedPlanBackground,
                },
              ]}
            >
              {plan.popular && (
                <View
                  style={[
                    styles.popularBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.popularText}>
                    MOST POPULAR
                  </Text>
                </View>
              )}

              <View style={styles.planLeft}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected
                        ? theme.primary
                        : isDark
                        ? "#5B5565"
                        : "#C9C3D2",
                    },
                  ]}
                >
                  {isSelected && (
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

                <View style={styles.planInfo}>
                  <View style={styles.planNameRow}>
                    <Text
                      style={[
                        styles.planName,
                        { color: theme.text },
                      ]}
                    >
                      {plan.title}
                    </Text>

                    {plan.popular && (
                      <View
                        style={[
                          styles.bestValue,
                          {
                            backgroundColor:
                              softCoral,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bestValueText,
                            { color: theme.coral },
                          ]}
                        >
                          BEST VALUE
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.planSubtext,
                      { color: theme.textMuted },
                    ]}
                  >
                    {plan.subtitle}
                  </Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.price,
                    { color: theme.text },
                    isSelected && {
                      color: theme.primary,
                    },
                  ]}
                >
                  {plan.price}
                </Text>

                <Text
                  style={[
                    styles.period,
                    { color: theme.textMuted },
                  ]}
                >
                  {plan.period}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Selected plan info */}
        <View
          style={[
            styles.selectedInfo,
            { backgroundColor: softPurple },
          ]}
        >
          <View
            style={[
              styles.selectedInfoIcon,
              { backgroundColor: theme.primary },
            ]}
          >
            <Text style={styles.selectedInfoIconText}>
              ✓
            </Text>
          </View>

          <View style={styles.selectedInfoContent}>
            <Text
              style={[
                styles.selectedInfoTitle,
                { color: theme.text },
              ]}
            >
              {selectedPlanData.title} Premium selected
            </Text>

            <Text
              style={[
                styles.selectedInfoText,
                { color: theme.textMuted },
              ]}
            >
              Enjoy all premium features with this plan.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <Pressable
          style={[
            styles.ctaButton,
            { backgroundColor: theme.primary },
          ]}
          onPress={handleSubscribe}
        >
          <View style={styles.ctaIcon}>
            <Text style={styles.ctaIconText}>
              ♛
            </Text>
          </View>

          <Text style={styles.ctaText}>
            Continue with Premium
          </Text>

          <Text style={styles.ctaArrow}>→</Text>
        </Pressable>

        <Text
          style={[
            styles.disclaimer,
            { color: theme.textMuted },
          ]}
        >
          Subscription payments will be processed through
          the official Google Play / App Store billing
          system when payments are enabled.
        </Text>

        <Text
          style={[
            styles.footerText,
            { color: theme.textMuted },
          ]}
        >
          Cancel anytime from your store settings.
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
  },

  /* Header */

  header: {
    height: 66,
    paddingHorizontal: spacing.lg + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 31,
    marginTop: -3,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 2,
    ...typography.caption,
    fontSize: 10,
  },

  headerSpacer: {
    width: 42,
  },

  /* Content */

  content: {
    paddingHorizontal: spacing.lg + 2,
    paddingBottom: 35,
  },

  /* Hero */

  hero: {
    marginTop: spacing.sm + 2,
    minHeight: 265,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    overflow: "hidden",
  },

  glowOne: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#8B68FF",
    opacity: 0.35,
    top: -80,
    right: -45,
  },

  glowTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FF6B8A",
    opacity: 0.28,
    bottom: -80,
    left: -45,
  },

  sparkleOne: {
    position: "absolute",
    top: 34,
    left: 40,
  },

  sparkleTwo: {
    position: "absolute",
    top: 65,
    right: 40,
  },

  sparkleText: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  crownCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  crown: {
    fontSize: 36,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  heroText: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 20,
    color: "#F2EDFF",
    textAlign: "center",
    maxWidth: 300,
  },

  premiumPill: {
    marginTop: 17,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  premiumPillText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#FFFFFF",
  },

  /* Section */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
  },

  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 4,
    ...typography.caption,
    fontSize: 11,
  },

  /* Benefits */

  benefitsCard: {
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 15,
  },

  benefitRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  lastBenefit: {
    borderBottomWidth: 0,
  },

  benefitIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  benefitIconText: {
    fontSize: 19,
  },

  benefitContent: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 9,
  },

  benefitTitle: {
    ...typography.captionMedium,
    fontSize: 13,
    fontWeight: "800",
  },

  benefitText: {
    marginTop: 3,
    ...typography.caption,
    fontSize: 11,
    lineHeight: 16,
  },

  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    fontSize: 12,
    fontWeight: "900",
  },

  /* Plans */

  planCard: {
    minHeight: 82,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  popularBadge: {
    position: "absolute",
    top: -1,
    right: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  popularText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  planInfo: {
    flex: 1,
  },

  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  planName: {
    ...typography.captionMedium,
    fontSize: 14,
    fontWeight: "800",
  },

  bestValue: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
  },

  bestValueText: {
    fontSize: 7,
    fontWeight: "900",
  },

  planSubtext: {
    marginTop: 4,
    ...typography.caption,
    fontSize: 10,
  },

  priceContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  price: {
    fontSize: 15,
    fontWeight: "900",
  },

  period: {
    marginTop: 2,
    ...typography.caption,
    fontSize: 9,
  },

  /* Selected plan */

  selectedInfo: {
    marginTop: 2,
    padding: 13,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedInfoIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedInfoIconText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  selectedInfoContent: {
    flex: 1,
    marginLeft: 10,
  },

  selectedInfoTitle: {
    ...typography.captionMedium,
    fontSize: 12,
    fontWeight: "800",
  },

  selectedInfoText: {
    marginTop: 3,
    ...typography.caption,
    fontSize: 10,
  },

  /* CTA */

  ctaButton: {
    height: 57,
    marginTop: 14,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  ctaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  ctaIconText: {
    fontSize: 15,
    color: "#FFFFFF",
  },

  ctaText: {
    color: "#FFFFFF",
    ...typography.button,
    fontSize: 15,
    fontWeight: "800",
  },

  ctaArrow: {
    marginLeft: 10,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  disclaimer: {
    marginTop: 12,
    paddingHorizontal: 10,
    textAlign: "center",
    ...typography.caption,
    fontSize: 9,
    lineHeight: 15,
  },

  footerText: {
    marginTop: 3,
    textAlign: "center",
    ...typography.caption,
    fontSize: 9,
  },

  bottomSpace: {
    height: 18,
  },
});