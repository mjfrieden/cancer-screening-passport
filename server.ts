import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

import { getRecommendations } from "./src/lib/guidelineEngine.server.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
