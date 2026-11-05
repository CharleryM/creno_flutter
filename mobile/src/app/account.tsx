import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../contexts/AuthContext";

export default function AccountScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    user,
    isLoading,
    signOut,
  } = useAuth();

  async function handleLogout() {
    await signOut();

    router.replace("/");
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  if (!user) {
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
          }}
        >
          Tu n'es pas connecté
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
      className="flex-1 bg-white px-6"
      style={{
        paddingTop:
          insets.top + 20,
        paddingBottom:
          insets.bottom + 24,
      }}
    >
      <StatusBar style="dark" />

      <TouchableOpacity
        onPress={() =>
          router.back()
        }
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
        Mon compte
      </Text>

      <View className="mt-8 rounded-2xl bg-neutral-100 p-5">
        <Text
          style={{
            color: "#111111",
            fontSize: 20,
            fontWeight: "700",
          }}
        >
          {user.firstName}{" "}
          {user.lastName}
        </Text>

        <Text
          style={{
            color: "#737373",
            fontSize: 15,
            marginTop: 8,
          }}
        >
          {user.email}
        </Text>

        <Text
          style={{
            color: "#737373",
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Compte{" "}
          {user.role === "OWNER"
            ? "propriétaire"
            : "utilisateur"}
        </Text>
      </View>

      {user.role === "OWNER" ? (
        <TouchableOpacity
          className="mt-8 items-center rounded-xl bg-creno-lime py-4"
          onPress={() =>
            router.push(
              "/studio-dashboard",
            )
          }
        >
          <Text
            style={{
              color: "#111111",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Espace studio
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        className={
          user.role === "OWNER"
            ? "mt-4 items-center rounded-xl border border-neutral-300 py-4"
            : "mt-8 items-center rounded-xl bg-creno-lime py-4"
        }
        onPress={() =>
          router.push(
            "/reservations",
          )
        }
      >
        <Text
          style={{
            color: "#111111",
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          Mes réservations
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 items-center rounded-xl border border-neutral-300 py-4"
        onPress={handleLogout}
      >
        <Text
          style={{
            color: "#111111",
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          Se déconnecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}