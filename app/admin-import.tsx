
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

// Import the batch data files
import batch2Data from "@/registration-data-batch-2.json";
import batch3Data from "@/registration-data-batch-3.json";
import batch4Data from "@/registration-data-batch-4.json";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [oneDriveUrl, setOneDriveUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [importMethod, setImportMethod] = useState<"quick" | "onedrive" | "json">("quick");
  const [jsonData, setJsonData] = useState("");
  const [importProgress, setImportProgress] = useState("");

  // Pre-fill from URL parameters if provided
  useEffect(() => {
    console.log("[Admin Import] URL params:", params);
    if (params.fileUrl && typeof params.fileUrl === 'string') {
      console.log("[Admin Import] Pre-filling file URL from params");
      setOneDriveUrl(params.fileUrl);
    }
    if (params.accessToken && typeof params.accessToken === 'string') {
      console.log("[Admin Import] Pre-filling access token from params");
      setAccessToken(params.accessToken);
    }
  }, [params]);

  const showAlert = (title: string, message: string) => {
    console.log("Admin Import Alert:", title, message);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleQuickImport = async () => {
    console.log("[Quick Import] User tapped Quick Import All Batches button");
    
    setLoading(true);
    setImportProgress("Preparing to import all registration data...");

    try {
      // Combine all batch data
      const allData = [
        ...batch2Data,
        ...batch3Data,
        ...batch4Data,
      ];

      console.log("[Quick Import] Total records to import:", allData.length);
      setImportProgress(`Importing ${allData.length} location records...`);

      // Transform data to match backend expectations
      const transformedStations = allData.map((station: any) => {
        // If station doesn't have pollingStationCode, create a placeholder
        if (!station.pollingStationCode) {
          const code = `${station.countyCode}${station.constituencyCode}${station.wardCode}001`;
          return {
            countyCode: station.countyCode,
            countyName: station.countyName,
            constituencyCode: station.constituencyCode,
            constituencyName: station.constituencyName,
            wardCode: station.wardCode,
            wardName: station.wardName,
            pollingStationCode: code,
            pollingStationName: `${station.wardName} - Default Station`,
            registeredVoters: station.registeredVoters || 0,
          };
        }
        
        return {
          countyCode: station.countyCode,
          countyName: station.countyName,
          constituencyCode: station.constituencyCode,
          constituencyName: station.constituencyName,
          wardCode: station.wardCode,
          wardName: station.wardName,
          pollingStationCode: station.pollingStationCode,
          pollingStationName: station.pollingStationName,
          registeredVoters: station.registeredVoters || 0,
        };
      });

      setImportProgress("Sending data to server...");

      const response = await apiPost("/api/polling-stations/bulk-import", {
        stations: transformedStations,
      });

      console.log("[Quick Import] Response received:", response);

      // Handle the response
      if (response.error) {
        showAlert("Import Failed", response.error || response.message || "Unknown error occurred");
        return;
      }

      const successful = response.summary?.successful || 0;
      const failed = response.summary?.failed || 0;
      const processed = response.summary?.processed || 0;

      const successMessage = `✅ Successfully imported ${successful} out of ${processed} location records!\n\nYou can now register agents with the following counties:\n\n• ELGEYO/MARAKWET\n• EMBU\n• GARISSA\n• HOMA BAY\n• ISIOLO\n• KAJIADO\n• MANDERA\n• MARSABIT\n• MERU\n• MIGORI\n• MOMBASA\n• MURANG'A\n• NAIROBI CITY\n• SAMBURU\n• SIAYA\n• TAITA TAVETA\n• TANA RIVER\n• THARAKA-NITHI\n• TRANS NZOIA\n• TURKANA\n• UASIN GISHU\n• VIHIGA\n• WAJIR\n• WEST POKOT`;
      const failureMessage = failed > 0 ? `\n\n⚠️ ${failed} records failed to import (likely duplicates).` : "";
      const fullMessage = successMessage + failureMessage;

      showAlert("Import Complete!", fullMessage);
      setImportProgress("");
    } catch (error: any) {
      console.error("[Quick Import] Error:", error);
      
      let errorMessage = "Failed to import data. Please try again or use manual JSON import.";
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      showAlert("Import Failed", errorMessage);
      setImportProgress("");
    } finally {
      setLoading(false);
    }
  };

  const handleOneDriveImport = async () => {
    console.log("User tapped Import from OneDrive button");
    
    if (!oneDriveUrl.trim()) {
      showAlert("Missing Information", "Please enter the OneDrive file URL or sharing link");
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
      const failureMessage = failed > 0 ? `\n\n${failed} rows failed to import.` : "";
      const errorDetails = response.errors && response.errors.length > 0 
        ? `\n\nFirst few errors:\n${response.errors.slice(0, 3).join('\n')}` 
        : "";
      const fullMessage = successMessage + failureMessage + errorDetails;

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

  const loadSampleData = () => {
    console.log("[JSON Import] Loading sample data");
    const sampleData = [
      {
        countyCode: "039",
        countyName: "BUNGOMA",
        constituencyCode: "001",
        constituencyName: "BUMULA",
        wardCode: "001",
        wardName: "KABULA",
        pollingStationCode: "039001001001",
        pollingStationName: "Kabula Primary School",
        registeredVoters: 1500
      },
      {
        countyCode: "039",
        countyName: "BUNGOMA",
        constituencyCode: "001",
        constituencyName: "BUMULA",
        wardCode: "002",
        wardName: "KHASOKO",
        pollingStationCode: "039001002001",
        pollingStationName: "Khasoko Secondary School",
        registeredVoters: 1200
      },
      {
        countyCode: "040",
        countyName: "BUSIA",
        constituencyCode: "001",
        constituencyName: "BUDALANGI",
        wardCode: "001",
        wardName: "BUNYALA CENTRAL"
        // Note: pollingStationCode, pollingStationName, and registeredVoters will be auto-generated
      }
    ];
    setJsonData(JSON.stringify(sampleData, null, 2));
  };

  const handleJsonImport = async () => {
    console.log("[JSON Import] User tapped Import JSON Data button");
    
    if (!jsonData.trim()) {
      showAlert("Missing Information", "Please enter JSON data to import");
      return;
    }

    setLoading(true);

    try {
      // Parse and validate JSON
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (parseError) {
        showAlert("Invalid JSON", "The JSON data is not valid. Please check the format and try again.");
        return;
      }

      // Ensure it's an array or has a stations property
      let stations = Array.isArray(parsedData) ? parsedData : parsedData.stations;
      
      if (!Array.isArray(stations) || stations.length === 0) {
        showAlert("Invalid Data", "JSON must be an array of polling stations or an object with a 'stations' property.");
        return;
      }

      console.log("[JSON Import] Importing", stations.length, "polling stations");

      // Transform data to match backend expectations
      const transformedStations = stations.map((station: any) => {
        // If station doesn't have pollingStationCode, create a placeholder
        if (!station.pollingStationCode) {
          const code = `${station.countyCode}${station.constituencyCode}${station.wardCode}001`;
          return {
            countyCode: station.countyCode,
            countyName: station.countyName,
            constituencyCode: station.constituencyCode,
            constituencyName: station.constituencyName,
            wardCode: station.wardCode,
            wardName: station.wardName,
            pollingStationCode: code,
            pollingStationName: `${station.wardName} - Default Station`,
            registeredVoters: station.registeredVoters || 0,
          };
        }
        
        return {
          countyCode: station.countyCode,
          countyName: station.countyName,
          constituencyCode: station.constituencyCode,
          constituencyName: station.constituencyName,
          wardCode: station.wardCode,
          wardName: station.wardName,
          pollingStationCode: station.pollingStationCode,
          pollingStationName: station.pollingStationName,
          registeredVoters: station.registeredVoters || 0,
        };
      });

      const response = await apiPost("/api/polling-stations/bulk-import", {
        stations: transformedStations,
      });

      console.log("[JSON Import] Response received:", response);

      // Handle the response
      if (response.error) {
        showAlert("Import Failed", response.error || response.message || "Unknown error occurred");
        return;
      }

      const successful = response.summary?.successful || 0;
      const failed = response.summary?.failed || 0;
      const processed = response.summary?.processed || 0;

      const successMessage = `Successfully imported ${successful} out of ${processed} polling stations.`;
      const failureMessage = failed > 0 ? `\n\n${failed} records failed to import.` : "";
      const fullMessage = successMessage + failureMessage;

      showAlert("Import Complete", fullMessage);
      
      // Clear form on success
      setJsonData("");
    } catch (error: any) {
      console.error("[JSON Import] Error:", error);
      
      let errorMessage = "Failed to import JSON data. Please check the format and try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      showAlert("Import Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const urlText = oneDriveUrl;
  const tokenText = accessToken;
  const progressText = importProgress;

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
        <Text style={styles.headerTitle}>Data Import</Text>
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

        <Text style={styles.title}>Import Polling Station Data</Text>
        <Text style={styles.subtitle}>
          Choose your import method: Quick import all batches, OneDrive Excel file, or manual JSON data
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, importMethod === "quick" && styles.tabActive]}
            onPress={() => setImportMethod("quick")}
          >
            <IconSymbol
              ios_icon_name="bolt.fill"
              android_material_icon_name="flash-on"
              size={20}
              color={importMethod === "quick" ? colors.textLight : colors.text}
            />
            <Text style={[styles.tabText, importMethod === "quick" && styles.tabTextActive]}>
              Quick Import
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, importMethod === "onedrive" && styles.tabActive]}
            onPress={() => setImportMethod("onedrive")}
          >
            <IconSymbol
              ios_icon_name="cloud.fill"
              android_material_icon_name="cloud-download"
              size={20}
              color={importMethod === "onedrive" ? colors.textLight : colors.text}
            />
            <Text style={[styles.tabText, importMethod === "onedrive" && styles.tabTextActive]}>
              OneDrive
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, importMethod === "json" && styles.tabActive]}
            onPress={() => setImportMethod("json")}
          >
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="code"
              size={20}
              color={importMethod === "json" ? colors.textLight : colors.text}
            />
            <Text style={[styles.tabText, importMethod === "json" && styles.tabTextActive]}>
              JSON Data
            </Text>
          </TouchableOpacity>
        </View>

        {importMethod === "quick" ? (
          <>
            <View style={styles.quickImportCard}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={48}
                color={colors.success}
              />
              <Text style={styles.quickImportTitle}>One-Click Import</Text>
              <Text style={styles.quickImportDescription}>
                Import all pre-loaded registration data for 24 counties with a single tap. This includes:
              </Text>
              
              <View style={styles.countyList}>
                <Text style={styles.countyListItem}>• ELGEYO/MARAKWET</Text>
                <Text style={styles.countyListItem}>• EMBU</Text>
                <Text style={styles.countyListItem}>• GARISSA</Text>
                <Text style={styles.countyListItem}>• HOMA BAY</Text>
                <Text style={styles.countyListItem}>• ISIOLO</Text>
                <Text style={styles.countyListItem}>• KAJIADO</Text>
                <Text style={styles.countyListItem}>• MANDERA</Text>
                <Text style={styles.countyListItem}>• MARSABIT</Text>
                <Text style={styles.countyListItem}>• MERU</Text>
                <Text style={styles.countyListItem}>• MIGORI</Text>
                <Text style={styles.countyListItem}>• MOMBASA</Text>
                <Text style={styles.countyListItem}>• MURANG'A</Text>
                <Text style={styles.countyListItem}>• NAIROBI CITY</Text>
                <Text style={styles.countyListItem}>• SAMBURU</Text>
                <Text style={styles.countyListItem}>• SIAYA</Text>
                <Text style={styles.countyListItem}>• TAITA TAVETA</Text>
                <Text style={styles.countyListItem}>• TANA RIVER</Text>
                <Text style={styles.countyListItem}>• THARAKA-NITHI</Text>
                <Text style={styles.countyListItem}>• TRANS NZOIA</Text>
                <Text style={styles.countyListItem}>• TURKANA</Text>
                <Text style={styles.countyListItem}>• UASIN GISHU</Text>
                <Text style={styles.countyListItem}>• VIHIGA</Text>
                <Text style={styles.countyListItem}>• WAJIR</Text>
                <Text style={styles.countyListItem}>• WEST POKOT</Text>
              </View>

              <View style={styles.statsBox}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>480+</Text>
                  <Text style={styles.statLabel}>Location Records</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Counties</Text>
                </View>
              </View>

              {progressText ? (
                <View style={styles.progressBox}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.progressText}>{progressText}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.importButton, styles.quickImportButton, loading && styles.importButtonDisabled]}
              onPress={handleQuickImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="bolt.fill"
                    android_material_icon_name="flash-on"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.importButtonText}>Import All Data Now</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                This will import all Counties, Constituencies, and Wards from the pre-loaded batch files. The process takes about 30 seconds.
              </Text>
            </View>
          </>
        ) : importMethod === "onedrive" ? (
          <>
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>OneDrive File URL or Sharing Link</Text>
              <TextInput
                style={styles.input}
                placeholder="https://1drv.ms/x/... or https://onedrive.live.com/..."
                placeholderTextColor={colors.textSecondary}
                value={urlText}
                onChangeText={setOneDriveUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.formLabel}>Microsoft Access Token</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your Microsoft Graph API access token"
                placeholderTextColor={colors.textSecondary}
                value={tokenText}
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
          </>
        ) : (
          <>
            <View style={styles.formCard}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>JSON Data</Text>
                <TouchableOpacity
                  style={styles.sampleButton}
                  onPress={loadSampleData}
                >
                  <IconSymbol
                    ios_icon_name="doc.text"
                    android_material_icon_name="description"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.sampleButtonText}>Load Sample</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.jsonTextArea]}
                placeholder='[{"countyCode":"039","countyName":"BUNGOMA","constituencyCode":"001","constituencyName":"BUMULA","wardCode":"001","wardName":"KABULA"}]'
                placeholderTextColor={colors.textSecondary}
                value={jsonData}
                onChangeText={setJsonData}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={10}
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
                  Paste JSON array of polling stations. Each station must have: countyCode, countyName, constituencyCode, constituencyName, wardCode, wardName. Optional: pollingStationCode, pollingStationName, registeredVoters
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.importButton, loading && styles.importButtonDisabled]}
              onPress={handleJsonImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="arrow.down.circle.fill"
                    android_material_icon_name="upload"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.importButtonText}>Import JSON Data</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </>
        )}

        <View style={styles.noteSection}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={20}
            color={colors.warning || colors.secondary}
          />
          <Text style={styles.noteText}>
            Note: After importing polling station data, agents will be able to select their county, constituency, and ward during registration.
          </Text>
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
            <ScrollView style={styles.modalMessageContainer}>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
            </ScrollView>
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
  quickImportCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
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
  quickImportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  quickImportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  countyList: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  countyListItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  statsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: colors.primaryLight || colors.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  progressBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    width: "100%",
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  formLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sampleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight || colors.lightGray,
    borderRadius: 6,
  },
  sampleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
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
    minHeight: 80,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  jsonTextArea: {
    minHeight: 200,
    paddingTop: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
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
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  tabTextActive: {
    color: colors.textLight,
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
  quickImportButton: {
    backgroundColor: colors.success,
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
  noteSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.warningLight || colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
    lineHeight: 18,
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
    width: "85%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessageContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
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
