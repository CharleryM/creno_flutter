import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../services/api";
import type {
  MyReservation,
  ReservationsResponse,
  ReservationStatus,
} from "../types/reservation";
import {
  formatCourseDate,
  formatPrice,
} from "../utils/format";

function getStatusLabel(
  status: ReservationStatus,
) {
  switch (status) {
    case "PENDING":
      return "En attente de paiement";

    case "PAID":
      return "Payée";

    case "CANCELLED":
      return "Annulée";

    case "REFUNDED":
      return "Remboursée";
  }
}

export default function ReservationsScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const [
    reservations,
    setReservations,
  ] = useState<MyReservation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadReservations = useCallback(
    async (isRefresh = false) => {
      if (!token) {
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

        const data =
          await apiFetch<ReservationsResponse>(
            "/reservations/mine",
            {
              token,
            },
          );

        setReservations(
          data.reservations,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les réservations.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  if (!user || !token) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
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
          Connecte-toi pour voir tes
          réservations
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

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />

      <View className="px-6 pb-5 pt-5">
        <TouchableOpacity
          className="mb-7 self-start rounded-xl bg-neutral-100 px-4 py-3"
          onPress={() => router.back()}
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
          Mes réservations
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
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
            Impossible de charger les
            réservations
          </Text>

          <Text
            style={{
              color: "#737373",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {error}
          </Text>

          <TouchableOpacity
            className="mt-6 rounded-xl bg-creno-lime px-6 py-4"
            onPress={() =>
              loadReservations()
            }
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
          data={reservations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom:
              insets.bottom + 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                loadReservations(true)
              }
            />
          }
          renderItem={({ item }) => (
            <View className="mb-4 rounded-2xl border border-neutral-200 p-5">
              <Text
                style={{
                  color: "#737373",
                  fontSize: 13,
                  fontWeight: "600",
                  textTransform:
                    "uppercase",
                }}
              >
                {item.course.discipline}
              </Text>

              <Text
                style={{
                  color: "#111111",
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                {item.course.title}
              </Text>

              <Text
                style={{
                  color: "#525252",
                  marginTop: 8,
                }}
              >
                {item.course.studio.name}
              </Text>

              <Text
                style={{
                  color: "#737373",
                  marginTop: 5,
                }}
              >
                {formatCourseDate(
                  item.course.startAt,
                )}
              </Text>

              <View className="mt-5 flex-row items-center justify-between">
                <Text
                  style={{
                    color: "#111111",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {formatPrice(
                    item.amountCents,
                  )}
                </Text>

                <Text
                  style={{
                    color: "#525252",
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {getStatusLabel(
                    item.status,
                  )}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text
                style={{
                  color: "#111111",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Aucune réservation
              </Text>

              <Text
                style={{
                  color: "#737373",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Tes prochains cours
                apparaîtront ici.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}