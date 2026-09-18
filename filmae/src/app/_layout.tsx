import RegistrationProvider from '../context/RegistrationContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <RegistrationProvider>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          animation: 'fade',
          headerShown: false,
        }}
      />
    </RegistrationProvider>
  );
}

