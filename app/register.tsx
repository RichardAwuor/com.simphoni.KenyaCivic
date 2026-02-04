
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
import { apiPost, apiGet } from "@/utils/api";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuth } from "@/contexts/AuthContext";

// Kenya counties data
const COUNTIES = [
  { code: "001", name: "MOMBASA" },
  { code: "002", name: "KWALE" },
  { code: "003", name: "KILIFI" },
  { code: "004", name: "TANA RIVER" },
  { code: "005", name: "LAMU" },
  { code: "006", name: "TAITA TAVETA" },
  { code: "007", name: "GARISSA" },
  { code: "008", name: "WAJIR" },
  { code: "009", name: "MANDERA" },
  { code: "010", name: "MARSABIT" },
  { code: "011", name: "ISIOLO" },
  { code: "012", name: "MERU" },
  { code: "013", name: "THARAKA NITHI" },
  { code: "014", name: "EMBU" },
  { code: "015", name: "KITUI" },
  { code: "016", name: "MACHAKOS" },
  { code: "017", name: "MAKUENI" },
  { code: "018", name: "NYANDARUA" },
  { code: "019", name: "NYERI" },
  { code: "020", name: "KIRINYAGA" },
  { code: "021", name: "MURANG'A" },
  { code: "022", name: "KIAMBU" },
  { code: "023", name: "TURKANA" },
  { code: "024", name: "WEST POKOT" },
  { code: "025", name: "SAMBURU" },
  { code: "026", name: "TRANS NZOIA" },
  { code: "027", name: "UASIN GISHU" },
  { code: "028", name: "ELGEYO MARAKWET" },
  { code: "029", name: "NANDI" },
  { code: "030", name: "BARINGO" },
  { code: "031", name: "LAIKIPIA" },
  { code: "032", name: "NAKURU" },
  { code: "033", name: "NAROK" },
  { code: "034", name: "KAJIADO" },
  { code: "035", name: "KERICHO" },
  { code: "036", name: "BOMET" },
  { code: "037", name: "KAKAMEGA" },
  { code: "038", name: "VIHIGA" },
  { code: "039", name: "BUNGOMA" },
  { code: "040", name: "BUSIA" },
  { code: "041", name: "SIAYA" },
  { code: "042", name: "KISUMU" },
  { code: "043", name: "HOMA BAY" },
  { code: "044", name: "MIGORI" },
  { code: "045", name: "KISII" },
  { code: "046", name: "NYAMIRA" },
  { code: "047", name: "NAIROBI" },
];

interface Constituency {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

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
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");
  
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

  // Fetch constituencies when county is selected
  useEffect(() => {
    const fetchConstituencies = async () => {
      if (!selectedCounty) {
        setConstituencies([]);
        setSelectedConstituency("");
        setWards([]);
        setSelectedWard("");
        return;
      }

      console.log("[Register] Fetching constituencies for county:", selectedCounty);
      setLoadingConstituencies(true);
      setSelectedConstituency("");
      setWards([]);
      setSelectedWard("");

      try {
        const response = await apiGet(`/api/locations/constituencies?countyCode=${selectedCounty}`);
        console.log("[Register] Constituencies fetched:", response);
        setConstituencies(response.constituencies || []);
      } catch (error: any) {
        console.error("[Register] Error fetching constituencies:", error);
        showAlert("Error", "Failed to load constituencies");
        setConstituencies([]);
      } finally {
        setLoadingConstituencies(false);
      }
    };

    fetchConstituencies();
  }, [selectedCounty]);

