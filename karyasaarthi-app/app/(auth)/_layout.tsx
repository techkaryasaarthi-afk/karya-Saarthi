/**
 * Auth Group Layout — Stack navigator for all auth-related screens.
 * No bottom tabs shown during auth flow.
 */

import { Stack } from 'expo-router';
import { useAppTheme } from '@/utils/theme';

export default function AuthLayout() {
  const theme = useAppTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="explore" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="vendor-apply" />
    </Stack>
  );
}
