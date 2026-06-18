import express from "express";
import multer from "multer";
import { uploadMedia } from "../controllers/media.controller";

const router = express.Router();

// Keep files in memory so sharp can process them
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Accept up to 10 files under the field name "files"
router.post("/upload", upload.array("files", 10), uploadMedia);

export default router;
