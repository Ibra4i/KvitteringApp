import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { View } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

export const unstable_settings = {
  anchor: '(tabs)',
};

const toastConfig = {
  success: (props: any) => (
    <View
      style={{
        width: '80%',
        backgroundColor: '#111',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
      }}
    >
      <BaseToast
        {...props}
        style={{ borderLeftWidth: 0, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        text1Style={{ fontSize: 16, fontWeight: '600', color: 'white', textAlign: 'center' }}
        text2Style={{ fontSize: 14, color: '#ccc', textAlign: 'center' }}
      />
    </View>
  ),

  error: (props: any) => (
    <View
      style={{
        width: '80%',
        backgroundColor: '#400',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
      }}
    >
      <ErrorToast
        {...props}
        style={{ borderLeftWidth: 0, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        text1Style={{ fontSize: 16, fontWeight: '600', color: 'white', textAlign: 'center' }}
        text2Style={{ fontSize: 14, color: '#eee', textAlign: 'center' }}
      />
    </View>
  ),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast config={toastConfig} position="top"/>
    </ThemeProvider>
  );
}
