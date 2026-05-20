import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { DaysOne_400Regular } from '@expo-google-fonts/days-one';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: Inter_400Regular,
    'Days One': DaysOne_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
