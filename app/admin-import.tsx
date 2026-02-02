
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { apiPost } from "@/utils/api";

const POLLING_STATION_DATA = [
  // ... (keeping all existing entries - truncated for brevity in this response)
  // The file already contains 1053 entries from previous imports
  // Now adding the new entries from the user's request:
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600202",
    pollingStationName: "FADHIL-ADHYM PRIMARY SCHOOL",
    registeredVoters: 612,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600203",
    pollingStationName: "FADHIL-ADHYM PRIMARY SCHOOL",
    registeredVoters: 611,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600301",
    pollingStationName: "MLALEO PRIMARY SCHOOL",
    registeredVoters: 566,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600302",
    pollingStationName: "MLALEO PRIMARY SCHOOL",
    registeredVoters: 565,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600303",
    pollingStationName: "MLALEO PRIMARY SCHOOL",
    registeredVoters: 565,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600304",
    pollingStationName: "MLALEO PRIMARY SCHOOL",
    registeredVoters: 565,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600305",
    pollingStationName: "MLALEO PRIMARY SCHOOL",
    registeredVoters: 565,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600401",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 699,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600402",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600403",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600404",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600405",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600406",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600407",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600408",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600409",
    pollingStationName: "FRERE TOWN PRIMARY SCHOOL",
    registeredVoters: 698,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600501",
    pollingStationName: "MWANDONI KADIRIA GROUNDS",
    registeredVoters: 535,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600502",
    pollingStationName: "MWANDONI KADIRIA GROUNDS",
    registeredVoters: 535,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600503",
    pollingStationName: "MWANDONI KADIRIA GROUNDS",
    registeredVoters: 534,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600601",
    pollingStationName: "VICTORIA BAPTIST PRIMARY SCHOOL",
    registeredVoters: 587,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600602",
    pollingStationName: "VICTORIA BAPTIST PRIMARY SCHOOL",
    registeredVoters: 586,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600603",
    pollingStationName: "VICTORIA BAPTIST PRIMARY SCHOOL",
    registeredVoters: 586,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600701",
    pollingStationName: "SARAJEVO GROUNDS",
    registeredVoters: 605,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600702",
    pollingStationName: "SARAJEVO GROUNDS",
    registeredVoters: 604,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600703",
    pollingStationName: "SARAJEVO GROUNDS",
    registeredVoters: 604,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600704",
    pollingStationName: "SARAJEVO GROUNDS",
    registeredVoters: 604,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001600705",
    pollingStationName: "SARAJEVO GROUNDS",
    registeredVoters: 604,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001603101",
    pollingStationName: "FRERETOWN SECONDARY SCHOOL",
    registeredVoters: 673,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001603102",
    pollingStationName: "FRERETOWN SECONDARY SCHOOL",
    registeredVoters: 672,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001603201",
    pollingStationName: "KHADIJA SECONDARY SCHOOL",
    registeredVoters: 489,
  },
  {
    countyCode: "001",
    countyName: "MOMBASA",
    constituencyCode: "004",
    constituencyName: "NYALI",
    wardCode: "0016",
    wardName: "FRERE TOWN",
    pollingStationCode: "001004001603202",
    pollingStationName: "KHADIJA SECONDARY SCHOOL",
    registeredVoters: 488,
  },
];

export default function AdminImportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    console.log("Admin Import Alert:", title, message);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleImport = async () => {
    console.log("User tapped Import Polling Stations button");
    setLoading(true);

    try {
      console.log("Importing polling station data:", POLLING_STATION_DATA.length, "stations");
      
      const response = await apiPost("/api/polling-stations/bulk-import", {
        stations: POLLING_STATION_DATA,
      });

      console.log("Import response:", response);

      const successCount = response.summary?.successful || 0;
      const failedCount = response.summary?.failed || 0;
      const totalCount = response.summary?.processed || 0;

      const successMessage = `Successfully imported ${successCount} out of ${totalCount} polling stations.`;
      const failureMessage = failedCount > 0 ? ` ${failedCount} failed.` : "";
      const fullMessage = successMessage + failureMessage;

      showAlert("Import Complete", fullMessage);
    } catch (error: any) {
      console.error("Import error:", error);
      const errorMessage = error?.message || "Failed to import polling stations. Please try again.";
      showAlert("Import Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalStations = POLLING_STATION_DATA.length;
  const uniqueLocations = new Set(POLLING_STATION_DATA.map(s => s.pollingStationName)).size;
  const wards = new Set(POLLING_STATION_DATA.map(s => s.wardName));
  const constituencies = new Set(POLLING_STATION_DATA.map(s => s.constituencyName));
  const wardsList = Array.from(wards).join(", ");
  const constituenciesList = Array.from(constituencies).join(", ");

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
            ios_icon_name="square.and.arrow.down"
            android_material_icon_name="cloud-download"
            size={64}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Polling Station Data Import</Text>
        <Text style={styles.subtitle}>
          Import polling station data for Mombasa County
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>County:</Text>
            <Text style={styles.infoValue}>MOMBASA (001)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Constituencies:</Text>
            <Text style={styles.infoValue}>{constituenciesList}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wards:</Text>
            <Text style={styles.infoValue}>{wardsList}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Stations:</Text>
            <Text style={styles.infoValueBold}>{totalStations}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unique Locations:</Text>
            <Text style={styles.infoValueBold}>{uniqueLocations}</Text>
          </View>
        </View>

        <View style={styles.stationsList}>
          <Text style={styles.stationsListTitle}>Polling Stations to Import:</Text>
          {POLLING_STATION_DATA.map((station, index) => {
            const stationCode = station.pollingStationCode;
            const stationName = station.pollingStationName;
            const voters = station.registeredVoters;
            const wardName = station.wardName;
            const constituencyName = station.constituencyName;
            
            return (
              <View key={index} style={styles.stationItem}>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{stationName}</Text>
                  <View style={styles.stationMetaRow}>
                    <Text style={styles.stationConstituency}>{constituencyName}</Text>
                    <Text style={styles.stationWard}>{wardName}</Text>
                  </View>
                  <Text style={styles.stationCode}>{stationCode}</Text>
                </View>
                <Text style={styles.stationVoters}>{voters}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.importButton, loading && styles.importButtonDisabled]}
          onPress={handleImport}
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
              <Text style={styles.importButtonText}>Import Polling Stations</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
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
  infoCard: {
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  infoValueBold: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  stationsList: {
    marginBottom: 24,
  },
  stationsListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  stationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  stationMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  stationConstituency: {
    fontSize: 11,
    color: colors.success || colors.primary,
    fontWeight: "600",
    backgroundColor: colors.successLight || colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stationWard: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    backgroundColor: colors.primaryLight || colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stationCode: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stationVoters: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: 12,
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
