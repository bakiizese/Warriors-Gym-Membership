import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

export const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
// Where uploads live on disk. Point UPLOADS_DIR at a mounted volume to keep
// them across deploys; the URL-facing path stays "uploads/<folder>/<file>".
export const uploadsRoot = env.UPLOADS_DIR
  ? path.resolve(env.UPLOADS_DIR)
  : path.join(backendRoot, "uploads");
// Sample media that ships with the backend for the demo seed (read-only).
export const seedAssetsRoot = path.join(backendRoot, "seed-assets");

const UPLOADS_PREFIX = "uploads/";
const SEED_PREFIX = "seed-assets/";

// Maps a stored path ("uploads/videos/x.mp4") to a file on disk, or null when
// it is not a file this server owns (a remote URL, or a path escaping the root).
function resolveStored(storedPath, { allowSeedAssets = false } = {}) {
  if (typeof storedPath !== "string") return null;
  const candidates = [[UPLOADS_PREFIX, uploadsRoot]];
  if (allowSeedAssets) candidates.push([SEED_PREFIX, seedAssetsRoot]);

  for (const [prefix, root] of candidates) {
    if (!storedPath.startsWith(prefix)) continue;
    const resolved = path.resolve(root, storedPath.slice(prefix.length));
    if (resolved.startsWith(root + path.sep)) return resolved;
  }
  return null;
}

// The database stores "uploads/<folder>/<file>"; the apps prefix it with the
// server address to build a URL.
export function uploadedPath(req) {
  const file = req.files?.file?.[0];
  if (!file) return "";
  const folder = path.basename(path.dirname(file.path));
  return `${UPLOADS_PREFIX}${folder}/${path.basename(file.path)}`;
}

// Only ever deletes inside the uploads folder, whatever the stored value looks like.
export async function removeUpload(storedPath) {
  const resolved = resolveStored(storedPath);
  if (!resolved) return;
  try {
    await fs.unlink(resolved);
  } catch (err) {
    if (err.code !== "ENOENT" && !env.isTest) {
      console.error("unable to remove upload", storedPath, err.message);
    }
  }
}

// multer has already written the file by the time a handler runs. If the
// handler then rejects the request, delete it so failed requests leave no files.
export const cleanupOnError = (handler) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (err) {
    await removeUpload(uploadedPath(req));
    throw err;
  }
};

// 0 when the file is not on this server's disk (missing, or a remote URL).
export async function uploadSize(storedPath) {
  const resolved = resolveStored(storedPath, { allowSeedAssets: true });
  if (!resolved) return 0;
  try {
    return (await fs.stat(resolved)).size;
  } catch {
    return 0;
  }
}
