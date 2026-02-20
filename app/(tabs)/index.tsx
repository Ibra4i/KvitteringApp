import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Button, Image, SafeAreaView, Text, View } from "react-native";
import { appendReceipt } from "../../sheetApi";
import { uploadReceiptImage } from "../../uploadReceipt";

export default function HomeScreen() {
  const [uri, setUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    alert("Saved to Google Sheets ✅");
  } catch (err: any) {
    alert("Upload failed: " + err.message);
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
    </SafeAreaView>
  );
}