  // Fetch wards when constituency is selected
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedCounty || !selectedConstituency) {
        setWards([]);
        setSelectedWard("");
        return;
      }

      console.log("[Register] Fetching wards for county:", selectedCounty, "constituency:", selectedConstituency);
      setLoadingWards(true);
      setSelectedWard("");

      try {
        const response = await apiGet(`/api/locations/wards?countyCode=${selectedCounty}&constituencyCode=${selectedConstituency}`);
        console.log("[Register] Wards fetched:", response);
        setWards(response.wards || []);
      } catch (error: any) {
        console.error("[Register] Error fetching wards:", error);
        showAlert("Error", "Failed to load wards");
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
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
    return `${day}/${month}/${year}`;
  };

  const showAlert = (title: string, message: string, type: "success" | "error" = "error") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const validateForm = () => {
    if (!email || !confirmEmail) {
      showAlert("Error", "Please enter and confirm your email");
      return false;
    }
    if (!emailValid) {
      showAlert("Error", "Please enter a valid email address");
      return false;
    }
    if (email !== confirmEmail) {
      showAlert("Error", "Emails do not match");
      return false;
    }
    if (!firstName || !lastName) {
      showAlert("Error", "Please enter your first and last name");
      return false;
    }
    if (!selectedCounty) {
      showAlert("Error", "Please select a county");
      return false;
    }
    if (!selectedConstituency) {
      showAlert("Error", "Please select a constituency");
      return false;
    }
    if (!selectedWard) {
      showAlert("Error", "Please select a ward");
      return false;
    }
    if (!nationalId || nationalId.length !== 8) {
      showAlert("Error", "Please enter a valid 8-digit national ID");
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
        showAlert("Error", "Your device does not support biometric authentication");
        return;
      }
      
      if (!isEnrolled) {
        showAlert("Error", "No biometrics enrolled on this device. Please set up fingerprint or face recognition in your device settings.");
        return;
      }
      
      // Prompt for biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Set up biometric authentication for CIVIC",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      
      if (!result.success) {
        showAlert("Error", "Biometric authentication failed. Please try again.");
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
          "success"
        );
        
        // Navigate to On-Location after a delay
        setTimeout(() => {
          router.replace("/(tabs)/on-location");
        }, 3000);
      } else {
        showAlert("Error", "Failed to enable biometric authentication");
      }
    } catch (error: any) {
      console.error("[Register] Biometric setup error:", error);
      showAlert("Error", error.message || "Failed to set up biometric authentication");
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
      setShowModal(true);
    } catch (error: any) {
      console.error("[Register] Registration error:", error);
      showAlert("Error", error.message || "Registration failed");
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

  const dateText = formatDate(dateOfBirth);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
              disabled={!selectedCounty || loadingConstituencies}
            >
              {loadingConstituencies ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Text style={[styles.pickerButtonText, !selectedConstituencyData && styles.placeholderText]}>
                    {selectedConstituencyData 
                      ? `${selectedConstituencyData.code} - ${selectedConstituencyData.name}` 
                      : selectedCounty 
                        ? "Select Constituency" 
                        : "Select county first"}
                  </Text>
                  <IconSymbol
                    ios_icon_name="chevron.down"
                    android_material_icon_name="arrow-drop-down"
                    size={24}
                    color={colors.textSecondary}
                  />
                </>
              )}
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
              disabled={!selectedCounty || !selectedConstituency || loadingWards}
            >
              {loadingWards ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Text style={[styles.pickerButtonText, !selectedWardData && styles.placeholderText]}>
                    {selectedWardData 
                      ? `${selectedWardData.code} - ${selectedWardData.name}` 
                      : selectedConstituency 
                        ? "Select Ward" 
                        : "Select constituency first"}
                  </Text>
                  <IconSymbol
                    ios_icon_name="chevron.down"
                    android_material_icon_name="arrow-drop-down"
                    size={24}
                    color={colors.textSecondary}
                  />
                </>
              )}
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

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Already have an account? Sign In</Text>
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
              ios_icon_name={modalType === "success" ? "checkmark.circle.fill" : "xmark.circle.fill"}
              android_material_icon_name={modalType === "success" ? "check-circle" : "error"}
              size={48}
              color={modalType === "success" ? colors.success : colors.error}
            />
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, modalType === "success" ? styles.modalButtonSuccess : styles.modalButtonError]}
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
  backButton: {
    marginTop: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.info,
    fontSize: 14,
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
