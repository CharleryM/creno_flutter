import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseCard } from "../components/CourseCard";
import { apiFetch } from "../services/api";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import type {
  CoursesResponse,
  PublicCourse,
} from "../types/course";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [courses, setCourses] = useState<
    PublicCourse[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const loadCourses = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const data =
          await apiFetch<CoursesResponse>(
            "/courses",
          );

        setCourses(data.courses);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les cours.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />

      <View className="px-6 pb-4 pt-6">
        <View className="flex-row items-center justify-between">
          <Text
            style={{
              color: "#111111",
              fontSize: 30,
              fontWeight: "800",
            }}
          >
            CRÉNO
          </Text>

          <TouchableOpacity
            className="rounded-full bg-neutral-100 px-4 py-3"
            onPress={() =>
              router.push(
                user
                  ? "/account"
                  : "/login",
              )
            }
          >
            <Text
              style={{
                color: "#111111",
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {user
                ? user.firstName
                : "Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: "#111111",
            fontSize: 28,
            fontWeight: "700",
            marginTop: 28,
          }}
        >
          Cours disponibles
        </Text>

        <Text
          style={{
            color: "#737373",
            fontSize: 16,
            lineHeight: 23,
            marginTop: 8,
          }}
        >
          Réserve une place dans un studio
          près de chez toi.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />

          <Text
            style={{
              color: "#737373",
              fontSize: 14,
              marginTop: 12,
            }}
          >
            Chargement des cours...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            style={{
              color: "#111111",
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Impossible de charger les cours
          </Text>

          <Text
            style={{
              color: "#737373",
              fontSize: 14,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {error}
          </Text>

          <TouchableOpacity
            className="mt-6 rounded-xl bg-creno-lime px-6 py-4"
            onPress={() => loadCourses()}
          >
            <Text
              style={{
                color: "#111111",
                fontWeight: "700",
              }}
            >
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(course) => course.id}
          renderItem={({ item }) => (
            <CourseCard course={item} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                loadCourses(true)
              }
            />
          }
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text
                style={{
                  color: "#111111",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Aucun cours disponible
              </Text>

              <Text
                style={{
                  color: "#737373",
                  fontSize: 14,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Les prochains créneaux
                apparaîtront ici.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}