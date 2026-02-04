
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Location from "expo-location";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedGet } from "@/utils/api";

export default function OnLocationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [videoCount, setVideoCount] = useState(0);
  const [hasForm34A, setHasForm34A] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const requestLocationPermission = React.useCallback(async () => {
    console.log("[OnLocation] Requesting location permission");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("[OnLocation] Location permission denied");
        showAlert("Permission Denied", "Location permission is required to record incidents");
        return;
      }
      
      console.log("[OnLocation] Location permission granted, getting current position...");
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("[OnLocation] Location obtained:", currentLocation.coords);
    } catch (error) {
      console.error("[OnLocation] Error getting location:", error);
      showAlert("Location Error", "Unable to get your current location. Please check your device settings.");
    }
  }, []);

  const checkAgentStatus = React.useCallback(async () => {
    console.log("[OnLocation] Checking agent status");
    
    if (!user?.id) {
      console.log("[OnLocation] No user ID available");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("[OnLocation] Fetching agent videos from API...");
      const videos = await authenticatedGet<any[]>(`/api/incidents/agent-videos/${user.id}`);
      console.log("[OnLocation] Agent videos fetched:", videos.length, "videos");
      setVideoCount(videos.length);
      
      try {
        console.log("[OnLocation] Fetching agent form from API...");
        const form = await authenticatedGet<any>(`/api/forms/agent-form/${user.id}`);
        console.log("[OnLocation] Agent form fetched:", form);
        setHasForm34A(!!form);
      } catch (formError: any) {
        if (formError.message?.includes("404")) {
          console.log("[OnLocation] No form 34A found (404)");
          setHasForm34A(false);
        } else {
          throw formError;
        }
      }
    } catch (error: any) {
      console.error("[OnLocation] Error checking agent status:", error);
      showAlert("Error", "Unable to load your agent status. Please try again.");
      setVideoCount(0);
      setHasForm34A(false);
    } finally {
      setIsLoading(false);
      console.log("[OnLocation] Agent status check complete");
    }
  }, [user?.id]);

  useEffect(() => {
    console.log("[OnLocation] Screen mounted");
    console.log("[OnLocation] User state:", user ? `User ID: ${user.id}, Agent Code: ${user.agentCode}` : "No user logged in");
    
    if (!user) {
      console.log("[OnLocation] Cannot load data - user not authenticated");
      return;
    }
    
    requestLocationPermission();
    checkAgentStatus();
  }, [requestLocationPermission, checkAgentStatus, user]);

  const handleRecordVideo = () => {
    console.log("[OnLocation] User tapped Record Incident Video");
    
    if (videoCount >= 3) {
      showAlert("Limit Reached", "You have already recorded the maximum of 3 videos");
      return;
    }
    
    if (!location) {
      showAlert("Location Required", "Please enable location services to record incidents");
      return;
    }
    
    router.push("/camera");
  };

  const handleScanForm = () => {
    console.log("[OnLocation] User tapped Scan Form 34A");
    
    if (hasForm34A) {
      showAlert("Already Submitted", "You have already submitted Form 34A");
      return;
    }
    
    router.push("/scan-form");
  };

  const handleNavigateToReports = () => {
    console.log("[OnLocation] User tapped My Reports");
    router.push("/(tabs)/my-reports");
  };

  const handleRefresh = async () => {
    console.log("[OnLocation] User initiated refresh");
    setIsRefreshing(true);
    await Promise.all([
      requestLocationPermission(),
      checkAgentStatus()
    ]);
    setIsRefreshing(false);
    console.log("[OnLocation] Refresh complete");
  };

  const locationText = location
    ? `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}`
    : "Location not available";

  const videoCountText = `${videoCount}/3`;
  const formStatusText = hasForm34A ? "Submitted" : "Not Submitted";

  // Show message if user is not authenticated
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centeredContainer}>
          <IconSymbol
            ios_icon_name="person.fill.xmark"
            android_material_icon_name="person-off"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.notAuthenticatedTitle}>Authentication Required</Text>
          <Text style={styles.notAuthenticatedMessage}>
            Please sign in to access On-Location features
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.signInButtonText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/16c30a17-865f-4ec0-8d78-4cb83856d9a1.png")}
            style={styles.logoSmall}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>On-Location</Text>
            <Text style={styles.subtitle}>Report incidents and submit Form 34A</Text>
          </View>
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.headerLoader} />
          )}
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.locationTitle}>Current Location</Text>
          </View>
          <Text style={styles.locationText}>{locationText}</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <IconSymbol
                ios_icon_name="video.fill"
                android_material_icon_name="videocam"
                size={32}
                color={videoCount >= 3 ? colors.disabled : colors.primary}
              />
              <Text style={styles.statusLabel}>Videos Recorded</Text>
              <Text style={styles.statusValue}>{videoCountText}</Text>
            </View>
            
            <View style={styles.statusDivider} />
            
            <View style={styles.statusItem}>
              <IconSymbol
                ios_icon_name="doc.fill"
                android_material_icon_name="description"
                size={32}
                color={hasForm34A ? colors.success : colors.warning}
              />
              <Text style={styles.statusLabel}>Form 34A</Text>
              <Text style={styles.statusValue}>{formStatusText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              videoCount >= 3 && styles.actionButtonDisabled,
            ]}
            onPress={handleRecordVideo}
            disabled={videoCount >= 3}
          >
            <View style={styles.actionButtonContent}>
              <IconSymbol
                ios_icon_name="video.fill"
                android_material_icon_name="videocam"
                size={32}
                color={videoCount >= 3 ? colors.disabled : colors.textLight}
              />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Record Incident Video</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Max 1 minute per video
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.actionButtonSecondary,
              hasForm34A && styles.actionButtonDisabled,
            ]}
            onPress={handleScanForm}
            disabled={hasForm34A}
          >
            <View style={styles.actionButtonContent}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={32}
                color={hasForm34A ? colors.disabled : colors.primary}
              />
              <View style={styles.actionButtonText}>
                <Text style={[styles.actionButtonTitle, styles.actionButtonTitleSecondary]}>
                  Scan & Submit Form 34A
                </Text>
                <Text style={[styles.actionButtonSubtitle, styles.actionButtonSubtitleSecondary]}>
                  One form per agent
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAccessSection}>
          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={handleNavigateToReports}
          >
            <View style={styles.quickAccessIconContainer}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={32}
                color={colors.textLight}
              />
            </View>
            <View style={styles.quickAccessContent}>
              <Text style={styles.quickAccessTitle}>My Reports</Text>
              <Text style={styles.quickAccessSubtitle}>
                View your profile and dashboard
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.info}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Videos are automatically named with your agent code and sequence (A, B, C)
            </Text>
            <Text style={styles.infoText}>
              • Geo-location is captured with each video
            </Text>
            <Text style={styles.infoText}>
              • Form 34A is scanned and validated automatically
            </Text>
            <Text style={styles.infoText}>
              • Serial numbers are checked for consistency
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAlertModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{alertTitle}</Text>
            <Text style={styles.modalMessage}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? 48 : 0,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  notAuthenticatedMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textLight,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoSmall: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerLoader: {
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  locationCard: {
    ...commonStyles.card,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  statusCard: {
    ...commonStyles.card,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  statusDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textLight,
    marginBottom: 4,
  },
  actionButtonTitleSecondary: {
    color: colors.primary,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },
  actionButtonSubtitleSecondary: {
    color: colors.textSecondary,
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textLight,
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },
  infoCard: {
    ...commonStyles.card,
    flexDirection: "row",
    backgroundColor: colors.highlight,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButton: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
});
