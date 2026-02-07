
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiPost } from "@/utils/api";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@/contexts/AuthContext";

// Import location data directly from JSON files
import batch2Data from "@/registration-data-batch-2.json";
import batch3Data from "@/registration-data-batch-3.json";
import batch4Data from "@/registration-data-batch-4.json";
import batch5Data from "@/registration-data-batch-5.json";
import batch6Data from "@/registration-data-batch-6.json";

interface LocationRecord {
  countyCode: string;
  countyName: string;
  constituencyCode: string;
  constituencyName: string;
  wardCode: string;
  wardName: string;
}

interface Constituency {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

// Combine all batch data into a single array
const ALL_LOCATION_DATA: LocationRecord[] = [
  ...batch2Data,
  ...batch3Data,
  ...batch4Data,
  ...batch5Data,
  ...batch6Data,
] as LocationRecord[];

// Extract unique counties from the location data
const COUNTIES = Array.from(
  new Map(
    ALL_LOCATION_DATA.map((record) => [
      record.countyCode,
      { code: record.countyCode, name: record.countyName },
    ])
  ).values()
).sort((a, b) => a.code.localeCompare(b.code));

export default function RegisterScreen() {
  const router = useRouter();
  const { fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nationalId, setNationalId] = useState("");
  
  // Picker states
  const [showCountyPicker, setShowCountyPicker] = useState(false);
  const [showConstituencyPicker, setShowConstituencyPicker] = useState(false);
  const [showWardPicker, setShowWardPicker] = useState(false);
  
  // Data states
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error" | "info">("success");
  const [showImportButton, setShowImportButton] = useState(false);
  
  // Biometric state
  const [biometricStep, setBiometricStep] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [agentCode, setAgentCode] = useState("");

  const selectedCountyData = COUNTIES.find(c => c.code === selectedCounty);
  const selectedConstituencyData = constituencies.find(c => c.code === selectedConstituency);
  const selectedWardData = wards.find(w => w.code === selectedWard);

  // Email validation
  const emailsMatch = email && confirmEmail && email === confirmEmail;
  const emailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const confirmEmailValid = confirmEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmEmail);

  // Load constituencies when county is selected (directly from JSON data)
  useEffect(() => {
    if (!selectedCounty) {
      setConstituencies([]);
      setSelectedConstituency("");
      setWards([]);
      setSelectedWard("");
      return;
    }

    console.log("[Register] Loading constituencies for county:", selectedCounty);
    setSelectedConstituency("");
    setWards([]);
    setSelectedWard("");

    // Filter location data by selected county
    const countyData = ALL_LOCATION_DATA.filter(
      (record) => record.countyCode === selectedCounty
    );

    // Extract unique constituencies
    const constituenciesMap = new Map<string, Constituency>();
    countyData.forEach((record) => {
      if (record.constituencyCode && record.constituencyName) {
        if (!constituenciesMap.has(record.constituencyCode)) {
          constituenciesMap.set(record.constituencyCode, {
            code: record.constituencyCode,
            name: record.constituencyName,
          });
        }
      }
    });

    const uniqueConstituencies = Array.from(constituenciesMap.values()).sort(
      (a, b) => a.code.localeCompare(b.code)
    );
    
    console.log("[Register] Found", uniqueConstituencies.length, "unique constituencies");
    setConstituencies(uniqueConstituencies);

    if (uniqueConstituencies.length === 0) {
      console.warn("[Register] No constituencies found for county:", selectedCounty);
      showAlert(
        "No Data Available",
        "No constituencies found for the selected county. Please select a different county.",
        "info",
        false
      );
    }
  }, [selectedCounty]);

