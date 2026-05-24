import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { DaysOne_400Regular } from '@expo-google-fonts/days-one';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

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
    <>
      <StatusBar style="light" />
      {/* 
        ========================================================
        PROVIDERS GLOBAIS ENTRARIAM AQUI:
        <AuthProvider>
          <ThemeProvider>
            <ReduxProvider store={store}>
        ========================================================
      */}
      
      <Slot />

      {/* 
        ========================================================
            </ReduxProvider>
          </ThemeProvider>
        </AuthProvider>
        ========================================================
      */}
    </>
  );
}
