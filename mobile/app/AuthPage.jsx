import AppGradient from "@/components/AppGradient";
import Auth from "@/components/AuthPage/Auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function AuthPage() {
  const { path } = useLocalSearchParams();
  return (
    <AppGradient>
      <SafeAreaView>
        <Auth path={path} />
      </SafeAreaView>
    </AppGradient>
  );
}
