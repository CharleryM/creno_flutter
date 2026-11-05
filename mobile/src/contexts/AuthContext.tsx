import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "../services/api";
import type {
  AuthUser,
  LoginResponse,
  MeResponse,
  RegisterResponse,
  SignUpInput,
} from "../types/auth";

const TOKEN_KEY = "creno_access_token";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<void>;
  signUp: (
    input: SignUpInput,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken =
          await SecureStore.getItemAsync(
            TOKEN_KEY,
          );

        if (!storedToken) {
          return;
        }

        const data =
          await apiFetch<MeResponse>(
            "/auth/me",
            {
              token: storedToken,
            },
          );

        setToken(storedToken);
        setUser(data.user);
      } catch (error) {
        console.error(
          "Impossible de restaurer la session :",
          error,
        );

        await SecureStore.deleteItemAsync(
          TOKEN_KEY,
        );

        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function signIn(
    email: string,
    password: string,
  ) {
    const data =
      await apiFetch<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

    await SecureStore.setItemAsync(
      TOKEN_KEY,
      data.accessToken,
    );

    setToken(data.accessToken);
    setUser(data.user);
  }

  async function signUp(
    input: SignUpInput,
  ) {
    await apiFetch<RegisterResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          ...input,

          // L'application mobile actuelle
          // crée des comptes clients.
          role: "USER",
        }),
      },
    );

    await signIn(
      input.email,
      input.password,
    );
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(
      TOKEN_KEY,
    );

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated:
          user !== null && token !== null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider.",
    );
  }

  return context;
}