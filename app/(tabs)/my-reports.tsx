
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedGet } from "@/utils/api";

interface AgentProfile {
  agentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  countyName: string;
  constituencyName: string;
  wardName: string;
}

interface DashboardStats {
  videoCount: number;
  hasForm34A: boolean;
  totalAgents?: number;
  totalSubmissions?: number;
}

export default function MyReportsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    videoCount: 0,
    hasForm34A: false,
  });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const loadData = async (isRefresh = false) => {
    console.log("[MyReports] Loading data");
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load profile
      const profileData = await authenticatedGet<AgentProfile>("/api/agents/profile");
      console.log("[MyReports] Profile loaded:", profileData);
      setProfile(profileData);

      // Load agent stats
      if (user?.id) {
        try {
          const videos = await authenticatedGet<any[]>(`/api/incidents/agent-videos/${user.id}`);
          console.log("[MyReports] Agent videos:", videos.length);
          
          let hasForm = false;
          try {
            const form = await authenticatedGet<any>(`/api/forms/agent-form/${user.id}`);
            hasForm = !!form;
          } catch (formError: any) {
            if (!formError.message?.includes("404")) {
              console.error("[MyReports] Error checking form:", formError);
            }
          }

          setStats({
            videoCount: videos.length,
            hasForm34A: hasForm,
          });
        } catch (error: any) {
          console.error("[MyReports] Error loading stats:", error);
        }
      }
    } catch (error: any) {
      console.error("[MyReports] Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("My Reports screen loaded");
    loadData();
  }, [user?.id]);

  const onRefresh = () => {
    loadData(true);
  };

  const handleSignOut = async () => {
    console.log("[MyReports] User confirmed sign out");
    setShowSignOutModal(false);
    
    try {
      await signOut();
      router.replace("/auth");
    } catch (error: any) {
      console.error("[MyReports] Error signing out:", error);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Agent";
  const agentCode = profile?.agentCode || "N/A";
  const emailText = profile?.email || "N/A";
  const location = profile
    ? `${profile.countyName} > ${profile.constituencyName} > ${profile.wardName}`
    : "Location not set";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/16c30a17-865f-4ec0-8d78-4cb83856d9a1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.appName}>CIVIC</Text>
            <Text style={styles.slogan}>WANJIKU@63</Text>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Agent Profile</Text>
          
          <View style={styles.agentCodeCard}>
            <Text style={styles.agentCodeLabel}>Agent ID Code</Text>
            <Text style={styles.agentCodeValue}>{agentCode}</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={24}
                color={colors.primary}
              />
              <View style={styles.profileContent}>
                <Text style={styles.profileLabel}>Full Name</Text>
                <Text style={styles.profileValue}>{fullName}</Text>
              </View>
            </View>

            <View style={styles.profileRow}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={24}
                color={colors.primary}
              />
              <View style={styles.profileContent}>
                <Text style={styles.profileLabel}>Email</Text>
                <Text style={styles.profileValue}>{emailText}</Text>
              </View>
            </View>

            <View style={styles.profileRow}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={24}
                color={colors.primary}
              />
              <View style={styles.profileContent}>
                <Text style={styles.profileLabel}>Location</Text>
                <Text style={styles.profileValue}>{location}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol
                ios_icon_name="video.fill"
                android_material_icon_name="videocam"
                size={32}
                color={stats.videoCount >= 3 ? colors.success : colors.warning}
              />
              <Text style={styles.statValue}>{stats.videoCount}/3</Text>
              <Text style={styles.statLabel}>Incident Videos</Text>
            </View>

            <View style={styles.statCard}>
              <IconSymbol
                ios_icon_name="doc.fill"
                android_material_icon_name="description"
                size={32}
                color={stats.hasForm34A ? colors.success : colors.error}
              />
              <Text style={styles.statValue}>
                {stats.hasForm34A ? "✓" : "✗"}
              </Text>
              <Text style={styles.statLabel}>Form 34A</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.progressTitle}>Submission Progress</Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressItemLabel}>Videos</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${(stats.videoCount / 3) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressItemValue}>{stats.videoCount}/3</Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressItemLabel}>Form 34A</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: stats.hasForm34A ? "100%" : "0%" }
                  ]} 
                />
              </View>
              <Text style={styles.progressItemValue}>
                {stats.hasForm34A ? "Complete" : "Pending"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/on-location")}
          >
            <View style={styles.actionIconContainer}>
              <IconSymbol
                ios_icon_name="location.circle.fill"
                android_material_icon_name="location-on"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>On-Location</Text>
              <Text style={styles.actionSubtitle}>
                Record incidents and submit Form 34A
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/admin-import")}
          >
            <View style={styles.actionIconContainer}>
              <IconSymbol
                ios_icon_name="cloud.fill"
                android_material_icon_name="cloud-download"
                size={32}
                color={colors.secondary}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>OneDrive Import</Text>
              <Text style={styles.actionSubtitle}>
                Import data from OneDrive
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.signOutCard]}
            onPress={() => setShowSignOutModal(true)}
          >
            <View style={styles.actionIconContainer}>
              <IconSymbol
                ios_icon_name="arrow.right.square.fill"
                android_material_icon_name="logout"
                size={32}
                color={colors.error}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.signOutText]}>Sign Out</Text>
              <Text style={styles.actionSubtitle}>
                Log out of your account
              </Text>
            </View>
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
            <Text style={styles.infoTitle}>Important Reminders</Text>
            <Text style={styles.infoText}>
              • Record up to 3 incident videos (max 1 minute each)
            </Text>
            <Text style={styles.infoText}>
              • Submit Form 34A with clear photos
            </Text>
            <Text style={styles.infoText}>
              • Ensure location services are enabled
            </Text>
            <Text style={styles.infoText}>
              • All submissions are timestamped and geotagged
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSignOut}
              >
                <Text style={styles.modalButtonTextConfirm}>Sign Out</Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  slogan: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "600",
  },
  profileSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  agentCodeCard: {
    ...commonStyles.card,
    backgroundColor: colors.primary,
    alignItems: "center",
    marginBottom: 16,
  },
  agentCodeLabel: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    marginBottom: 4,
  },
  agentCodeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textLight,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  profileCard: {
    ...commonStyles.card,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileContent: {
    flex: 1,
    marginLeft: 16,
  },
  profileLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  dashboardSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    ...commonStyles.card,
    alignItems: "center",
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  progressCard: {
    ...commonStyles.card,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressItemLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressItemValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionCard: {
    ...commonStyles.card,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  signOutCard: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  signOutText: {
    color: colors.error,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoCard: {
    ...commonStyles.card,
    flexDirection: "row",
    backgroundColor: colors.highlight,
    marginBottom: 24,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.error,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
});
