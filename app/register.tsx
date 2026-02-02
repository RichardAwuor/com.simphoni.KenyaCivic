
import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiPost } from "@/utils/api";

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

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [constituencyCode, setConstituencyCode] = useState("");
  const [constituencyName, setConstituencyName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [showCountyPicker, setShowCountyPicker] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  const selectedCountyData = COUNTIES.find(c => c.code === selectedCounty);

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
    if (!constituencyCode || !constituencyName) {
      showAlert("Error", "Please enter constituency code and name");
      return false;
    }
    if (!wardCode || !wardName) {
      showAlert("Error", "Please enter ward code and name");
      return false;
    }
    if (!nationalId || nationalId.length !== 8) {
      showAlert("Error", "Please enter a valid 8-digit national ID");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    console.log("[Register] User tapped Register button");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        email,
        confirmEmail,
        firstName,
        lastName,
        countyCode: selectedCounty,
        countyName: selectedCountyData?.name || "",
        constituencyCode,
        constituencyName,
        wardCode,
        wardName,
        dateOfBirth: dateOfBirth.toISOString(),
        nationalId,
      };
      
      console.log("[Register] Sending registration data:", registrationData);
      
      const response = await apiPost("/api/agents/register", registrationData);
      
      console.log("[Register] Registration successful:", response);
      
      showAlert(
        "Registration Successful",
        `Your agent code is: ${response.agentCode}\n\nPlease sign in to continue.`,
        "success"
      );
      
      // Navigate to auth screen after modal is dismissed
      setTimeout(() => {
        router.replace("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("[Register] Registration error:", error);
      showAlert("Error", error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>CIVIC</Text>
            <Text style={styles.slogan}>WANJIKU@63</Text>
            <Text style={styles.subtitle}>Electoral Agent Registration</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Confirm Email</Text>
            <TextInput
              style={styles.input}
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              placeholder="Confirm your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

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
              <Text style={styles.dateButtonText}>{formatDate(dateOfBirth)}</Text>
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
              <Text style={styles.pickerButtonText}>
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
                      setSelectedCounty(county.code);
                      setShowCountyPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {county.code} - {county.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.label}>Constituency Code (3 digits)</Text>
            <TextInput
              style={styles.input}
              value={constituencyCode}
              onChangeText={setConstituencyCode}
              placeholder="e.g., 001"
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.label}>Constituency Name</Text>
            <TextInput
              style={styles.input}
              value={constituencyName}
              onChangeText={setConstituencyName}
              placeholder="e.g., CHANGAMWE"
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Ward Code (4 digits)</Text>
            <TextInput
              style={styles.input}
              value={wardCode}
              onChangeText={setWardCode}
              placeholder="e.g., 0001"
              keyboardType="number-pad"
              maxLength={4}
            />

            <Text style={styles.label}>Ward Name</Text>
            <TextInput
              style={styles.input}
              value={wardName}
              onChangeText={setWardName}
              placeholder="e.g., PORT REITZ"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.registerButtonText}>Register as Agent</Text>
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
        onRequestClose={() => setShowModal(false)}
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
              onPress={() => setShowModal(false)}
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
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 36,
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
    fontSize: 18,
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
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
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
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  registerButton: {
    ...commonStyles.button,
    marginTop: 24,
  },
  registerButtonText: {
    ...commonStyles.buttonText,
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
