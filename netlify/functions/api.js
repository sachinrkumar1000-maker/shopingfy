export async function handler(event) {
  let path = event.path || "/";
  path = path.replace(/^\/.netlify\/functions\/api/, "");
  path = path.replace(/^\/api/, "");
  if (!path.startsWith("/")) path = "/" + path;
  if (path === "") path = "/";

  const qs  = event.rawQuery ? `?${event.rawQuery}` : "";
  const url = `http://paid4.daki.cc:4150${path}${qs}`;

  console.log(`[proxy] ${event.httpMethod} ${path}${qs} → ${url}`);

  try {
    const fetchOpts = {
      method:   event.httpMethod,
      headers: {
        "Content-Type":    "application/json",
        "X-Forwarded-For": event.headers["x-forwarded-for"] || "",
        "X-User-Agent":    event.headers["user-agent"] || "",
      },
      redirect: "manual",
    };
    if (["POST","PUT","PATCH"].includes(event.httpMethod) && event.body) {
      fetchOpts.body = event.body;
    }

    const response = await fetch(url, fetchOpts);

    if ([301,302,303].includes(response.status)) {
      return {
        statusCode: response.status,
        headers: { Location: response.headers.get("location") || "/" },
        body: "",
      };
    }

    const text = await response.text();
    let body = text, contentType = "text/plain";
    try { JSON.parse(text); contentType = "application/json"; } catch {}

    return {
      statusCode: response.status,
      headers:    { "Content-Type": contentType },
      body,
    };
  } catch (err) {
    console.error("[proxy] error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Backend unreachable", detail: err.message }),
    };
  }
}
