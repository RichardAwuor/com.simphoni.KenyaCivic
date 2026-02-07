
import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { apiPost } from "@/utils/api";

// Import all batch data
import batch2Data from "@/registration-data-batch-2.json";
import batch3Data from "@/registration-data-batch-3.json";
import batch4Data from "@/registration-data-batch-4.json";
import batch5Data from "@/registration-data-batch-5.json";
import batch6Data from "@/registration-data-batch-6.json";
import batch7Data from "@/registration-data-batch-7.json";
import batch8Data from "@/registration-data-batch-8.json";
import batch9Data from "@/registration-data-batch-9.json";
import batch10Data from "@/registration-data-batch-10.json";

interface PollingStation {
  countyCode: string;
  countyName: string;
  constituencyCode: string;
  constituencyName: string;
  wardCode: string;
  wardName: string;
  pollingStationCode?: string;
  pollingStationName?: string;
  registeredVoters?: number;
}

export default function AdminImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  useEffect(() => {
    console.log("[AdminImport] Screen loaded with params:", params);
  }, [params]);

  const showAlert = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleQuickImport = async () => {
    console.log("[AdminImport] User tapped Quick Import - importing all batches");
    
    // Combine all batch data
    const allData = [
      ...batch2Data,
      ...batch3Data,
      ...batch4Data,
      ...batch5Data,
      ...batch6Data,
      ...batch7Data,
      ...batch8Data,
      ...batch9Data,
      ...batch10Data,
    ];

    console.log("[AdminImport] Total records to import:", allData.length);

    setLoading(true);
    try {
      const response = await apiPost("/api/locations/import", {
        locations: allData,
      });

      console.log("[AdminImport] Import successful:", response);
      showAlert(
        "Import Successful",
        `Successfully imported ${allData.length} location records from all batches (2-10).`
      );
    } catch (error: any) {
      console.error("[AdminImport] Import error:", error);
      showAlert("Import Failed", error.message || "Failed to import location data");
    } finally {
      setLoading(false);
    }
  };

  const handleOneDriveImport = async () => {
    console.log("[AdminImport] User tapped OneDrive Import");
    showAlert(
      "OneDrive Import",
      "OneDrive import functionality is not yet implemented. Please use Quick Import or JSON Import instead."
    );
  };

  const loadSampleData = () => {
    console.log("[AdminImport] Loading sample data into JSON input");
    const sampleData = [
      {
        countyCode: "001",
        countyName: "MOMBASA",
        constituencyCode: "001",
        constituencyName: "CHANGAMWE",
        wardCode: "0001",
        wardName: "PORT REITZ",
        pollingStationCode: "001001000100101",
        pollingStationName: "BOMU PRIMARY SCHOOL",
        registeredVoters: 673,
      },
    ];
    setJsonInput(JSON.stringify(sampleData, null, 2));
  };

  const handleJsonImport = async () => {
    console.log("[AdminImport] User tapped JSON Import");

    if (!jsonInput.trim()) {
      showAlert("Error", "Please enter JSON data to import");
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsedData)) {
        showAlert("Error", "JSON data must be an array of location records");
        return;
      }

      console.log("[AdminImport] Parsed JSON data:", parsedData.length, "records");

      setLoading(true);
      const response = await apiPost("/api/locations/import", {
        locations: parsedData,
      });

      console.log("[AdminImport] Import successful:", response);
      showAlert(
        "Import Successful",
        `Successfully imported ${parsedData.length} location records from JSON input.`
      );
      setJsonInput("");
    } catch (error: any) {
      console.error("[AdminImport] JSON Import error:", error);
      if (error instanceof SyntaxError) {
        showAlert("Invalid JSON", "The JSON data is not valid. Please check the format and try again.");
      } else {
        showAlert("Import Failed", error.message || "Failed to import location data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    console.log("[AdminImport] User tapped Back");
    router.back();
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="square.and.arrow.down.fill"
            android_material_icon_name="cloud-download"
            size={64}
            color={colors.primary}
          />
          <Text style={styles.title}>Data Import</Text>
          <Text style={styles.subtitle}>
            Import location data (Counties, Constituencies, Wards, Polling Stations)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Import (All Batches)</Text>
          <Text style={styles.sectionDescription}>
            Import all available location data from batches 2-10 in one click.
            This includes data for multiple counties including MANDERA (complete), MARSABIT, MERU, MIGORI, and MOMBASA.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleQuickImport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="bolt.fill"
                  android_material_icon_name="flash-on"
                  size={20}
                  color={colors.textLight}
                />
                <Text style={styles.buttonText}>Quick Import All Batches</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OneDrive Import</Text>
          <Text style={styles.sectionDescription}>
            Import location data from a OneDrive Excel file.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
            onPress={handleOneDriveImport}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="cloud.fill"
              android_material_icon_name="cloud"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Import from OneDrive
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JSON Import</Text>
          <Text style={styles.sectionDescription}>
            Paste JSON data directly to import custom location records.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={loadSampleData}
          >
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="description"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
              Load Sample Data
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.jsonInput}
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder="Paste JSON data here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleJsonImport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="square.and.arrow.up.fill"
                  android_material_icon_name="cloud-upload"
                  size={20}
                  color={colors.textLight}
                />
                <Text style={styles.buttonText}>Import JSON Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Note: Location data is now embedded directly in the registration screen.
            This import is optional and only needed if you want to populate the backend database.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={48}
              color={colors.success}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleModalClose}
            >
              <Text style={styles.buttonText}>OK</Text>
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
  scrollContent: {
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: Platform.OS === "android" ? 24 : 0,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tertiaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  tertiaryButtonText: {
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  jsonInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    minHeight: 200,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
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
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
});
