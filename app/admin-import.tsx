
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
  const [importProgress, setImportProgress] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [activeTab, setActiveTab] = useState<"json" | "onedrive" | "quick">("quick");

  useEffect(() => {
    // Check if we came from registration screen
    if (params.from === "register") {
      console.log("[AdminImport] Navigated from registration screen");
    }
  }, [params]);

  const showAlert = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(title.toLowerCase().includes("error") ? "error" : "success");
    setShowModal(true);
  };

  const handleQuickImport = async () => {
    console.log("[AdminImport] Starting quick import of all batch files");
    setLoading(true);
    setImportProgress("Preparing to import all batch files...");

    try {
      const batches = [
        { name: "Batch 2", data: batch2Data },
        { name: "Batch 3", data: batch3Data },
        { name: "Batch 4", data: batch4Data },
        { name: "Batch 5", data: batch5Data },
        { name: "Batch 6", data: batch6Data },
        { name: "Batch 7", data: batch7Data },
      ];

      let totalImported = 0;
      let totalRecords = 0;

      for (const batch of batches) {
        totalRecords += batch.data.length;
      }

      for (const batch of batches) {
        setImportProgress(`Importing ${batch.name} (${batch.data.length} records)...`);
        console.log(`[AdminImport] Importing ${batch.name} with ${batch.data.length} records`);

        const response = await apiPost("/api/polling-stations/bulk-import", {
          stations: batch.data,
        });

        totalImported += response.imported || batch.data.length;
        console.log(`[AdminImport] ${batch.name} imported successfully`);
      }

      setImportProgress("");
      showAlert(
        "Import Successful",
        `Successfully imported ${totalImported} records from ${batches.length} batch files.\n\nYou can now proceed with agent registration.`
      );
    } catch (error: any) {
      console.error("[AdminImport] Quick import error:", error);
      setImportProgress("");
      showAlert("Import Error", error.message || "Failed to import batch files");
    } finally {
      setLoading(false);
    }
  };

  const handleOneDriveImport = async () => {
    console.log("[AdminImport] Starting OneDrive import");
    setLoading(true);
    setImportProgress("Connecting to OneDrive...");

    try {
      // Call the OneDrive import endpoint
      const response = await apiPost("/api/onedrive/import", {});
      
      setImportProgress("");
      showAlert(
        "Import Successful",
        `Successfully imported ${response.imported || 0} records from OneDrive.\n\nYou can now proceed with agent registration.`
      );
    } catch (error: any) {
      console.error("[AdminImport] OneDrive import error:", error);
      setImportProgress("");
      showAlert("Import Error", error.message || "Failed to import from OneDrive");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
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
    if (!jsonInput.trim()) {
      showAlert("Error", "Please paste JSON data or load sample data");
      return;
    }

    console.log("[AdminImport] Starting JSON import");
    setLoading(true);
    setImportProgress("Parsing JSON data...");

    try {
      const data = JSON.parse(jsonInput);
      const stations = Array.isArray(data) ? data : [data];

      setImportProgress(`Importing ${stations.length} records...`);
      console.log(`[AdminImport] Importing ${stations.length} records from JSON`);

      const response = await apiPost("/api/polling-stations/bulk-import", {
        stations,
      });

      setImportProgress("");
      showAlert(
        "Import Successful",
        `Successfully imported ${response.imported || stations.length} records.\n\nYou can now proceed with agent registration.`
      );
      setJsonInput("");
    } catch (error: any) {
      console.error("[AdminImport] JSON import error:", error);
      setImportProgress("");
      if (error.message.includes("JSON")) {
        showAlert("Parse Error", "Invalid JSON format. Please check your data and try again.");
      } else {
        showAlert("Import Error", error.message || "Failed to import data");
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
    if (modalType === "success") {
      // Navigate back to registration after successful import
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Import Location Data</Text>
        <Text style={styles.subtitle}>
          Import county, constituency, and ward data for agent registration
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "quick" && styles.activeTab]}
          onPress={() => setActiveTab("quick")}
        >
          <Text style={[styles.tabText, activeTab === "quick" && styles.activeTabText]}>
            Quick Import
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "json" && styles.activeTab]}
          onPress={() => setActiveTab("json")}
        >
          <Text style={[styles.tabText, activeTab === "json" && styles.activeTabText]}>
            JSON Import
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "onedrive" && styles.activeTab]}
          onPress={() => setActiveTab("onedrive")}
        >
          <Text style={[styles.tabText, activeTab === "onedrive" && styles.activeTabText]}>
            OneDrive
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "quick" && (
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                Quick Import will automatically import all pre-loaded batch files containing county, constituency, and ward data.
              </Text>
            </View>

            <View style={styles.batchInfo}>
              <Text style={styles.batchTitle}>Batch Files to Import:</Text>
              <Text style={styles.batchItem}>• Batch 2: MOMBASA</Text>
              <Text style={styles.batchItem}>• Batch 3: MOMBASA (continued)</Text>
              <Text style={styles.batchItem}>• Batch 4: MOMBASA (continued)</Text>
              <Text style={styles.batchItem}>• Batch 5: BUNGOMA, BUSIA, DIASPORA, ELGEYO/MARAKWET</Text>
              <Text style={styles.batchItem}>• Batch 6: EMBU, GARISSA, HOMA BAY, ISIOLO, KAJIADO, KAKAMEGA, KERICHO, KIAMBU (partial)</Text>
              <Text style={styles.batchItem}>• Batch 7: KIAMBU (complete), KILIFI, KIRINYAGA, KISII</Text>
            </View>

            <TouchableOpacity
              style={[styles.importButton, loading && styles.buttonDisabled]}
              onPress={handleQuickImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="arrow.down.circle.fill"
                    android_material_icon_name="cloud-download"
                    size={24}
                    color={colors.textLight}
                  />
                  <Text style={styles.importButtonText}>Import All Batches</Text>
                </>
              )}
            </TouchableOpacity>

            {importProgress && (
              <View style={styles.progressBox}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.progressText}>{importProgress}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "json" && (
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                Paste JSON data containing location records or load sample data to see the expected format.
              </Text>
            </View>

            <TouchableOpacity style={styles.sampleButton} onPress={loadSampleData}>
              <Text style={styles.sampleButtonText}>Load Sample Data</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.jsonInput}
              value={jsonInput}
              onChangeText={setJsonInput}
              placeholder="Paste JSON data here..."
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.importButton, loading && styles.buttonDisabled]}
              onPress={handleJsonImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="arrow.up.circle.fill"
                    android_material_icon_name="cloud-upload"
                    size={24}
                    color={colors.textLight}
                  />
                  <Text style={styles.importButtonText}>Import JSON Data</Text>
                </>
              )}
            </TouchableOpacity>

            {importProgress && (
              <View style={styles.progressBox}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.progressText}>{importProgress}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "onedrive" && (
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                Import location data directly from OneDrive. Make sure the file is shared and accessible.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.importButton, loading && styles.buttonDisabled]}
              onPress={handleOneDriveImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="cloud.fill"
                    android_material_icon_name="cloud"
                    size={24}
                    color={colors.textLight}
                  />
                  <Text style={styles.importButtonText}>Import from OneDrive</Text>
                </>
              )}
            </TouchableOpacity>

            {importProgress && (
              <View style={styles.progressBox}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.progressText}>{importProgress}</Text>
              </View>
            )}
          </View>
        )}
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
              ios_icon_name={modalType === "success" ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={modalType === "success" ? "check-circle" : "error"}
              size={48}
              color={modalType === "success" ? colors.success : colors.error}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={[
                styles.modalButton,
                modalType === "success" ? styles.modalButtonSuccess : styles.modalButtonError,
              ]}
              onPress={handleModalClose}
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
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  batchInfo: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  batchItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  sampleButton: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sampleButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  jsonInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    minHeight: 200,
    marginBottom: 20,
  },
  importButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  importButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  progressBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
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
  modalButton: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonSuccess: {
    backgroundColor: colors.success,
  },
  modalButtonError: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
});
