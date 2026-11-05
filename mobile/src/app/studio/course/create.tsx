import { router } from "expo-router";
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

import { useAuth } from "../../../contexts/AuthContext";
import { apiFetch } from "../../../services/api";
import type { CourseMutationResponse } from "../../../types/ownerCourse";
import type {
  MyStudiosResponse,
  OwnerStudio,
} from "../../../types/studio";
import {
  buildCourseDate,
  eurosToCents,
} from "../../../utils/courseForm";

export default function CreateCourseScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    token,
    user,
  } = useAuth();

  const [studios, setStudios] =
    useState<OwnerStudio[]>([]);

  const [
    selectedStudioId,
    setSelectedStudioId,
  ] = useState("");

  const [title, setTitle] =
    useState("");

  const [
    discipline,
    setDiscipline,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState("60");

  const [price, setPrice] =
    useState("");

  const [capacity, setCapacity] =
    useState("10");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadStudios() {
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

      try {
        const data =
          await apiFetch<MyStudiosResponse>(
            "/studios/mine",
            {
              token,
            },
          );

        setStudios(
          data.studios,
        );

        if (
          data.studios.length > 0
        ) {
          setSelectedStudioId(
            data.studios[0].id,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les studios.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStudios();
  }, [
    token,
    user?.role,
  ]);

  async function handleCreate() {
    if (!token) {
      return;
    }

    const startAt =
      buildCourseDate(
        date,
        time,
      );

    const priceCents =
      eurosToCents(price);

    const duration =
      Number(durationMinutes);

    const courseCapacity =
      Number(capacity);

    if (!selectedStudioId) {
      setError(
        "Choisis un studio.",
      );
      return;
    }

    if (
      !title.trim() ||
      !discipline.trim()
    ) {
      setError(
        "Titre et discipline sont obligatoires.",
      );
      return;
    }

    if (!startAt) {
      setError(
        "Utilise une date au format AAAA-MM-JJ et une heure au format HH:MM.",
      );
      return;
    }

    if (
      startAt.getTime() <=
      Date.now()
    ) {
      setError(
        "Le cours doit être prévu dans le futur.",
      );
      return;
    }

    if (priceCents === null) {
      setError(
        "Le prix est invalide.",
      );
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < 15
    ) {
      setError(
        "La durée est invalide.",
      );
      return;
    }

    if (
      !Number.isInteger(
        courseCapacity,
      ) ||
      courseCapacity < 1
    ) {
      setError(
        "La capacité est invalide.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await apiFetch<CourseMutationResponse>(
        "/courses",
        {
          method: "POST",
          token,

          body: JSON.stringify({
            studioId:
              selectedStudioId,

            title:
              title.trim(),

            discipline:
              discipline.trim(),

            description:
              description.trim() ||
              undefined,

            startAt:
              startAt.toISOString(),

            durationMinutes:
              duration,

            priceCents,

            capacity:
              courseCapacity,
          }),
        },
      );

      Alert.alert(
        "Cours créé",
        "Le cours a été créé en brouillon.",
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
          : "Impossible de créer le cours.",
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
            fontSize: 30,
            fontWeight: "800",
          }}
        >
          Nouveau cours
        </Text>

        <Text
          style={{
            color: "#737373",
            marginTop: 8,
          }}
        >
          Le cours sera d'abord créé en
          brouillon.
        </Text>

        <Text
          style={{
            fontWeight: "700",
            marginTop: 30,
          }}
        >
          Studio
        </Text>

        {studios.map((studio) => (
          <TouchableOpacity
            key={studio.id}
            className={
              selectedStudioId ===
              studio.id
                ? "mt-3 rounded-xl border border-black bg-neutral-100 p-4"
                : "mt-3 rounded-xl border border-neutral-300 p-4"
            }
            onPress={() =>
              setSelectedStudioId(
                studio.id,
              )
            }
          >
            <Text
              style={{
                fontWeight: "700",
              }}
            >
              {studio.name}
            </Text>

            <Text
              style={{
                color: "#737373",
                marginTop: 4,
              }}
            >
              {studio.city}
            </Text>
          </TouchableOpacity>
        ))}

        <View className="mt-6">
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Titre
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Pilates Reformer débutant"
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
            Discipline
          </Text>

          <TextInput
            value={discipline}
            onChangeText={
              setDiscipline
            }
            placeholder="Pilates"
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
            placeholder="Description du cours"
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
            Date (AAAA-MM-JJ)
          </Text>

          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-20"
            autoCapitalize="none"
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
            Heure (HH:MM)
          </Text>

          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="18:30"
            autoCapitalize="none"
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
            Durée en minutes
          </Text>

          <TextInput
            value={durationMinutes}
            onChangeText={
              setDurationMinutes
            }
            keyboardType="number-pad"
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
            Prix en euros
          </Text>

          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="19,00"
            keyboardType="decimal-pad"
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
            Capacité
          </Text>

          <TextInput
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
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
          disabled={saving}
          onPress={handleCreate}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Créer le brouillon
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}