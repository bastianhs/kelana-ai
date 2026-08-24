import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_API = "https://api.unsplash.com";

/**
 * GET /api/unsplash?query=tokyo&orientation=landscape
 *
 * Proxies a random-photo request to the Unsplash API so that the
 * access key stays server-side and never reaches the browser.
 *
 * Returns:
 *   { url: string }   — the regular-size image URL on success
 *   { error: string } — a message on failure
 */
export async function GET(request: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey || accessKey === "your_unsplash_access_key_here") {
    return NextResponse.json(
      { error: "Unsplash access key is not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() || "travel landscape";
  const orientation = searchParams.get("orientation") || "landscape";

  const apiUrl = new URL(`${UNSPLASH_API}/photos/random`);
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("orientation", orientation);
  apiUrl.searchParams.set("content_filter", "high"); // safe content only

  try {
    const res = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      // Revalidate at most once per minute to avoid hammering the rate limit
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Unsplash API error ${res.status}:`, text);
      return NextResponse.json(
        { error: `Unsplash returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // data.urls.regular is typically ~1080px wide — ideal for the hero
    const url: string = data?.urls?.regular ?? data?.urls?.full ?? "";

    if (!url) {
      return NextResponse.json({ error: "No image URL in response" }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Unsplash proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
