import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../services/api";
import type { StudioMutationResponse } from "../../types/studio";

export default function CreateStudioScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    token,
    user,
  } = useAuth();

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [address, setAddress] =
    useState("");

  const [
    postalCode,
    setPostalCode,
  ] = useState("");

  const [city, setCity] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit() {
    if (
      !token ||
      user?.role !== "OWNER"
    ) {
      setError(
        "Accès réservé aux propriétaires.",
      );
      return;
    }

    if (
      !name.trim() ||
      !address.trim() ||
      !postalCode.trim() ||
      !city.trim()
    ) {
      setError(
        "Nom, adresse, code postal et ville sont obligatoires.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiFetch<StudioMutationResponse>(
        "/studios",
        {
          method: "POST",
          token,

          body: JSON.stringify({
            name: name.trim(),

            description:
              description.trim() ||
              undefined,

            address:
              address.trim(),

            postalCode:
              postalCode.trim(),

            city: city.trim(),

            phone:
              phone.trim() ||
              undefined,
          }),
        },
      );

      Alert.alert(
        "Studio créé",
        "Ton studio a bien été ajouté.",
        [
          {
            text: "Continuer",
            onPress: () =>
              router.replace(
                "/studio-dashboard",
              ),
          },
        ],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le studio.",
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
          paddingTop:
            insets.top + 20,
          paddingBottom:
            insets.bottom + 30,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          className="mb-8 self-start rounded-xl bg-neutral-100 px-4 py-3"
          onPress={() =>
            router.back()
          }
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
            fontSize: 30,
            fontWeight: "800",
          }}
        >
          Nouveau studio
        </Text>

        <View className="mt-8">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Nom *
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Reformer Club Paris"
            className="rounded-xl border border-neutral-300 px-4 py-4"
          />
        </View>

        <View className="mt-5">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Description
          </Text>

          <TextInput
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Présentation du studio"
            multiline
            className="min-h-24 rounded-xl border border-neutral-300 px-4 py-4"
            textAlignVertical="top"
          />
        </View>

        <View className="mt-5">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Adresse *
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="12 rue Oberkampf"
            className="rounded-xl border border-neutral-300 px-4 py-4"
          />
        </View>

        <View className="mt-5">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Code postal *
          </Text>

          <TextInput
            value={postalCode}
            onChangeText={
              setPostalCode
            }
            placeholder="75011"
            keyboardType="numbers-and-punctuation"
            className="rounded-xl border border-neutral-300 px-4 py-4"
          />
        </View>

        <View className="mt-5">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Ville *
          </Text>

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Paris"
            className="rounded-xl border border-neutral-300 px-4 py-4"
          />
        </View>

        <View className="mt-5">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Téléphone
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="0612345678"
            keyboardType="phone-pad"
            className="rounded-xl border border-neutral-300 px-4 py-4"
          />
        </View>

        {error ? (
          <View className="mt-5 rounded-xl bg-neutral-100 p-4">
            <Text
              style={{
                color: "#B91C1C",
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          className="mt-8 items-center rounded-xl bg-creno-lime py-4"
          disabled={loading}
          onPress={handleSubmit}
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
              Créer le studio
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}