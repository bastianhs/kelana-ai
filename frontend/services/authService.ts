import { TokenResponse } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  data: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TokenAuthResponse {
  data: TokenResponse;
}

export interface CurrentUserResponse {
  data: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MeResponse {
  data: {
    id: string;
    name: string;
    email: string;
    total_trips: number;
  };
}

export const authService = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
  },

  async login(payload: LoginRequest): Promise<TokenAuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async getCurrentUser(token: string): Promise<CurrentUserResponse> {
    const response = await fetch(`${API_URL}/auth/users/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch current user");
    }

    return response.json();
  },

  async me(token: string): Promise<MeResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch profile");
    }

    return response.json();
  },
};
