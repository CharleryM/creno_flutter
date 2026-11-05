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

import { useAuth } from "../../../contexts/AuthContext";
import { apiFetch } from "../../../services/api";
import type {
  CourseMutationResponse,
  MyCoursesResponse,
  OwnerCourseStatus,
} from "../../../types/ownerCourse";
import {
  buildCourseDate,
  eurosToCents,
  formatInputDate,
  formatInputTime,
} from "../../../utils/courseForm";

export default function EditCourseScreen() {
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
  ] = useState("");

  const [price, setPrice] =
    useState("");

  const [capacity, setCapacity] =
    useState("");

  const [status, setStatus] =
    useState<OwnerCourseStatus>(
      "DRAFT",
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
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
          "Identifiant de cours invalide.",
        );
        setLoading(false);
        return;
      }

      try {
        const data =
          await apiFetch<MyCoursesResponse>(
            "/courses/mine",
            {
              token,
            },
          );

        const course =
          data.courses.find(
            (item) =>
              item.id === id,
          );

        if (!course) {
          setError(
            "Cours introuvable.",
          );
          return;
        }

        setTitle(
          course.title,
        );

        setDiscipline(
          course.discipline,
        );

        setDescription(
          course.description ?? "",
        );

        setDate(
          formatInputDate(
            course.startAt,
          ),
        );

        setTime(
          formatInputTime(
            course.startAt,
          ),
        );

        setDurationMinutes(
          String(
            course.durationMinutes,
          ),
        );

        setPrice(
          (
            course.priceCents /
            100
          ).toFixed(2),
        );

        setCapacity(
          String(course.capacity),
        );

        setStatus(
          course.status,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le cours.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [
    params.id,
    token,
    user?.role,
  ]);

  async function saveCourse() {
    const id = params.id;

    if (
      typeof id !== "string" ||
      !token
    ) {
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
        "Prix invalide.",
      );
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < 15
    ) {
      setError(
        "Durée invalide.",
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
        "Capacité invalide.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await apiFetch<CourseMutationResponse>(
        `/courses/${id}`,
        {
          method: "PATCH",
          token,

          body: JSON.stringify({
            title:
              title.trim(),

            discipline:
              discipline.trim(),

            description:
              description.trim(),

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
        "Cours modifié",
        "Les modifications ont été enregistrées.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le cours.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    newStatus:
      | "PUBLISHED"
      | "CANCELLED",
  ) {
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

      await apiFetch<CourseMutationResponse>(
        `/courses/${id}`,
        {
          method: "PATCH",
          token,

          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      setStatus(newStatus);

      Alert.alert(
        newStatus === "PUBLISHED"
          ? "Cours publié"
          : "Cours annulé",

        newStatus === "PUBLISHED"
          ? "Le cours est maintenant visible dans le catalogue."
          : "Le cours n'est plus visible dans le catalogue.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de changer le statut.",
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
          Gérer le cours
        </Text>

        <View className="mt-4 self-start rounded-full bg-neutral-100 px-4 py-2">
          <Text
            style={{
              color: "#525252",
              fontWeight: "700",
            }}
          >
            {status === "DRAFT"
              ? "Brouillon"
              : status ===
                  "PUBLISHED"
                ? "Publié"
                : "Annulé"}
          </Text>
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

        <View className="mt-7">
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
            Date (AAAA-MM-JJ)
          </Text>

          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-20"
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

        <TouchableOpacity
          className="mt-8 items-center rounded-xl bg-creno-lime py-4"
          disabled={saving}
          onPress={saveCourse}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Enregistrer les modifications
            </Text>
          )}
        </TouchableOpacity>

        {status !== "PUBLISHED" ? (
          <TouchableOpacity
            className="mt-4 items-center rounded-xl border border-neutral-300 py-4"
            disabled={saving}
            onPress={() =>
              changeStatus(
                "PUBLISHED",
              )
            }
          >
            <Text
              style={{
                fontWeight: "700",
              }}
            >
              Publier le cours
            </Text>
          </TouchableOpacity>
        ) : null}

        {status !== "CANCELLED" ? (
          <TouchableOpacity
            className="mt-4 items-center rounded-xl border border-neutral-300 py-4"
            disabled={saving}
            onPress={() =>
              changeStatus(
                "CANCELLED",
              )
            }
          >
            <Text
              style={{
                color: "#B91C1C",
                fontWeight: "700",
              }}
            >
              Annuler le cours
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}