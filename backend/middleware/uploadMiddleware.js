import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

// Ensure the uploads directory exists (won't exist on a fresh deploy)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Only allow CSV files
const fileFilter = (req, file, cb) => {
  const isCSV =
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" || // some browsers/Excel exports use this
    file.originalname.toLowerCase().endsWith(".csv");

  if (isCSV) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default upload;