  // Load wards when constituency is selected (directly from JSON data)
  useEffect(() => {
    if (!selectedCounty || !selectedConstituency) {
      setWards([]);
      setSelectedWard("");
      return;
    }

    console.log("[Register] Loading wards for constituency:", selectedConstituency);
    setSelectedWard("");

    // Filter location data by selected county and constituency
    const constituencyData = ALL_LOCATION_DATA.filter(
      (record) =>
        record.countyCode === selectedCounty &&
        record.constituencyCode === selectedConstituency
    );

    // Extract unique wards
    const wardsMap = new Map<string, Ward>();
    constituencyData.forEach((record) => {
      if (record.wardCode && record.wardName) {
        if (!wardsMap.has(record.wardCode)) {
          wardsMap.set(record.wardCode, {
            code: record.wardCode,
            name: record.wardName,
          });
        }
      }
    });

    const uniqueWards = Array.from(wardsMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
    
    console.log("[Register] Found", uniqueWards.length, "unique wards");
    setWards(uniqueWards);

    if (uniqueWards.length === 0) {
      console.warn("[Register] No wards found for constituency:", selectedConstituency);
      showAlert(
        "No Data Available",
        "No wards found for the selected constituency. Please select a different constituency.",
        "info",
        false
      );
    }
  }, [selectedCounty, selectedConstituency]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const showAlert = (title: string, message: string, type: "success" | "error" | "info" = "error", showImport: boolean = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setShowImportButton(showImport);
    setShowModal(true);
  };

  const validateForm = () => {
    if (!email || !confirmEmail) {
      showAlert("Error", "Please enter and confirm your email", "error", false);
      return false;
    }
    if (!emailValid) {
      showAlert("Error", "Please enter a valid email address", "error", false);
      return false;
    }
    if (email !== confirmEmail) {
      showAlert("Error", "Emails do not match", "error", false);
      return false;
    }
    if (!firstName || !lastName) {
      showAlert("Error", "Please enter your first and last name", "error", false);
      return false;
    }
    if (!selectedCounty) {
      showAlert("Error", "Please select a county", "error", false);
      return false;
    }
    if (!selectedConstituency) {
      showAlert("Error", "Please select a constituency", "error", false);
      return false;
    }
    if (!selectedWard) {
      showAlert("Error", "Please select a ward", "error", false);
      return false;
    }
    if (!nationalId || nationalId.length !== 8) {
      showAlert("Error", "Please enter a valid 8-digit national ID", "error", false);
      return false;
    }
    return true;
  };

  const setupBiometrics = async () => {
    console.log("[Register] Starting biometric setup");
    
    try {
      // Check if biometrics are available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware) {
        showAlert("Error", "Your device does not support biometric authentication", "error", false);
        return;
      }
      
      if (!isEnrolled) {
        showAlert("Error", "No biometrics enrolled on this device. Please set up fingerprint or face recognition in your device settings.", "error", false);
        return;
      }
      
      // Prompt for biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Set up biometric authentication for CIVIC",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      
      if (!result.success) {
        showAlert("Error", "Biometric authentication failed. Please try again.", "error", false);
        return;
      }
      
      console.log("[Register] Biometric authentication successful, enabling on server");
      
      // Enable biometrics on the server
      setLoading(true);
      const response = await apiPost("/api/agents/enable-biometric", { agentId });
      
      if (response.success) {
        console.log("[Register] Biometric setup complete");
        showAlert(
          "Registration Complete!",
          `Your agent code is: ${agentCode}\n\nBiometric authentication has been enabled. You can now sign in using your email and biometrics.`,
          "success",
          false
        );
        
        // Navigate to On-Location after a delay
        setTimeout(() => {
          router.replace("/(tabs)/on-location");
        }, 3000);
      } else {
        showAlert("Error", "Failed to enable biometric authentication", "error", false);
      }
    } catch (error: any) {
      console.error("[Register] Biometric setup error:", error);
      showAlert("Error", error.message || "Failed to set up biometric authentication", "error", false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log("[Register] User tapped Register button");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Generate a secure password (user won't need to remember it - they'll use biometrics)
      const generatedPassword = `${nationalId}-${Date.now()}-${Math.random().toString(36)}`;
      
      const registrationData = {
        email,
        confirmEmail,
        firstName,
        lastName,
        countyCode: selectedCounty,
        countyName: selectedCountyData?.name || "",
        constituencyCode: selectedConstituency,
        constituencyName: selectedConstituencyData?.name || "",
        wardCode: selectedWard,
        wardName: selectedWardData?.name || "",
        dateOfBirth: dateOfBirth.toISOString(),
        nationalId,
        password: generatedPassword,
      };
      
      console.log("[Register] Sending registration data");
      
      const response = await apiPost("/api/agents/register", registrationData);
      
      console.log("[Register] Registration successful:", response);
      
      // Store agent info for biometric setup
      setAgentId(response.userId);
      setAgentCode(response.agentCode);
      
      // The backend automatically creates a session after registration
      // Refresh auth context to get the new user session
      await fetchUser();
      
      // Show biometric setup step
      setBiometricStep(true);
      setModalTitle("Registration Successful!");
      setModalMessage(`Your agent code is: ${response.agentCode}\n\nNext step: Set up biometric authentication to complete your registration.`);
      setModalType("success");
      setShowImportButton(false);
      setShowModal(true);
    } catch (error: any) {
      console.error("[Register] Registration error:", error);
      showAlert("Error", error.message || "Registration failed", "error", false);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (biometricStep) {
      // Proceed to biometric setup
      setupBiometrics();
    }
  };



  const handleBack = () => {
    console.log("[Register] User tapped Back - navigating to auth screen");
    router.back();
  };

  const dateText = formatDate(dateOfBirth);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            <Image
              source={require("@/assets/images/0f3a776e-9221-47d8-82c0-709cf12e74b9.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>CIVIC</Text>
            <Text style={styles.slogan}>WANJIKU@63</Text>
            <Text style={styles.subtitle}>Electoral Agent Registration</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconField]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailValid && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.success}
                  style={styles.checkIcon}
                />
              )}
            </View>

            <Text style={styles.label}>Confirm Email</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconField]}
                value={confirmEmail}
                onChangeText={setConfirmEmail}
                placeholder="Confirm your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {confirmEmailValid && emailsMatch && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.success}
                  style={styles.checkIcon}
                />
              )}
            </View>

            {confirmEmail && !emailsMatch && (
              <Text style={styles.errorText}>Emails do not match</Text>
            )}

            <Text style={styles.sectionTitle}>Personal Information</Text>
            
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

            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{dateText}</Text>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.label}>National ID (8 digits)</Text>
            <TextInput
              style={styles.input}
              value={nationalId}
              onChangeText={setNationalId}
              placeholder="Enter 8-digit national ID"
              keyboardType="number-pad"
              maxLength={8}
            />

            <Text style={styles.sectionTitle}>Location Information</Text>
            
            <Text style={styles.label}>County</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCountyPicker(!showCountyPicker)}
            >
              <Text style={[styles.pickerButtonText, !selectedCountyData && styles.placeholderText]}>
                {selectedCountyData ? `${selectedCountyData.code} - ${selectedCountyData.name}` : "Select County"}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showCountyPicker && (
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {COUNTIES.map((county) => (
                  <TouchableOpacity
                    key={county.code}
                    style={styles.pickerItem}
                    onPress={() => {
                      console.log("[Register] County selected:", county.code, county.name);
                      setSelectedCounty(county.code);
                      setShowCountyPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {county.code}
                    </Text>
                    <Text style={styles.pickerItemText}>
                      {county.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.label}>Constituency</Text>
            <TouchableOpacity
              style={[styles.pickerButton, !selectedCounty && styles.pickerButtonDisabled]}
              onPress={() => {
                if (selectedCounty && constituencies.length > 0) {
                  setShowConstituencyPicker(!showConstituencyPicker);
                }
              }}
              disabled={!selectedCounty}
            >
              <Text style={[styles.pickerButtonText, !selectedConstituencyData && styles.placeholderText]}>
                {selectedConstituencyData 
                  ? `${selectedConstituencyData.code} - ${selectedConstituencyData.name}` 
                  : selectedCounty 
                    ? constituencies.length === 0 
                      ? "No constituencies available"
                      : "Select Constituency"
                    : "Select county first"}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showConstituencyPicker && constituencies.length > 0 && (
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {constituencies.map((constituency) => (
                  <TouchableOpacity
                    key={constituency.code}
                    style={styles.pickerItem}
                    onPress={() => {
                      console.log("[Register] Constituency selected:", constituency.code, constituency.name);
                      setSelectedConstituency(constituency.code);
                      setShowConstituencyPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {constituency.code}
                    </Text>
                    <Text style={styles.pickerItemText}>
                      {constituency.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.label}>Ward</Text>
            <TouchableOpacity
              style={[styles.pickerButton, (!selectedCounty || !selectedConstituency) && styles.pickerButtonDisabled]}
              onPress={() => {
                if (selectedCounty && selectedConstituency && wards.length > 0) {
                  setShowWardPicker(!showWardPicker);
                }
              }}
              disabled={!selectedCounty || !selectedConstituency}
            >
              <Text style={[styles.pickerButtonText, !selectedWardData && styles.placeholderText]}>
                {selectedWardData 
                  ? `${selectedWardData.code} - ${selectedWardData.name}` 
                  : selectedConstituency 
                    ? wards.length === 0
                      ? "No wards available"
                      : "Select Ward"
                    : "Select constituency first"}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showWardPicker && wards.length > 0 && (
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {wards.map((ward) => (
                  <TouchableOpacity
                    key={ward.code}
                    style={styles.pickerItem}
                    onPress={() => {
                      console.log("[Register] Ward selected:", ward.code, ward.name);
                      setSelectedWard(ward.code);
                      setShowWardPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {ward.code}
                    </Text>
                    <Text style={styles.pickerItemText}>
                      {ward.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.registerButtonText}>Register & Enable Biometrics</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name={modalType === "success" ? "checkmark.circle.fill" : modalType === "info" ? "info.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={modalType === "success" ? "check-circle" : modalType === "info" ? "info" : "error"}
              size={48}
              color={modalType === "success" ? colors.success : modalType === "info" ? colors.primary : colors.error}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            
            <TouchableOpacity
              style={[styles.modalButton, modalType === "success" ? styles.modalButtonSuccess : modalType === "info" ? styles.modalButtonPrimary : styles.modalButtonError]}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>
                {biometricStep ? "Set Up Biometrics" : "OK"}
              </Text>
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
    marginBottom: 16,
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
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  slogan: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
    marginBottom: 16,
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
  inputWithIcon: {
    position: "relative",
    marginBottom: 16,
  },
  inputWithIconField: {
    paddingRight: 40,
    marginBottom: 0,
  },
  checkIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -12,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  pickerList: {
    maxHeight: 200,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  registerButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
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
  modalButtonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
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
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.border,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
