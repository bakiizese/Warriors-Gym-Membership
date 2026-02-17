import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppGradient from "../../../components/AppGradient";

export default function WorkoutLayout() {
  return (
    <AppGradient>
      <Stack screenOptions={{ headerShown: false }} />
    </AppGradient>
  );
}
