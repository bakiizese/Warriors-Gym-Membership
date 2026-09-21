import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yaml";
import sequelize from "./config/database.js";
import { env } from "./config/env.js";
import association from "./models/Association.js";
import authRouter from "./routes/auth_route.js";
import adminRouter from "./routes/admin_route.js";
import memberRouter from "./routes/member_route.js";
import demoRouter from "./routes/demo_route.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { uploadsRoot } from "./services/files.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

association();

const openApiSpec = YAML.parse(
  fs.readFileSync(path.join(__dirname, "docs", "openapi.yaml"), "utf8"),
);

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
app.use("/uploads", express.static(uploadsRoot));
// Sample media referenced by the demo seed; ships with the backend, read-only.
app.use("/seed-assets", express.static(path.join(__dirname, "seed-assets")));
app.use(apiLimiter);

app.get("/ping", (req, res) => res.status(200).json({ ping: "success" }));

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: "ok", db: "up", demo: env.DEMO_MODE });
  } catch {
    return res.status(503).json({ status: "degraded", db: "down", demo: env.DEMO_MODE });
  }
});

// Swagger UI needs inline styles and scripts, so /docs gets its own CSP instead
// of loosening the strict default that protects the API itself.
app.use(
  "/docs",
  (req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, { customSiteTitle: "Warriors Gym API" }),
);
app.get("/openapi.json", (req, res) => res.status(200).json(openApiSpec));

app.use("/auth", authLimiter, authRouter);
app.use("/admin", adminRouter);
app.use("/member", memberRouter);
if (env.DEMO_MODE && env.DEMO_RESET_TOKEN) {
  app.use("/demo", authLimiter, demoRouter);
}

app.use(notFound);
app.use(errorHandler);

export default app;
