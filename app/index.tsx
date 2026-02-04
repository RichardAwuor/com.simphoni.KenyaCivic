
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    console.log("[Welcome] User tapped Sign In - navigating to auth screen");
    router.push("/auth");
  };

  const handleRegister = () => {
    console.log("[Welcome] User tapped Register - navigating to registration screen");
    router.push("/register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/5187b23f-bdf8-470b-b1d3-0bffbe4cce78.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CIVIC</Text>
          <Text style={styles.slogan}>WANJIKU@63</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Electoral Agent Portal</Text>
          <Text style={styles.heroSubtitle}>
            Report election results with transparency and accuracy
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <IconSymbol
                ios_icon_name="video.fill"
                android_material_icon_name="videocam"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Record Incidents</Text>
              <Text style={styles.featureDescription}>
                Capture up to 3 videos with automatic geo-tagging
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Submit Form 34A</Text>
              <Text style={styles.featureDescription}>
                Scan and validate election results forms
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>View Reports</Text>
              <Text style={styles.featureDescription}>
                Access real-time election data and analytics
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <IconSymbol
              ios_icon_name="person.badge.plus"
              android_material_icon_name="person-add"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.registerButtonText}>Register as New Agent</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Powered by Kenya Civic</Text>
          <Text style={styles.footerSubtext}>
            Transparent Elections • Real Results
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 32 : 16,
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  slogan: {
    fontSize: 20,
    color: colors.secondary,
    fontWeight: "600",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 16,
  },
  signInButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textLight,
    marginRight: 8,
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
