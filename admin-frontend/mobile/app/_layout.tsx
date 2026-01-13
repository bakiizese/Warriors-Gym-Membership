import { Stack } from "expo-router";
import "@/global.css";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  useFonts,
  Jura_400Regular,
  Jura_700Bold,
} from "@expo-google-fonts/jura";
//import readtag from "../components/NFC_Reader";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Jura_400Regular,
    Jura_700Bold,
  });
  //readtag();

  useEffect(() => {
    readtag();
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" />
      <Stack.Screen name="AuthPage" />
      <Stack.Screen name="AdminDashboard" />
    </Stack>
  );
}
