
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
    console.log("[Welcome] User tapped Get Started");
    router.push("/auth");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/3b525fcc-fe8a-4cc2-bf6f-cc763a5c680d.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CIVIC</Text>
          <Text style={styles.slogan}>WANJIKU@63</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Electoral Agent Portal</Text>
          <Text style={styles.heroSubtitle}>
            Report election results with transparency and accuracy
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
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

          <View style={styles.featureItem}>
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

          <View style={styles.featureItem}>
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

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Secure Authentication</Text>
              <Text style={styles.featureDescription}>
                Biometric login for enhanced security
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={24}
              color={colors.textLight}
            />
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
    marginTop: Platform.OS === "android" ? 24 : 0,
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 180,
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
    marginBottom: 32,
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
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  getStartedButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textLight,
    marginRight: 8,
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
