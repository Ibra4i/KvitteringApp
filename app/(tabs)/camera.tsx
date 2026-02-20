import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, Image, SafeAreaView, Text, View } from "react-native";
import { NotificationBanner } from "../../components/NotificationBanner";
import { appendReceipt } from "../../sheetApi";
import { uploadReceiptImage } from "../../uploadReceipt";

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [uri, setUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [notice, setNotice] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message?: string;
  }>({ visible: false, type: "success", title: "" });

const showNotice = (n: Omit<typeof notice, "visible">) => {
  setNotice({ ...n, visible: true });
  setTimeout(() => setNotice((p) => ({ ...p, visible: false })), 1600);
};

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.9,
      skipProcessing: false,
    });
    setUri(photo.uri); // this is a temp file; not saved to camera roll
  };

  const uploadAndCleanup = async () => {
    if (!uri) return;

    setUploading(true);
    try {
      // Convert to consistent JPEG (helps Firebase/browser preview)
      const processed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1600 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      const imageUrl = await uploadReceiptImage(processed.uri);

      await appendReceipt({
        merchant: "",
        amount: "",
        currency: "DKK",
        note: "Taken in-app",
        imageUrl,
      });

      // Delete temp files AFTER successful upload + sheet append
      // (best-effort cleanup; ignore errors)
      await FileSystem.deleteAsync(uri, { idempotent: true });
      if (processed.uri !== uri) {
        await FileSystem.deleteAsync(processed.uri, { idempotent: true });
      }

      setUri(null);
      //alert("Uploaded + removed locally ✅");
      showNotice({ type: "success", title: "Uploaded ✅", message: "Saved to Google Sheets" });
      router.replace({ pathname: "/", params: { uploaded: "1" } });
    } catch (e: any) {
      //alert("Error: " + e.message);
      showNotice({ type: "error", title: "Upload failed", message: e?.message ?? "Unknown error" });
    } finally {
      setUploading(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20, gap: 12 }}>
        <Text>Camera permission is required.</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!uri ? (
        <View style={{ flex: 1 }}>
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
          <View style={{ padding: 16 }}>
            <Button title="Take photo" onPress={takePhoto} />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          <Text>Preview</Text>
          <Image source={{ uri }} style={{ width: "100%", height: 420 }} resizeMode="contain" />
          <Button title={uploading ? "Uploading..." : "Upload + remove locally"} onPress={uploadAndCleanup} disabled={uploading} />
          <Button title="Retake" onPress={() => setUri(null)} disabled={uploading} />
        </View>
      )}
      <NotificationBanner
        visible={notice.visible}
        type={notice.type}
        title={notice.title}
        message={notice.message}
        />
    </SafeAreaView>
  );
}