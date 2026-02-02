
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/utils/api";

interface CandidateTally {
  firstName: string;
  lastName: string;
  partyName: string;
  totalVotes: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [candidateTallies, setCandidateTallies] = useState<CandidateTally[]>([]);

  useEffect(() => {
    console.log("Dashboard screen loaded");
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log("[Dashboard] Loading dashboard data");
    setLoading(true);
    try {
      const tallies = await apiGet<CandidateTally[]>("/api/reports/candidate-tallies");
      console.log("[Dashboard] Candidate tallies loaded:", tallies);
      setCandidateTallies(tallies);
    } catch (error) {
      console.error("[Dashboard] Error loading dashboard data:", error);
      setCandidateTallies([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const reportCards = [
    {
      title: "Candidate Tallies",
      icon: "poll" as const,
      description: "View all candidate vote counts",
      route: "/reports/candidate-tallies",
    },
    {
      title: "County Tallies",
      icon: "map" as const,
      description: "Filter results by county",
      route: "/reports/county-tallies",
    },
    {
      title: "Incident Videos",
      icon: "videocam" as const,
      description: "View recorded incidents",
      route: "/reports/incident-videos",
    },
    {
      title: "Form 34A Search",
      icon: "description" as const,
      description: "Search forms by agent code",
      route: "/reports/form-search",
    },
    {
      title: "Discrepancies",
      icon: "warning" as const,
      description: "Serial number issues",
      route: "/reports/discrepancies",
    },
    {
      title: "Missing Submissions",
      icon: "error" as const,
      description: "Stations without results",
      route: "/reports/missing-submissions",
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("@/assets/images/16c30a17-865f-4ec0-8d78-4cb83856d9a1.png")}
              style={styles.logoSmall}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.logo}>CIVIC</Text>
              <Text style={styles.slogan}>WANJIKU@63</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => console.log("Notifications tapped")}
          >
            <IconSymbol
              ios_icon_name="bell.fill"
              android_material_icon_name="notifications"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Electoral Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>
            Real-time presidential election results
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Candidates</Text>
          {candidateTallies.map((candidate, index) => {
            const fullName = `${candidate.firstName} ${candidate.lastName}`;
            const partyName = candidate.partyName;
            const votes = formatNumber(candidate.totalVotes);
            
            return (
              <View key={index} style={styles.candidateCard}>
                <View style={styles.candidateRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{fullName}</Text>
                  <Text style={styles.candidateParty}>{partyName}</Text>
                </View>
                <View style={styles.candidateVotes}>
                  <Text style={styles.votesNumber}>{votes}</Text>
                  <Text style={styles.votesLabel}>votes</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.reportsGrid}>
            {reportCards.map((report, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reportCard}
                onPress={() => console.log(`Navigate to ${report.route}`)}
              >
                <IconSymbol
                  ios_icon_name={report.icon}
                  android_material_icon_name={report.icon}
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDescription}>{report.description}</Text>
              </TouchableOpacity>
            ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoSmall: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  slogan: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: "600",
  },
  notificationButton: {
    padding: 8,
  },
  welcomeCard: {
    ...commonStyles.card,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textLight,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  candidateCard: {
    ...commonStyles.card,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  candidateRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textLight,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  candidateParty: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  candidateVotes: {
    alignItems: "flex-end",
  },
  votesNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  votesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reportCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  reportDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
});
