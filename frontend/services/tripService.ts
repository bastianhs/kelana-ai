const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Trip = {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
  created_at: string;
};

export type TripRequest = {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
};

export type SortBy = "latest" | "oldest" | "highest_budget";

export type PaginatedTrips = {
  items: Trip[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type GetTripsParams = {
  search?: string;
  sort_by?: SortBy;
  page?: number;
  page_size?: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getTrips(params: GetTripsParams = {}): Promise<PaginatedTrips> {
  const qs = new URLSearchParams();
  if (params.search)    qs.set("search",    params.search);
  if (params.sort_by)   qs.set("sort_by",   params.sort_by);
  if (params.page)      qs.set("page",      String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));

  const url = `${API_URL}/trips${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url);
  return handleResponse<PaginatedTrips>(res);
}

export async function getTrip(id: number): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips/${id}`);
  return handleResponse<Trip>(res);
}

export async function generateTrip(data: TripRequest): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Trip>(res);
}


