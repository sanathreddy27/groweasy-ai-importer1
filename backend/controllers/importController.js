import fs from "fs";
import { parseCSV } from "../services/csvService.js";
import { extractCRMData } from "../services/aiService.js";

export const importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No CSV file uploaded.",
    });
  }

  try {
    // Parse CSV
    const records = await parseCSV(req.file.path);

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded CSV is empty.",
      });
    }

    // AI Extraction (batched internally)
    const crmRecords = await extractCRMData(records);

    res.status(200).json({
      success: true,
      message: "AI extraction completed!",
      totalImported: crmRecords.length,
      totalSkipped: records.length - crmRecords.length,
      totalRecords: records.length,
      records: crmRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // Always clean up the temp file, whether extraction succeeded or failed
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err.message);
    });
  }
};
