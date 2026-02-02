
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera, CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Video, ResizeMode } from "expo-av";
import * as Location from "expo-location";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { BACKEND_URL } from "@/utils/api";
import { getBearerToken } from "@/utils/api";

export default function CameraScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const cameraRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertOnClose, setAlertOnClose] = useState<(() => void) | null>(null);

  useEffect(() => {
    console.log("[Camera] Camera screen loaded");
    getLocation();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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

  const getLocation = async () => {
    console.log("[Camera] Getting current location");
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("[Camera] Location obtained:", currentLocation.coords);
    } catch (error) {
      console.error("[Camera] Error getting location:", error);
    }
  };

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
            android_material_icon_name="videocam"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to record incident videos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const startRecording = async () => {
    console.log("[Camera] User tapped Start Recording");
    
    if (!cameraRef.current) {
      console.error("[Camera] Camera ref not available");
      return;
    }

    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= 60) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      
      console.log("[Camera] Video recorded:", video.uri);
      setVideoUri(video.uri);
    } catch (error) {
      console.error("[Camera] Error recording video:", error);
      showAlert("Error", "Failed to record video");
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const stopRecording = async () => {
    console.log("[Camera] User tapped Stop Recording");
    
    if (!cameraRef.current) {
      console.error("[Camera] Camera ref not available");
      return;
    }

    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error("[Camera] Error stopping recording:", error);
    }
  };

  const uploadVideo = async () => {
    console.log("[Camera] User tapped Upload Video");
    
    if (!videoUri) {
      console.error("[Camera] No video to upload");
      return;
    }

    if (!location) {
      showAlert("Error", "Location not available. Please try again.");
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
      formData.append("video", {
        uri: videoUri,
        type: "video/mp4",
        name: "incident-video.mp4",
      } as any);
      formData.append("agentId", user.id);
      formData.append("latitude", location.coords.latitude.toString());
      formData.append("longitude", location.coords.longitude.toString());
      
      console.log("[Camera] Uploading video with location:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const response = await fetch(`${BACKEND_URL}/api/incidents/upload-video`, {
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
      console.log("[Camera] Video uploaded successfully:", result);
      
      showAlert(
        "Success",
        `Incident video uploaded successfully as ${result.videoName}`,
        () => router.back()
      );
    } catch (error: any) {
      console.error("[Camera] Error uploading video:", error);
      showAlert("Error", error.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const retakeVideo = () => {
    console.log("[Camera] User tapped Retake Video");
    setVideoUri(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minsText = mins.toString().padStart(2, "0");
    const secsText = secs.toString().padStart(2, "0");
    return `${minsText}:${secsText}`;
  };

  const timeText = formatTime(recordingTime);
  const maxTimeText = "01:00";

  if (videoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Video
            source={{ uri: videoUri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
          
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={retakeVideo}
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
              onPress={uploadVideo}
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
                <Text style={styles.timerText}>{timeText}</Text>
                <Text style={styles.maxTimeText}>/ {maxTimeText}</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isRecording}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={32}
                color={colors.textLight}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
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
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textLight,
    marginRight: 12,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textLight,
  },
  maxTimeText: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.7,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 32,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.textLight,
  },
  recordButtonActive: {
    borderColor: colors.error,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error,
  },
  recordButtonInnerActive: {
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  placeholder: {
    width: 56,
  },
  previewContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
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
