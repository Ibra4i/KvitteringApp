import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, SafeAreaView, Text, View } from "react-native";
import { NotificationBanner } from "../../components/NotificationBanner";
import { appendReceipt } from "../../sheetApi";
import { uploadReceiptImage } from "../../uploadReceipt";

export default function HomeScreen() {
  const [uri, setUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [noticeVisible, setNoticeVisible] = useState(false);
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
  if (params.uploaded === "1") {
    setNoticeVisible(true);
    const t = setTimeout(() => setNoticeVisible(false), 1600);
    return () => clearTimeout(t);
  }
}, [params.uploaded]);
  
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setUri(res.assets[0].uri);
    }
  };

  const uploadImage = async () => {
  if (!uri) return;

  setUploading(true);
  try {
    // Convert to a real JPEG + optionally resize for receipts
    const processed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],  // keeps it readable, smaller file
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );

    const imageUrl = await uploadReceiptImage(processed.uri);

    await appendReceipt({
      merchant: "",
      amount: "",
      currency: "DKK",
      note: "Uploaded from app",
      imageUrl,
    });
    
    console.log("Uploaded URL:", imageUrl);
    //alert(imageUrl); // test: paste into browser, should display
    setUri(null);
    showNotice({ type: "success", title: "Uploaded ✅", message: "Saved to Google Sheets" });
  } catch (err: any) {
    showNotice({ type: "error", title: "Upload failed", message: err?.message ?? "Unknown error" });
  } finally {
    setUploading(false);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Button title="Pick receipt image" onPress={pick} />

      {uri && (
        <>
          <View style={{ marginTop: 20 }}>
            <Text>Selected image:</Text>
            <Image
              source={{ uri }}
              style={{ width: "100%", height: 400 }}
              resizeMode="contain"
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <Button
              title={uploading ? "Uploading..." : "Upload Image"}
              onPress={uploadImage}
              disabled={uploading}
            />
          </View>
        </>
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