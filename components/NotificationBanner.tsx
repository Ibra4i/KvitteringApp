import React, { useEffect, useRef } from "react";
import { Animated, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  type?: "success" | "error";
};

export function NotificationBanner({
  visible,
  title,
  message,
  type = "success",
}: Props) {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -160,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const bg = type === "success" ? "rgba(20,20,20,0.92)" : "rgba(120,0,0,0.92)";
  const sub = type === "success" ? "rgba(235,235,235,0.9)" : "rgba(255,235,235,0.92)";

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: insets.top + 12,          // ✅ below notch/Dynamic Island
        left: 14,
        right: 14,
        zIndex: 9999,
        elevation: 9999,              // ✅ Android
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 18,
          paddingVertical: 16,
          paddingHorizontal: 16,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          ...(Platform.OS === "android" ? { elevation: 12 } : null),
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 18,              // ✅ bigger
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        {!!message && (
          <Text
            style={{
              color: sub,
              marginTop: 6,
              fontSize: 15,            // ✅ bigger
              fontWeight: "500",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}