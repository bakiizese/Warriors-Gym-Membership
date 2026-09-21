import fs from "fs";
import path from "path";
import app from "./app.js";
import sequelize from "./config/database.js";
import { env } from "./config/env.js";
import { runMigrations } from "./config/migrator.js";
import { uploadsRoot } from "./services/files.js";
import { seedDemoData } from "./services/seed.js";
import { retry } from "./utils/retry.js";

async function start() {
  await retry(() => sequelize.authenticate(), {
    onRetry: (err, attempt, attempts) =>
      console.warn(`database not ready (${attempt}/${attempts}): ${err.message}`),
  });
  console.log("postgresql connected...");

  if (env.AUTO_MIGRATE) {
    await runMigrations();
  }

  if (env.DEMO_MODE) {
    // No-op unless the database is empty, so restarts never touch live demo data.
    const result = await seedDemoData();
    console.log(result.seeded ? "demo data seeded" : "demo data already present");
  }

  // Uploads are git-ignored, so the folders must exist before multer writes.
  for (const dir of ["images", "videos"]) {
    fs.mkdirSync(path.join(uploadsRoot, dir), { recursive: true });
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
