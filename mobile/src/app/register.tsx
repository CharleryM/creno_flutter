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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleRegister() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(
        "Tous les champs sont obligatoires.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (
      password !== passwordConfirmation
    ) {
      setError(
        "Les mots de passe ne correspondent pas.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le compte.",
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
          paddingTop: insets.top + 20,
          paddingBottom:
            insets.bottom + 30,
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
          Créer un compte
        </Text>

        <Text
          style={{
            color: "#737373",
            fontSize: 16,
            lineHeight: 23,
            marginTop: 8,
          }}
        >
          Réserve tes prochains cours à
          la dernière minute.
        </Text>

        <View className="mt-10">
          <Text
            style={{
              color: "#111111",
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Prénom
          </Text>

          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Julie"
            autoCapitalize="words"
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
            Nom
          </Text>

          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Martin"
            autoCapitalize="words"
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
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="julie@exemple.fr"
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
            placeholder="8 caractères minimum"
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
            Confirmer le mot de passe
          </Text>

          <TextInput
            value={passwordConfirmation}
            onChangeText={
              setPasswordConfirmation
            }
            secureTextEntry
            placeholder="Confirme ton mot de passe"
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
          disabled={loading}
          activeOpacity={0.8}
          onPress={handleRegister}
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
              Créer mon compte
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 items-center py-3"
          onPress={() =>
            router.replace("/login")
          }
        >
          <Text
            style={{
              color: "#525252",
              fontSize: 15,
            }}
          >
            Déjà un compte ?{" "}
            <Text
              style={{
                color: "#111111",
                fontWeight: "700",
              }}
            >
              Se connecter
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}