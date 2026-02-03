
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { apiPost } from "@/utils/api";

interface PollingStation {
  countyCode: string;
  countyName: string;
  constituencyCode: string;
  constituencyName: string;
  wardCode: string;
  wardName: string;
  pollingStationCode: string;
  pollingStationName: string;
  registeredVoters: number;
}

export default function AdminImportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [oneDriveUrl, setOneDriveUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const showAlert = (title: string, message: string) => {
    console.log("Admin Import Alert:", title, message);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleOneDriveImport = async () => {
    console.log("User tapped Import from OneDrive button");
    
    if (!oneDriveUrl.trim()) {
      showAlert("Missing Information", "Please enter the OneDrive file URL");
      return;
    }

    if (!accessToken.trim()) {
      showAlert("Missing Information", "Please enter your Microsoft access token");
      return;
    }

    setLoading(true);

    try {
      console.log("[OneDrive Import] Starting import from:", oneDriveUrl);
      
      const response = await apiPost("/api/onedrive/import-excel", {
        fileUrl: oneDriveUrl,
        accessToken: accessToken,
      });

      console.log("[OneDrive Import] Response received:", response);

      // Handle the response
      if (response.error) {
        // Backend returned an error
        showAlert("Import Failed", response.error || response.message || "Unknown error occurred");
        return;
      }

      const imported = response.imported || 0;
      const failed = response.failed || 0;
      const total = imported + failed;

      if (total === 0) {
        showAlert("Import Complete", "No polling stations were imported. Please check your Excel file format.");
        return;
      }

      const successMessage = `Successfully imported ${imported} out of ${total} polling stations from OneDrive.`;
      const failureMessage = failed > 0 ? ` ${failed} failed.` : "";
      const fullMessage = successMessage + failureMessage;

      showAlert("Import Complete", fullMessage);
      
      // Clear form on success
      setOneDriveUrl("");
      setAccessToken("");
    } catch (error: any) {
      console.error("[OneDrive Import] Error:", error);
      
      // Parse error message from API response
      let errorMessage = "Failed to import from OneDrive. Please check your URL and access token.";
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      showAlert("Import Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log("User tapped back button");
            router.back();
          }}
          style={styles.backButton}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OneDrive Import</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <IconSymbol
            ios_icon_name="cloud.fill"
            android_material_icon_name="cloud-download"
            size={64}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Import from Microsoft OneDrive</Text>
        <Text style={styles.subtitle}>
          Import polling station data directly from an Excel file stored in OneDrive
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>OneDrive File URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://onedrive.live.com/..."
            placeholderTextColor={colors.textSecondary}
            value={oneDriveUrl}
            onChangeText={setOneDriveUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={styles.formLabel}>Microsoft Access Token</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your Microsoft Graph API access token"
            placeholderTextColor={colors.textSecondary}
            value={accessToken}
            onChangeText={setAccessToken}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Your Excel file should have columns: County Code, County Name, Const Code, Const. Name, CAW Code, CAW Name, Polling Station Code, Polling Station Name, Registered Voters
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.importButton, loading && styles.importButtonDisabled]}
          onPress={handleOneDriveImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="arrow.down.circle.fill"
                android_material_icon_name="cloud-download"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.importButtonText}>Import from OneDrive</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>How to get your access token:</Text>
          <View style={styles.helpStep}>
            <Text style={styles.helpStepNumber}>1.</Text>
            <Text style={styles.helpStepText}>
              Go to Microsoft Graph Explorer: https://developer.microsoft.com/en-us/graph/graph-explorer
            </Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={styles.helpStepNumber}>2.</Text>
            <Text style={styles.helpStepText}>
              Sign in with your Microsoft account
            </Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={styles.helpStepNumber}>3.</Text>
            <Text style={styles.helpStepText}>
              Copy the access token from the "Access token" tab
            </Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={styles.helpStepNumber}>4.</Text>
            <Text style={styles.helpStepText}>
              Paste it in the field above
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                console.log("User dismissed modal");
                setModalVisible(false);
              }}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight || colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
    lineHeight: 18,
  },
  importButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  helpSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  helpStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  helpStepNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: 8,
    width: 20,
  },
  helpStepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
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
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
