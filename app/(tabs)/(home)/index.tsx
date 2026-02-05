import React, { useState, useEffect, useCallback } from "react";
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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    videoCount: 0,
    hasForm34A: false,
  });

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    console.log("[Home] Loading dashboard data");
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load profile
      const profileData = await authenticatedGet<AgentProfile>("/api/agents/profile");
      console.log("[Home] Profile loaded:", profileData);
      setProfile(profileData);

      // Load agent stats
      if (user?.id) {
        try {
          const videos = await authenticatedGet<any[]>(`/api/incidents/agent-videos/${user.id}`);
          console.log("[Home] Agent videos:", videos.length);
          
          let hasForm = false;
          try {
            const form = await authenticatedGet<any>(`/api/forms/agent-form/${user.id}`);
            hasForm = !!form;
          } catch (formError: any) {
            if (!formError.message?.includes("404")) {
              console.error("[Home] Error checking form:", formError);
            }
          }

          setStats({
            videoCount: videos.length,
            hasForm34A: hasForm,
          });
        } catch (error: any) {
          console.error("[Home] Error loading stats:", error);
        }
      }
    } catch (error: any) {
      console.error("[Home] Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log("Home screen loaded");
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    loadDashboardData(true);
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

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.agentName}>{fullName}</Text>
          <View style={styles.agentCodeBadge}>
            <Text style={styles.agentCodeLabel}>Agent ID:</Text>
            <Text style={styles.agentCodeValue}>{agentCode}</Text>
          </View>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.locationTitle}>Assigned Location</Text>
          </View>
          <Text style={styles.locationText}>{location}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          
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
            onPress={() => router.push("/(tabs)/profile")}
          >
            <View style={styles.actionIconContainer}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="person"
                size={32}
                color={colors.secondary}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Profile</Text>
              <Text style={styles.actionSubtitle}>
                View and edit your profile information
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
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
    marginBottom: 20,
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
  welcomeCard: {
    ...commonStyles.card,
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    marginBottom: 4,
  },
  agentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textLight,
    marginBottom: 12,
  },
  agentCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  agentCodeLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 6,
  },
  agentCodeValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textLight,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  locationCard: {
    ...commonStyles.card,
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
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
  actionsSection: {
    marginBottom: 24,
  },
  actionCard: {
    ...commonStyles.card,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
});
