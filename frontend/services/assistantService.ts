const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type AskRequest = {
  question: string;
};

export type AskResponse = {
  question: string;
  answer: string;
  documents: string[];
};

/**
 * Get the authorization header with the JWT token from localStorage
 */
function getAuthHeader(): { Authorization: string } | null {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) return null;

  const parsed = JSON.parse(token);
  return {
    Authorization: `Bearer ${parsed.access_token}`,
  };
}

export async function askAssistant(question: string): Promise<AskResponse> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    throw new Error("Authentication required");
  }

  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detail = errorData.detail || `${res.status} ${res.statusText}`;
    throw new Error(detail);
  }

  return res.json();
}
