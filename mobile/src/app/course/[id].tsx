import {
  PaymentSheetError,
  useStripe,
} from "@stripe/stripe-react-native";
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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../services/api";
import type {
  CourseDetail,
  CourseResponse,
} from "../../types/course";
import type {
  CancelPaymentResponse,
  ConfirmPaymentResponse,
  PreparePaymentResponse,
} from "../../types/payment";
import {
  formatCourseDate,
  formatPrice,
} from "../../utils/format";

export default function CourseDetailScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<{
      id: string;
    }>();

  const {
    user,
    token,
  } = useAuth();

  const {
    initPaymentSheet,
    presentPaymentSheet,
  } = useStripe();

  const [course, setCourse] =
    useState<CourseDetail | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [paying, setPaying] =
    useState(false);

  const [
    paymentError,
    setPaymentError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadCourse() {
      const id = params.id;

      if (
        typeof id !== "string"
      ) {
        setError(
          "Identifiant de cours invalide.",
        );
        setLoading(false);
        return;
      }

      try {
        const data =
          await apiFetch<CourseResponse>(
            `/courses/${id}`,
          );

        setCourse(data.course);
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
  }, [params.id]);

  async function cancelPendingPayment(
    reservationId: string,
  ) {
    if (!token) {
      return;
    }

    try {
      await apiFetch<CancelPaymentResponse>(
        "/payments/cancel",
        {
          method: "POST",
          token,

          body: JSON.stringify({
            reservationId,
          }),
        },
      );
    } catch (err) {
      console.error(
        "Impossible d'annuler la réservation en attente :",
        err,
      );
    }
  }

  async function handlePayment() {
    if (!user || !token) {
      router.push("/login");
      return;
    }

    if (!course) {
      return;
    }

    try {
      setPaying(true);
      setPaymentError(null);

      const preparation =
        await apiFetch<PreparePaymentResponse>(
          "/payments/prepare",
          {
            method: "POST",
            token,

            body: JSON.stringify({
              courseId:
                course.id,
            }),
          },
        );

      if (
        preparation.alreadyPaid
      ) {
        router.push(
          "/reservations",
        );
        return;
      }

      if (
        !preparation.clientSecret
      ) {
        throw new Error(
          "Impossible d'initialiser le paiement.",
        );
      }

      const {
        error:
          initializationError,
      } =
        await initPaymentSheet({
          merchantDisplayName:
            "CRÉNO",

          paymentIntentClientSecret:
            preparation.clientSecret,

          allowsDelayedPaymentMethods:
            false,

          defaultBillingDetails: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
        });

      if (
        initializationError
      ) {
        await cancelPendingPayment(
          preparation.reservationId,
        );

        setPaymentError(
          initializationError.message,
        );

        return;
      }

      const {
        error:
          stripePaymentError,
      } =
        await presentPaymentSheet();

      if (stripePaymentError) {
        await cancelPendingPayment(
          preparation.reservationId,
        );

        if (
          stripePaymentError.code ===
          PaymentSheetError.Canceled
        ) {
          setPaymentError(
            "Paiement annulé. Ta place a été libérée.",
          );
        } else {
          setPaymentError(
            stripePaymentError.message,
          );
        }

        return;
      }

      try {
        await apiFetch<ConfirmPaymentResponse>(
          "/payments/confirm",
          {
            method: "POST",
            token,

            body: JSON.stringify({
              reservationId:
                preparation.reservationId,
            }),
          },
        );
      } catch (err) {
        setPaymentError(
          err instanceof Error
            ? err.message
            : "Le paiement a été effectué mais sa confirmation a échoué.",
        );

        return;
      }

      Alert.alert(
        "Paiement réussi",
        "Ta réservation est confirmée.",
        [
          {
            text: "Voir mes réservations",
            onPress: () =>
              router.replace(
                "/reservations",
              ),
          },
        ],
      );
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Impossible de lancer le paiement.",
      );
    } finally {
      setPaying(false);
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

  if (error || !course) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-6"
        style={{
          paddingTop:
            insets.top,
          paddingBottom:
            insets.bottom,
        }}
      >
        <Text
          style={{
            color: "#111111",
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Cours introuvable
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
            router.back()
          }
        >
          <Text
            style={{
              color: "#111111",
              fontWeight: "700",
            }}
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{
          paddingTop:
            insets.top + 16,
          paddingBottom:
            insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          className="mb-8 self-start rounded-xl bg-neutral-100 px-4 py-3"
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
            color: "#737373",
            fontSize: 14,
            fontWeight: "600",
            textTransform:
              "uppercase",
          }}
        >
          {course.discipline}
        </Text>

        <Text
          style={{
            color: "#111111",
            fontSize: 34,
            fontWeight: "800",
            lineHeight: 40,
            marginTop: 8,
          }}
        >
          {course.title}
        </Text>

        <Text
          style={{
            color: "#111111",
            fontSize: 24,
            fontWeight: "800",
            marginTop: 20,
          }}
        >
          {formatPrice(
            course.priceCents,
          )}
        </Text>

        <View className="mt-8 rounded-2xl bg-neutral-100 p-5">
          <Text
            style={{
              color: "#111111",
              fontWeight: "700",
              fontSize: 17,
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
            {course.studio.address},{" "}
            {
              course.studio
                .postalCode
            }{" "}
            {course.studio.city}
          </Text>
        </View>

        <View className="mt-8">
          <Text
            style={{
              color: "#111111",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Date
          </Text>

          <Text
            style={{
              color: "#525252",
              marginTop: 6,
            }}
          >
            {formatCourseDate(
              course.startAt,
            )}
          </Text>
        </View>

        <View className="mt-6">
          <Text
            style={{
              color: "#111111",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Durée
          </Text>

          <Text
            style={{
              color: "#525252",
              marginTop: 6,
            }}
          >
            {
              course.durationMinutes
            }{" "}
            minutes
          </Text>
        </View>

        <View className="mt-6">
          <Text
            style={{
              color: "#111111",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Places
          </Text>

          <Text
            style={{
              color: "#525252",
              marginTop: 6,
            }}
          >
            {course.availablePlaces ===
            0
              ? "Complet"
              : `${course.availablePlaces} ${
                  course.availablePlaces >
                  1
                    ? "places disponibles"
                    : "place disponible"
                }`}
          </Text>
        </View>

        {course.description ? (
          <View className="mt-6">
            <Text
              style={{
                color: "#111111",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              À propos du cours
            </Text>

            <Text
              style={{
                color: "#525252",
                lineHeight: 23,
                marginTop: 6,
              }}
            >
              {
                course.description
              }
            </Text>
          </View>
        ) : null}

        <View className="mt-10">
          {paymentError ? (
            <View className="mb-4 rounded-xl bg-neutral-100 p-4">
              <Text
                style={{
                  color: "#B91C1C",
                  textAlign:
                    "center",
                }}
              >
                {paymentError}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className={
              course.availablePlaces ===
              0
                ? "items-center rounded-xl bg-neutral-200 py-4"
                : "items-center rounded-xl bg-creno-lime py-4"
            }
            disabled={
              paying ||
              course.availablePlaces ===
                0
            }
            onPress={
              handlePayment
            }
          >
            {paying ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={{
                  color:
                    "#111111",
                  fontSize: 16,
                  fontWeight:
                    "700",
                }}
              >
                {course.availablePlaces ===
                0
                  ? "Complet"
                  : `Payer ${formatPrice(
                      course.priceCents,
                    )}`}
              </Text>
            )}
          </TouchableOpacity>

          {!user &&
          course.availablePlaces >
            0 ? (
            <Text
              style={{
                color: "#737373",
                fontSize: 13,
                textAlign:
                  "center",
                marginTop: 10,
              }}
            >
              Tu devras te
              connecter pour payer.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}