const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeader(): { Authorization: string } | null {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) return null;
  const parsed = JSON.parse(token);
  return { Authorization: `Bearer ${parsed.access_token}` };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detail = errorData.detail || `${res.status} ${res.statusText}`;
    throw new Error(detail);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Conversation = {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
};

export type Message = {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function listConversations(): Promise<Conversation[]> {
  const authHeader = getAuthHeader();
  if (!authHeader) throw new Error("Authentication required");

  const res = await fetch(`${API_URL}/conversations`, {
    headers: { ...authHeader },
  });
  const body = await handleResponse<{ data: Conversation[] }>(res);
  return body.data;
}

export async function createConversation(title = "New Conversation"): Promise<Conversation> {
  const authHeader = getAuthHeader();
  if (!authHeader) throw new Error("Authentication required");

  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader },
    body: JSON.stringify({ title }),
  });
  const body = await handleResponse<{ data: Conversation }>(res);
  return body.data;
}

export async function renameConversation(id: number, title: string): Promise<Conversation> {
  const authHeader = getAuthHeader();
  if (!authHeader) throw new Error("Authentication required");

  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader },
    body: JSON.stringify({ title }),
  });
  const body = await handleResponse<{ data: Conversation }>(res);
  return body.data;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function listMessages(conversationId: number): Promise<Message[]> {
  const authHeader = getAuthHeader();
  if (!authHeader) throw new Error("Authentication required");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: { ...authHeader },
  });
  const body = await handleResponse<{ data: Message[] }>(res);
  return body.data;
}

export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  const authHeader = getAuthHeader();
  if (!authHeader) throw new Error("Authentication required");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader },
    body: JSON.stringify({ content }),
  });
  const body = await handleResponse<{ data: Message }>(res);
  return body.data;
}
