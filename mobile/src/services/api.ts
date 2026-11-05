const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawApiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL est manquante. Vérifie le fichier mobile/.env.",
  );
}

const API_URL = rawApiUrl.replace(/\/$/, "");

type ApiErrorResponse = {
  message?: string;
};

type ApiFetchOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    token,
    ...requestOptions
  } = options;

  const headers = new Headers(
    requestOptions.headers,
  );

  if (
    requestOptions.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...requestOptions,
      headers,
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const error =
      data as ApiErrorResponse | null;

    throw new Error(
      error?.message ??
        `Une erreur API est survenue (${response.status}).`,
    );
  }

  return data as T;
}