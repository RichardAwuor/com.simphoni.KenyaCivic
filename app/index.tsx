
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSignIn = () => {
    console.log("[Welcome] User tapped Sign In - navigating to auth screen");
    router.push("/auth");
  };

  const handleRegister = () => {
    console.log("[Welcome] User tapped Register - navigating to registration screen");
    router.push("/register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo and Branding */}
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/c22b81d6-4b22-4830-9663-1a8827882d4c.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>CIVIC</Text>
          <Text style={styles.slogan}>WANJIKU@63</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Electoral Agent Portal</Text>
          <Text style={styles.subtitle}>
            Report election results with transparency and accuracy
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconBox}>
              <IconSymbol
                ios_icon_name="video.fill"
                android_material_icon_name="videocam"
                size={28}
                color={colors.textLight}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Record Incidents</Text>
              <Text style={styles.featureDescription}>
                Capture up to 3 videos with automatic geo-tagging
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconBox}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={28}
                color={colors.textLight}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Submit Form 34A</Text>
              <Text style={styles.featureDescription}>
                Scan and validate election results forms
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconBox}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={28}
                color={colors.textLight}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>View Reports</Text>
              <Text style={styles.featureDescription}>
                Access real-time election data and analytics
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            activeOpacity={0.8}
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
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="person.badge.plus"
              android_material_icon_name="person-add"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.registerButtonText}>Register as New Agent</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Kenya Civic</Text>
          <Text style={styles.footerSubtext}>
            Transparent Elections • Real Results
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 20 : 10,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  appName: {
    fontSize: 52,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 22,
    color: colors.secondary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  featureIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginBottom: 32,
  },
  signInButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonText: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.textLight,
    marginRight: 10,
  },
  registerButton: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: 10,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
