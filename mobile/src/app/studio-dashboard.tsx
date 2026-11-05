import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../services/api";
import type {
  MyCoursesResponse,
  OwnerCourse,
  OwnerCourseStatus,
} from "../types/ownerCourse";
import type {
  MyStudiosResponse,
  OwnerStudio,
} from "../types/studio";
import {
  formatCourseDate,
  formatPrice,
} from "../utils/format";

function getStatusLabel(
  status: OwnerCourseStatus,
) {
  switch (status) {
    case "DRAFT":
      return "Brouillon";

    case "PUBLISHED":
      return "Publié";

    case "CANCELLED":
      return "Annulé";
  }
}

export default function StudioDashboardScreen() {
  const insets = useSafeAreaInsets();

  const {
    user,
    token,
    isLoading: authLoading,
  } = useAuth();

  const [studios, setStudios] =
    useState<OwnerStudio[]>([]);

  const [courses, setCourses] =
    useState<OwnerCourse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (
        !token ||
        user?.role !== "OWNER"
      ) {
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          studiosData,
          coursesData,
        ] = await Promise.all([
          apiFetch<MyStudiosResponse>(
            "/studios/mine",
            {
              token,
            },
          ),

          apiFetch<MyCoursesResponse>(
            "/courses/mine",
            {
              token,
            },
          ),
        ]);

        setStudios(
          studiosData.studios,
        );

        setCourses(
          coursesData.courses,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger l'espace studio.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, user?.role],
  );

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [
    authLoading,
    loadDashboard,
  ]);

  if (
    authLoading ||
    loading
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  if (!user || !token) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{
          paddingTop: insets.top,
          paddingBottom:
            insets.bottom,
        }}
      >
        <Text
          style={{
            color: "#111111",
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Connecte-toi pour accéder
          à ton espace studio
        </Text>

        <TouchableOpacity
          className="mt-6 rounded-xl bg-creno-lime px-6 py-4"
          onPress={() =>
            router.replace("/login")
          }
        >
          <Text
            style={{
              color: "#111111",
              fontWeight: "700",
            }}
          >
            Se connecter
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{
          paddingTop: insets.top,
          paddingBottom:
            insets.bottom,
        }}
      >
        <Text
          style={{
            color: "#111111",
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Accès réservé aux
          propriétaires de studios
        </Text>

        <TouchableOpacity
          className="mt-6 rounded-xl bg-neutral-100 px-6 py-4"
          onPress={() =>
            router.replace("/")
          }
        >
          <Text
            style={{
              color: "#111111",
              fontWeight: "700",
            }}
          >
            Retour à l'accueil
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadDashboard(true)
            }
          />
        }
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
            fontSize: 32,
            fontWeight: "800",
          }}
        >
          Espace studio
        </Text>

        <Text
          style={{
            color: "#737373",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          Bonjour {user.firstName},
          gère ici tes studios et tes
          cours.
        </Text>

        {error ? (
          <View className="mt-6 rounded-xl bg-neutral-100 p-4">
            <Text
              style={{
                color: "#B91C1C",
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mt-10 flex-row items-center justify-between">
          <Text
            style={{
              color: "#111111",
              fontSize: 24,
              fontWeight: "800",
            }}
          >
            Mes studios
          </Text>

          <TouchableOpacity
            className="rounded-xl bg-creno-lime px-4 py-3"
            onPress={() =>
              router.push(
                "/studio/create",
              )
            }
          >
            <Text
              style={{
                color: "#111111",
                fontWeight: "700",
              }}
            >
              + Studio
            </Text>
          </TouchableOpacity>
        </View>

        {studios.length === 0 ? (
          <View className="mt-5 rounded-2xl bg-neutral-100 p-5">
            <Text
              style={{
                color: "#525252",
                textAlign: "center",
              }}
            >
              Tu n'as pas encore de
              studio.
            </Text>
          </View>
        ) : (
          studios.map((studio) => (
            <TouchableOpacity
              key={studio.id}
              className="mt-4 rounded-2xl border border-neutral-200 p-5"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname:
                    "/studio/[id]",
                  params: {
                    id: studio.id,
                  },
                })
              }
            >
              <Text
                style={{
                  color: "#111111",
                  fontSize: 19,
                  fontWeight: "700",
                }}
              >
                {studio.name}
              </Text>

              <Text
                style={{
                  color: "#737373",
                  marginTop: 6,
                }}
              >
                {studio.city}
              </Text>

              <Text
                style={{
                  color: "#737373",
                  marginTop: 6,
                  fontSize: 13,
                }}
              >
                {
                  studio._count
                    .courses
                }{" "}
                cours
              </Text>
            </TouchableOpacity>
          ))
        )}

        <View className="mt-12 flex-row items-center justify-between">
          <Text
            style={{
              color: "#111111",
              fontSize: 24,
              fontWeight: "800",
            }}
          >
            Mes cours
          </Text>

          <TouchableOpacity
            className={
              studios.length === 0
                ? "rounded-xl bg-neutral-200 px-4 py-3"
                : "rounded-xl bg-creno-lime px-4 py-3"
            }
            disabled={
              studios.length === 0
            }
            onPress={() =>
              router.push(
                "/studio/course/create",
              )
            }
          >
            <Text
              style={{
                color: "#111111",
                fontWeight: "700",
              }}
            >
              + Cours
            </Text>
          </TouchableOpacity>
        </View>

        {studios.length === 0 ? (
          <Text
            style={{
              color: "#737373",
              marginTop: 10,
              fontSize: 13,
            }}
          >
            Crée d'abord un studio pour
            pouvoir ajouter un cours.
          </Text>
        ) : null}

        {courses.length === 0 ? (
          <View className="mt-5 rounded-2xl bg-neutral-100 p-5">
            <Text
              style={{
                color: "#525252",
                textAlign: "center",
              }}
            >
              Aucun cours créé.
            </Text>
          </View>
        ) : (
          courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              className="mt-4 rounded-2xl border border-neutral-200 p-5"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname:
                    "/studio/course/[id]",
                  params: {
                    id: course.id,
                  },
                })
              }
            >
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    color:
                      "#737373",
                    fontSize: 12,
                    fontWeight:
                      "700",
                    textTransform:
                      "uppercase",
                  }}
                >
                  {
                    course.discipline
                  }
                </Text>

                <Text
                  style={{
                    color:
                      "#525252",
                    fontSize: 12,
                    fontWeight:
                      "700",
                  }}
                >
                  {getStatusLabel(
                    course.status,
                  )}
                </Text>
              </View>

              <Text
                style={{
                  color: "#111111",
                  fontSize: 19,
                  fontWeight: "700",
                  marginTop: 7,
                }}
              >
                {course.title}
              </Text>

              <Text
                style={{
                  color: "#737373",
                  marginTop: 6,
                }}
              >
                {course.studio.name}
              </Text>

              <Text
                style={{
                  color: "#737373",
                  marginTop: 6,
                }}
              >
                {formatCourseDate(
                  course.startAt,
                )}
              </Text>

              <Text
                style={{
                  color: "#111111",
                  fontWeight: "700",
                  marginTop: 8,
                }}
              >
                {formatPrice(
                  course.priceCents,
                )}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}