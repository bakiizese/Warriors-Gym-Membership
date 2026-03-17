import AppGradient from "@/components/AppGradient";
import Auth from "@/components/AuthPage/Auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {}, []);

  const { path } = useLocalSearchParams();

  return (
    <AppGradient>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <Auth path={path} />
      </SafeAreaView>
    </AppGradient>
  );
}
