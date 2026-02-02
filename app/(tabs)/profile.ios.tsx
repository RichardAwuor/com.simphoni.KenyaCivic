
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";

interface AgentProfile {
  agentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  countyName: string;
  constituencyName: string;
  wardName: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    console.log("Profile screen loaded");
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log("Loading agent profile");
    setLoading(true);
    try {
      // TODO: Backend Integration - GET /api/auth/agent-profile
      // Returns: agent profile with agentCode and name
      
      // Simulate data for now
      const mockProfile: AgentProfile = {
        agentCode: "MOMBASA-001-0001-01",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        countyName: "MOMBASA",
        constituencyName: "CHANGAMWE",
        wardName: "PORT REITZ",
      };
      
      setProfile(mockProfile);
      setFirstName(mockProfile.firstName);
      setLastName(mockProfile.lastName);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    console.log("User tapped Save Profile");
    
    if (!firstName || !lastName) {
      Alert.alert("Error", "Please enter first and last name");
      return;
    }

    setLoading(true);
    try {
      // TODO: Backend Integration - PUT /api/auth/update-agent-profile
      // Body: { firstName, lastName }
      // Returns: updated agent profile
      
      console.log("Saving profile:", { firstName, lastName });
      
      if (profile) {
        setProfile({ ...profile, firstName, lastName });
      }
      
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("User confirmed sign out");
    setShowSignOutModal(false);
    
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const agentCodeText = profile?.agentCode || "N/A";
  const fullNameText = profile ? `${profile.firstName} ${profile.lastName}` : "N/A";
  const emailText = profile?.email || "N/A";
  const locationText = profile
    ? `${profile.countyName} > ${profile.constituencyName} > ${profile.wardName}`
    : "N/A";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <IconSymbol
              ios_icon_name={editing ? "xmark" : "pencil"}
              android_material_icon_name={editing ? "close" : "edit"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.agentCodeCard}>
          <Text style={styles.agentCodeLabel}>Agent ID Code</Text>
          <Text style={styles.agentCodeValue}>{agentCodeText}</Text>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={24}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{fullNameText}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={24}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{emailText}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={24}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{locationText}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Change password tapped")}
          >
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Change Password</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Biometric settings tapped")}
          >
            <IconSymbol
              ios_icon_name="faceid"
              android_material_icon_name="fingerprint"
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionButtonText}>Biometric Authentication</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={() => setShowSignOutModal(true)}
          >
            <IconSymbol
              ios_icon_name="arrow.right.square.fill"
              android_material_icon_name="logout"
              size={24}
              color={colors.error}
            />
            <Text style={[styles.actionButtonText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  editButton: {
    padding: 8,
  },
  agentCodeCard: {
    ...commonStyles.card,
    backgroundColor: colors.primary,
    alignItems: "center",
    marginBottom: 24,
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
    fontFamily: "Courier",
  },
  editForm: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
    marginBottom: 16,
  },
  saveButton: {
    ...commonStyles.button,
    marginTop: 8,
  },
  saveButtonText: {
    ...commonStyles.buttonText,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    ...commonStyles.card,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    ...commonStyles.card,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutText: {
    color: colors.error,
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
