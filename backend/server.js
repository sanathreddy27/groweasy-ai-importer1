import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import importRoutes from "./routes/importRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/import", importRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GrowEasy AI Importer Backend Running 🚀",
  });
});

// 404 handler — for any route that doesn't match
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Central error handler — always returns JSON, never leaks stack traces
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY is not set. AI extraction will fail until it's configured.");
}

app.listen(PORT, () => {
  console.log(`✅ Import route registered at /api/import`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
