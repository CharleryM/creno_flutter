import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useEffect,
  useState,
} from "react";
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
import type {
  MyStudiosResponse,
  StudioMutationResponse,
} from "../../types/studio";

export default function EditStudioScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<{
      id: string;
    }>();

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
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadStudio() {
      if (
        !token ||
        user?.role !== "OWNER"
      ) {
        setError(
          "Accès réservé aux propriétaires.",
        );
        setLoading(false);
        return;
      }

      const id = params.id;

      if (typeof id !== "string") {
        setError(
          "Identifiant de studio invalide.",
        );
        setLoading(false);
        return;
      }

      try {
        const data =
          await apiFetch<MyStudiosResponse>(
            "/studios/mine",
            {
              token,
            },
          );

        const studio =
          data.studios.find(
            (item) =>
              item.id === id,
          );

        if (!studio) {
          setError(
            "Studio introuvable.",
          );
          return;
        }

        setName(studio.name);

        setDescription(
          studio.description ?? "",
        );

        setAddress(
          studio.address,
        );

        setPostalCode(
          studio.postalCode,
        );

        setCity(studio.city);

        setPhone(
          studio.phone ?? "",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le studio.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudio();
  }, [
    params.id,
    token,
    user?.role,
  ]);

  async function handleSave() {
    const id = params.id;

    if (
      typeof id !== "string" ||
      !token
    ) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await apiFetch<StudioMutationResponse>(
        `/studios/${id}`,
        {
          method: "PATCH",
          token,

          body: JSON.stringify({
            name: name.trim(),

            description:
              description.trim(),

            address:
              address.trim(),

            postalCode:
              postalCode.trim(),

            city: city.trim(),

            phone:
              phone.trim(),
          }),
        },
      );

      Alert.alert(
        "Studio modifié",
        "Les informations ont été enregistrées.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le studio.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="large"
        />
      </View>
    );
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
          Modifier le studio
        </Text>

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

        <View className="mt-8">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Nom
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
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
            Adresse
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
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
            Code postal
          </Text>

          <TextInput
            value={postalCode}
            onChangeText={
              setPostalCode
            }
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
            Ville
          </Text>

          <TextInput
            value={city}
            onChangeText={setCity}
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
            keyboardType="phone-pad"
            className="rounded-xl border border-neutral-300 px-4 py-4"
          />
        </View>

        <TouchableOpacity
          className="mt-8 items-center rounded-xl bg-creno-lime py-4"
          disabled={saving}
          onPress={handleSave}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{
                color: "#111111",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Enregistrer
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}