import fs from "fs/promises";
import path from "path";
import express from "express";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";
import { uploadsRoot } from "../services/files.js";
import { seedDemoData } from "../services/seed.js";
import { safeEqual } from "../utils/safeEqual.js";

// Only mounted when DEMO_MODE is on and DEMO_RESET_TOKEN is set (see app.js).
const demoRouter = express.Router();

// Restores the pristine demo: reseeds the database and deletes whatever
// visitors uploaded. Called nightly by a scheduled workflow.
demoRouter.post("/reset", async (req, res) => {
  if (!safeEqual(req.get("x-reset-token"), env.DEMO_RESET_TOKEN)) {
    throw new HttpError(403, "invalid reset token");
  }

  const result = await seedDemoData({ reset: true });

  // Uploads only ever come from demo visitors: the seed serves its media from
  // seed-assets/, which is left alone.
  for (const folder of ["images", "videos"]) {
    const dir = path.join(uploadsRoot, folder);
    const names = await fs.readdir(dir).catch(() => []);
    await Promise.all(
      names
        .filter((name) => name !== ".gitkeep")
        .map((name) => fs.rm(path.join(dir, name), { force: true })),
    );
  }

  return res.status(200).json({ reset: true, ...result });
});

export default demoRouter;
