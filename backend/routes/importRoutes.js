import express from "express";
import multer from "multer";
import upload from "../middleware/uploadMiddleware.js";
import { importCSV } from "../controllers/importController.js";

const router = express.Router();

// Wrap multer so its errors (wrong file type, too large, etc.)
// come back as JSON instead of crashing to the default HTML error page.
const uploadSingle = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Max size is 10MB."
            : err.message,
      });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post("/", uploadSingle, importCSV);

export default router;
