import crypto from "crypto";
import path from "path";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";
import { uploadsRoot } from "../services/files.js";

const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/tiff",
  "image/svg+xml",
  "image/webp",
];
const VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-matroska",
  "video/x-msvideo",
  // non-standard spellings some clients send
  "video/mov",
  "video/wmv",
  "video/mkv",
  "video/avi",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = IMAGE_TYPES.includes(file.mimetype) ? "images" : "videos";
    cb(null, path.join(uploadsRoot, folder));
  },
  filename: (req, file, cb) => {
    // Never reuse the client's filename: it can hold path separators or collide.
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
    cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if ([...IMAGE_TYPES, ...VIDEO_TYPES].includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new HttpError(400, "invalid file type"));
  },
});

export const uploadFields = upload.fields([{ name: "file", maxCount: 1 }]);
