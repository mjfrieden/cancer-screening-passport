import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

import { getRecommendations } from "./src/lib/guidelineEngine.ts";

const TELEMETRY_EVENTS = new Set([
  "app_open",
  "auth_sign_in_click",
  "auth_sign_in_success",
  "screen_view",
  "consent_accepted",
  "profile_saved",
  "screening_modal_opened",
  "screening_saved",
  "recommendations_generated",
  "export_account_data",
  "export_fhir_json",
  "export_pdf_summary",
  "account_deletion_started",
  "account_deletion_completed",
  "account_deletion_canceled",
]);

const TELEMETRY_PAYLOAD_KEYS = new Set(["screen", "platform", "method", "status", "count", "source"]);

function sanitizeTelemetryPayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return {};
  }

  return Object.entries(payload as Record<string, unknown>).reduce<Record<string, string | number | boolean | null>>((accumulator, [key, value]) => {
    if (!TELEMETRY_PAYLOAD_KEYS.has(key)) {
      return accumulator;
    }

    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      accumulator[key] = value as string | number | boolean | null;
    }

    return accumulator;
  }, {});
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "Content-Security-Policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; frame-src https://accounts.google.com https://*.firebaseapp.com; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
    next();
  });

  app.use(express.json());

  app.post("/api/telemetry", (req, res) => {
    const { eventName, sessionId, sentAt, payload } = req.body ?? {};

    if (
      typeof eventName !== "string" ||
      !TELEMETRY_EVENTS.has(eventName) ||
      typeof sessionId !== "string" ||
      sessionId.length < 8
    ) {
      return res.status(204).end();
    }

    const record = {
      kind: "telemetry",
      eventName,
      sessionId,
      sentAt: typeof sentAt === "string" ? sentAt : new Date().toISOString(),
      payload: sanitizeTelemetryPayload(payload),
    };

    console.info(JSON.stringify(record));
    return res.status(204).end();
  });

  // Clinical Guideline Engine APIs
  app.post("/api/recommendations/preventive-screening", (req, res) => {
    const { profile, history } = req.body;
    if (!profile) return res.status(400).json({ error: "Profile required" });
    
    const recommendations = getRecommendations(profile, history || []);
    res.json({ recommendations });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
