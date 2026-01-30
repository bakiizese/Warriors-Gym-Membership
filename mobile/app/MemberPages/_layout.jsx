import { Stack } from "expo-router";
import AppGradient from "../../components/AppGradient";

export default function MemberLayout() {
  return (
    <AppGradient>
      <Stack screenOptions={{ headerShown: false }} />
    </AppGradient>
  );
}
