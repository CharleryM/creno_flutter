import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(
        "Renseigne ton email et ton mot de passe.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await signIn(
        email.trim(),
        password,
      );

      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de se connecter.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <StatusBar style="dark" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom:
            insets.bottom + 24,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-10 self-start rounded-xl bg-neutral-100 px-4 py-3"
        >
          <Text
            style={{
              color: "#111111",
              fontWeight: "600",
            }}
          >
            ← Retour
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: "#111111",
            fontSize: 32,
            fontWeight: "800",
          }}
        >
          Se connecter
        </Text>

        <Text
          style={{
            color: "#737373",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          Retrouve tes prochains créneaux
          CRÉNO.
        </Text>

        <View className="mt-10">
          <Text
            style={{
              color: "#111111",
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="email@exemple.fr"
            className="rounded-xl border border-neutral-300 px-4 py-4"
            style={{
              color: "#111111",
              fontSize: 16,
            }}
          />
        </View>

        <View className="mt-5">
          <Text
            style={{
              color: "#111111",
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Mot de passe
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Ton mot de passe"
            className="rounded-xl border border-neutral-300 px-4 py-4"
            style={{
              color: "#111111",
              fontSize: 16,
            }}
          />
        </View>

        {error ? (
          <View className="mt-5 rounded-xl bg-neutral-100 p-4">
            <Text
              style={{
                color: "#B91C1C",
                fontSize: 14,
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          className="mt-8 items-center rounded-xl bg-creno-lime py-4"
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{
                color: "#111111",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Se connecter
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 items-center py-3"
          onPress={() =>
            router.push("/register")
          }
        >
          <Text
            style={{
              color: "#525252",
              fontSize: 15,
            }}
          >
            Pas encore de compte ?{" "}
            <Text
              style={{
                color: "#111111",
                fontWeight: "700",
              }}
            >
              Créer un compte
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}