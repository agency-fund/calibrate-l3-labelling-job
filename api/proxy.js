import { isAllowed } from "./_allowed.js";

const PAGES = ["https://agency-fund.github.io"];

export default async function handler(req, res) {
  const origin = PAGES.includes(req.headers.origin) ? req.headers.origin : PAGES[0];
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  // vercel.json sends every /api/... here, with the rest of the path in
  // `path` and any query the caller sent alongside it.
  const url = new URL(req.url, "http://placeholder");
  const path = "/" + (url.searchParams.get("path") || "");
  url.searchParams.delete("path");
  const query = url.searchParams.toString();
  const search = query ? "?" + query : "";

  const missing = ["CALIBRATE_API_KEY", "CALIBRATE_API_URL", "CALIBRATE_LABELLING_URL"]
    .filter((name) => !process.env[name]);
  if (missing.length) {
    return res.status(500).json({ detail: `Not set on the server: ${missing.join(", ")}` });
  }

  // The page asks for this on load, so the address of the labelling site stays
  // a setting on the server instead of sitting in the published page.
  if (req.method === "GET" && path === "/config") {
    return res.status(200).json({ labellingUrl: process.env.CALIBRATE_LABELLING_URL });
  }

  if (!isAllowed(req.method, path)) return res.status(403).send("Not allowed");

  let upstream;
  try {
    upstream = await fetch(process.env.CALIBRATE_API_URL + path + search, {
      method: req.method,
      headers: {
        "X-API-Key": process.env.CALIBRATE_API_KEY,
        "Content-Type": "application/json",
      },
      body: req.method === "POST" ? JSON.stringify(req.body ?? {}) : undefined,
    });
  } catch {
    return res.status(502).json({
      detail: "Could not reach Calibrate. Check CALIBRATE_API_URL: it must be the API address, not the web app.",
    });
  }

  const text = await upstream.text();
  res.setHeader("Content-Type", "application/json");
  res.status(upstream.status).send(text);
}
