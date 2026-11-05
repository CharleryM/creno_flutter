import "../../global.css";

import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "../contexts/AuthContext";

function getStripePublishableKey(): string {
  const key =
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY est manquante. Vérifie mobile/.env.",
    );
  }

  return key;
}

const stripePublishableKey =
  getStripePublishableKey();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={stripePublishableKey}
      >
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}