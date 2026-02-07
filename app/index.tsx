
import React, { useState } from "react";
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
  const [logoTapCount, setLogoTapCount] = useState(0);

  const handleSignIn = () => {
    console.log("User tapped Sign In button");
    router.push("/auth");
  };

  const handleRegister = () => {
    console.log("User tapped Register button");
    router.push("/register");
  };

  const handleAdminAccess = () => {
    console.log("User accessing Admin Import");
    router.push("/admin-import");
  };

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    console.log(`Logo tapped ${newCount} times`);
    
    if (newCount >= 5) {
      console.log("Admin access unlocked");
      setLogoTapCount(0);
      handleAdminAccess();
    }
  };

  const handleQuickImport = () => {
    console.log("User tapped Quick Import button");
    router.push("/bulk-import");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
            <Image
              source={require("@/assets/images/4d9f6aef-8dc7-4801-8d21-adefc7d8b94a.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.appName}>CIVIC</Text>
          <Text style={styles.slogan}>WANJIKU@63</Text>
          <Text style={styles.tagline}>Electoral Reporting System</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <IconSymbol
              ios_icon_name="video.fill"
              android_material_icon_name="videocam"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.featureTitle}>Record Incidents</Text>
            <Text style={styles.featureDescription}>
              Capture and report electoral incidents with video evidence
            </Text>
          </View>

          <View style={styles.featureCard}>
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="description"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.featureTitle}>Submit Form 34A</Text>
            <Text style={styles.featureDescription}>
              Scan and submit official election result forms
            </Text>
          </View>

          <View style={styles.featureCard}>
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="bar-chart"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.featureTitle}>View Reports</Text>
            <Text style={styles.featureDescription}>
              Access real-time election results and analytics
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
            <Text style={styles.secondaryButtonText}>Register as Agent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminButton} onPress={handleQuickImport}>
            <IconSymbol
              ios_icon_name="arrow.down.circle"
              android_material_icon_name="cloud-download"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.adminButtonText}>Quick Import Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure • Transparent • Accountable
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
    padding: 24,
    paddingTop: Platform.OS === "android" ? 48 : 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 20,
    color: colors.secondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  adminButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
