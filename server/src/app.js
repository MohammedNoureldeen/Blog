import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import env from "./config/env.js";
import errorHandler from "./middleware/error-handler.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(pinoHttp());
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

app.use(errorHandler);

export default app;