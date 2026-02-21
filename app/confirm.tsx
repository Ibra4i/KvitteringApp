import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    Text,
    View,
} from "react-native";
import { appendReceipt } from "../sheetApi";

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v ?? "";
}

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [saving, setSaving] = useState(false);

  const data = useMemo(
    () => ({
      imageUrl: one(params.imageUrl),
      merchant: one(params.merchant),
      amount: one(params.amount),
      vat: one(params.vat),
      date: one(params.date),
      time: one(params.time),
      currency: one(params.currency) || "DKK",
      note: one(params.note) || "OCR",
    }),
    [params]
  );

  const save = async () => {
    if (!data.imageUrl) {
      Alert.alert("Missing image", "No imageUrl was provided.");
      return;
    }

    setSaving(true);
    try {
      console.log("CONFIRM -> appendReceipt payload", {
        merchant: data.merchant,
        amount: data.amount,
        currency: data.currency,
        note: data.note,
        vat: data.vat,
        imageUrl: data.imageUrl,
        date: data.date,
        time: data.time,
      });

      await appendReceipt({
        merchant: data.merchant,
        amount: data.amount,
        currency: data.currency,
        note: data.note,
        vat: data.vat,
        imageUrl: data.imageUrl,
        date: data.date,
        time: data.time,
      });

      // Go home and let home screen show banner using uploaded=1 param
      router.replace({ pathname: "/", params: { uploaded: "1" } });
    } catch (e: any) {
      console.log("CONFIRM save error:", e);
      Alert.alert("Save failed", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#111",
        padding: 20,
      }}
    >
      {/* Amount */}
      <Text
        style={{
          fontSize: 36,
          fontWeight: "800",
          color: "white",
          textAlign: "center",
        }}
      >
        {data.amount || "0.00"} {data.currency}
      </Text>

      {/* Merchant */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          color: "#ccc",
          textAlign: "center",
          marginTop: 6,
        }}
      >
        {data.merchant || "Unknown Merchant"}
      </Text>

      {/* Date + Time */}
      {(data.date || data.time) && (
        <Text
          style={{
            textAlign: "center",
            color: "#888",
            marginTop: 4,
          }}
        >
          {data.date} {data.time}
        </Text>
      )}

      {/* Receipt Image */}
      {data.imageUrl ? (
        <View
          style={{
            marginTop: 24,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#1a1a1a",
          }}
        >
          <Image
            source={{ uri: data.imageUrl }}
            style={{ width: "100%", height: 250 }}
            resizeMode="contain"
          />
        </View>
      ) : (
        <Text style={{ color: "#888", marginTop: 24, textAlign: "center" }}>
          No image preview available
        </Text>
      )}

      {/* VAT */}
      {data.vat ? (
        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 14,
            backgroundColor: "#1a1a1a",
          }}
        >
          <Text style={{ color: "#aaa", fontSize: 14 }}>VAT (MOMS)</Text>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginTop: 4,
            }}
          >
            {data.vat} {data.currency}
          </Text>
        </View>
      ) : null}

      {/* Buttons */}
      <View style={{ marginTop: "auto", gap: 14 }}>
        <Pressable
          style={{
            backgroundColor: saving ? "#1f4da8" : "#2e7dff",
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            opacity: saving ? 0.8 : 1,
          }}
          onPress={save}
          disabled={saving}
        >
          {saving && <ActivityIndicator />}
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
            {saving ? "Saving..." : "Confirm & Save"}
          </Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#222",
            padding: 16,
            borderRadius: 14,
            alignItems: "center",
            opacity: saving ? 0.5 : 1,
          }}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={{ color: "#aaa", fontWeight: "600" }}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}