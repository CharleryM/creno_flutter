export type UserRole =
  | "USER"
  | "OWNER";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  user: AuthUser;
};

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};