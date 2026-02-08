
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { isBackendConfigured } from "@/utils/api";

export default function WelcomeScreen() {
  const router = useRouter();
  const [logoTapCount, setLogoTapCount] = useState(0);
  const backendConfigured = isBackendConfigured();

  const handleSignIn = () => {
    console.log("User tapped Sign In button");
    
    if (!backendConfigured) {
      Alert.alert(
        "Backend Not Configured",
        "The backend service is not available. Please use the Quick Import Data feature to set up the system, or contact your administrator.",
        [{ text: "OK" }]
      );
      return;
    }
    
    router.push("/auth");
  };

  const handleRegister = () => {
    console.log("User tapped Register button");
    
    if (!backendConfigured) {
      Alert.alert(
        "Backend Not Configured",
        "The backend service is not available. Please use the Quick Import Data feature to set up the system, or contact your administrator.",
        [{ text: "OK" }]
      );
      return;
    }
    
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
    router.push("/admin-import");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!backendConfigured && (
          <View style={styles.warningBanner}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={20}
              color="#FF9500"
            />
            <Text style={styles.warningText}>
              Backend service not configured. Use Quick Import to set up.
            </Text>
          </View>
        )}

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
          <TouchableOpacity 
            style={[styles.primaryButton, !backendConfigured && styles.disabledButton]} 
            onPress={handleSignIn}
            disabled={!backendConfigured}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, !backendConfigured && styles.disabledSecondaryButton]} 
            onPress={handleRegister}
            disabled={!backendConfigured}
          >
            <Text style={[styles.secondaryButtonText, !backendConfigured && styles.disabledSecondaryButtonText]}>
              Register as Agent
            </Text>
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FF9500",
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
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
  disabledButton: {
    backgroundColor: "#CCCCCC",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 1,
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
  disabledSecondaryButton: {
    borderColor: "#CCCCCC",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  disabledSecondaryButtonText: {
    color: "#CCCCCC",
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
