export async function handler(event) {
  const path = event.path
    .replace("/.netlify/functions/api", "")
    .replace("/api", "");

  const url = `http://paid4.daki.cc:4150${path}`;

  const isRedirect =
    path.startsWith("/login") ||
    path.startsWith("/callback") ||
    path.startsWith("/logout") ||
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/callback");

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        "Content-Type":    "application/json",
        "X-Forwarded-For": event.headers["x-forwarded-for"] || "",
        "X-User-Agent":    event.headers["user-agent"] || "",
      },
      body:     event.body || undefined,
      redirect: "manual",
    });

    // ── Redirect (login/callback flows) ──────────────────────────────────────
    if ([301, 302, 303].includes(response.status)) {
      const location = response.headers.get("location") || "/";
      return {
        statusCode: response.status,
        headers: { Location: location },
        body: "",
      };
    }

    // ── Normal JSON ───────────────────────────────────────────────────────────
    const data = await response.json();
    return {
      statusCode: response.status,
      headers:    { "Content-Type": "application/json" },
      body:       JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Backend unreachable", detail: err.message }),
    };
  }
}
