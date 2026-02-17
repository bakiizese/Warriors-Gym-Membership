import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      ["image/png", "image/jpeg", "image/tiff", "image/svg"].includes(
        file.mimetype,
      )
    ) {
      cb(null, "./uploads/images");
    } else if (
      [
        "video/mp4",
        "video/mov",
        "video/wmv",
        "video/mkv",
        "video/avi",
      ].includes(file.mimetype)
    ) {
      cb(null, "./uploads/videos");
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage, limits: 10 * 1024 * 1024 });

export const uploadFields = upload.fields([{ name: "file", maxCount: 1 }]);
