import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./config/database.js";
import { env } from "./config/env.js";
import association from "./models/Association.js";
import authRouter from "./routes/auth_route.js";
import adminRouter from "./routes/admin_route.js";
import memberRouter from "./routes/member_route.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

association();

const app = express();

// Render, Fly and most hosts terminate TLS in front of the app; without this
// every client shares the proxy's IP and the rate limiter would lock everyone out.
if (env.isProd) {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    // Uploaded images and videos are loaded by the web admin from another origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      // Native mobile apps and curl send no Origin header.
      if (!origin) return callback(null, true);
      const allowAll =
        env.CORS_ORIGINS.includes("*") ||
        (!env.isProd && env.CORS_ORIGINS.length === 0);
      return callback(null, allowAll || env.CORS_ORIGINS.includes(origin));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(apiLimiter);

app.get("/ping", (req, res) => res.status(200).json({ ping: "success" }));

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: "ok", db: "up" });
  } catch {
    return res.status(503).json({ status: "degraded", db: "down" });
  }
});

app.use("/auth", authLimiter, authRouter);
app.use("/admin", adminRouter);
app.use("/member", memberRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
