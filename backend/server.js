import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import sequelize from "./config/database.js";
import { env } from "./config/env.js";
import { runMigrations } from "./config/migrator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  await sequelize.authenticate();
  console.log("postgresql connected...");

  if (env.AUTO_MIGRATE) {
    await runMigrations();
  }

  // Uploads are git-ignored, so the folders must exist before multer writes.
  for (const dir of ["images", "videos"]) {
    fs.mkdirSync(path.join(__dirname, "uploads", dir), { recursive: true });
  }

  const server = app.listen(env.PORT, env.HOST, () =>
    console.log(`server running in http://${env.HOST}:${env.PORT}.....`),
  );

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
    // Do not hang forever on stuck connections.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("failed to start", err);
  process.exit(1);
});
