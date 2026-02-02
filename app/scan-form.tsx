
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { BACKEND_URL, getBearerToken } from "@/utils/api";

export default function ScanFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<any>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertOnClose, setAlertOnClose] = useState<(() => void) | null>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <IconSymbol
            ios_icon_name="camera.fill"
            android_material_icon_name="camera"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan Form 34A
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showAlert = (title: string, message: string, onClose?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnClose(() => onClose);
    setShowAlertModal(true);
  };

  const handleAlertClose = () => {
    setShowAlertModal(false);
    if (alertOnClose) {
      alertOnClose();
      setAlertOnClose(null);
    }
  };

  const takePicture = async () => {
    console.log("[ScanForm] User tapped Take Picture");
    
    if (!cameraRef.current) {
      console.error("[ScanForm] Camera ref not available");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync();
      console.log("[ScanForm] Photo taken:", photo.uri);
      setImageUri(photo.uri);
    } catch (error) {
      console.error("[ScanForm] Error taking picture:", error);
      showAlert("Error", "Failed to take picture");
    }
  };

  const pickImage = async () => {
    console.log("[ScanForm] User tapped Pick from Gallery");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("[ScanForm] Image picked:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadForm = async () => {
    console.log("[ScanForm] User tapped Upload Form");
    
    if (!imageUri) {
      console.error("[ScanForm] No image to upload");
      return;
    }

    if (!user?.id) {
      showAlert("Error", "User not authenticated. Please sign in.");
      return;
    }

    setUploading(true);
    try {
      const token = await getBearerToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("formImage", {
        uri: imageUri,
        type: "image/jpeg",
        name: "form-34a.jpg",
      } as any);
      formData.append("agentId", user.id);
      
      console.log("[ScanForm] Uploading Form 34A");
      
      const response = await fetch(`${BACKEND_URL}/api/forms/upload-34a`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("[ScanForm] Form uploaded successfully:", result);
      
      const discrepancyText = result.discrepancies && result.discrepancies.length > 0
        ? `\n\nWarning: ${result.discrepancies.length} discrepancy(ies) detected.`
        : "";
      
      showAlert(
        "Success",
        `Form 34A uploaded and processed successfully.\n\nSerial Number: ${result.serialNumber}\nCandidates: ${result.candidates?.length || 0}${discrepancyText}`,
        () => router.back()
      );
    } catch (error: any) {
      console.error("[ScanForm] Error uploading form:", error);
      showAlert("Error", error.message || "Failed to upload form");
    } finally {
      setUploading(false);
    }
  };

  const retakePicture = () => {
    console.log("[ScanForm] User tapped Retake Picture");
    setImageUri(null);
  };

  if (imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={retakePicture}
              disabled={uploading}
            >
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={24}
                color={colors.text}
              />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.uploadButton, uploading && styles.buttonDisabled]}
              onPress={uploadForm}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="arrow.up.circle.fill"
                    android_material_icon_name="cloud-upload"
                    size={24}
                    color={colors.textLight}
                  />
                  <Text style={[styles.actionButtonText, styles.uploadButtonText]}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.info}
            />
            <Text style={styles.infoText}>
              The form will be scanned and validated automatically. Serial numbers and candidate results will be extracted.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Text style={styles.instructionText}>Position Form 34A within the frame</Text>
          </View>

          <View style={styles.frameGuide}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="photo"
                size={32}
                color={colors.textLight}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={32}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      <Modal
        visible={showAlertModal}
        transparent
        animationType="fade"
        onRequestClose={handleAlertClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{alertTitle}</Text>
            <Text style={styles.modalMessage}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAlertClose}
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
    textAlign: "center",
  },
  frameGuide: {
    flex: 1,
    margin: 40,
    borderWidth: 2,
    borderColor: colors.textLight,
    borderStyle: "dashed",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: colors.primary,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 32,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.textLight,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.textLight,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    backgroundColor: colors.background,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 24,
    backgroundColor: colors.background,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  retakeButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  uploadButtonText: {
    color: colors.textLight,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.highlight,
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
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
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
});
