import React from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SkinHealthScanApp = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="medkit" size={26} color="#4F46E5" />
          <Text style={styles.appName}>Derma Detect</Text>
        </View>
      </View>

      {/* Hero Section */}
      <LinearGradient
        colors={["#EEF2FF", "#F9FAFB"]}
        style={styles.heroGradient}
      >
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Professional Skin Analysis</Text>
            <Text style={styles.heroText}>
              Medical-grade AI assessment from the comfort of your home
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              onPress={() => router.push("/uploadScreen")}
            >
              <Ionicons name="scan" size={20} color="white" />
              <Text style={styles.buttonText}>Start Skin Scan</Text>
            </Pressable>
          </View>
          <View style={styles.heroImage}>
            <Ionicons name="body" size={120} color="#C7D2FE" />
          </View>
        </View>
      </LinearGradient>

      {/* Value Propositions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Derma Detect?</Text>

        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="sparkles"
            title="AI-Powered"
            text="Get instant skin insights powered by advanced AI"
            bg="#EEF2FF"
            color="#4F46E5"
          />
          <FeatureCard
            icon="home"
            title="At-Home Check"
            text="Scan your skin anytime, anywhere"
            bg="#F0FDF4"
            color="#10B981"
          />
        </View>

        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="time"
            title="Fast Results"
            text="No waiting for appointments or delays"
            bg="#EFF6FF"
            color="#3B82F6"
          />
          <FeatureCard
            icon="heart"
            title="Peace of Mind"
            text="Early insights to help you feel confident"
            bg="#F5F3FF"
            color="#EF4444"
          />
        </View>
      </View>

      {/* Simple Steps */}
      <View style={[styles.section, styles.lightSection]}>
        <Text style={styles.sectionTitle}>How It Works</Text>

        <View style={styles.stepsContainer}>
          <Step number="1" title="Upload Photo" desc="Capture clear image of affected area" />
          <Divider />
          <Step number="2" title="AI Analysis" desc="Our system processes your image" />
          <Divider />
          <Step number="3" title="Get Results" desc="Receive professional assessment" />
        </View>
      </View>

      {/* CTA */}
      <LinearGradient
        colors={["#4F46E5", "#6366F1"]}
        style={[styles.section, styles.ctaSection]}
      >
        <Text style={styles.ctaTitle}>Ready to Check Your Skin?</Text>
        <Text style={styles.ctaText}>
          Early detection leads to better outcomes
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            styles.ctaButton,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={() => router.push("/uploadScreen")}
        >
          <Text style={styles.buttonText}>Begin Analysis</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </Pressable>
      </LinearGradient>
    </ScrollView>
  );
};

/* --- Reusable Components --- */
const FeatureCard = ({ icon, title, text, bg, color }) => (
  <View style={styles.featureCard}>
    <View style={[styles.featureIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const Step = ({ number, title, desc }) => (
  <View style={styles.step}>
    <View style={styles.stepNumberContainer}>
      <Text style={styles.stepNumber}>{number}</Text>
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepDescription}>{desc}</Text>
  </View>
);

const Divider = () => (
  <View style={styles.stepDivider}>
    <View style={styles.dot} />
    <View style={styles.dot} />
    <View style={styles.dot} />
  </View>
);

/* --- Styles --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4F46E5",
  },
  notificationIcon: {
    padding: 8,
  },
  heroGradient: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  hero: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  heroContent: {
    flex: 1,
    paddingRight: 12,
  },
  heroImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 34,
  },
  heroText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  section: {
    padding: 24,
  },
  lightSection: {
    backgroundColor: "#F3F4F6",
  },
  ctaSection: {
    paddingVertical: 40,
    alignItems: "center",
    borderRadius: 24,
    margin: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  stepsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  step: {
    alignItems: "center",
  },
  stepNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  stepDivider: {
    alignItems: "center",
    marginVertical: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#9CA3AF",
    marginVertical: 2,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 16,
    color: "#E0E7FF",
    marginBottom: 24,
    textAlign: "center",
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
});

export default SkinHealthScanApp;