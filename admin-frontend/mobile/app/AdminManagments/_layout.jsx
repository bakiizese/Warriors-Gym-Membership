import { Stack } from "expo-router";
import AppGradient from "../../components/AppGradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminLayout() {
  return (
    <AppGradient>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppGradient>
  );
}
