import path from "path";
import fs from "fs";
import os from "os";

/**
 * Returns the storage directory for bulk photos.
 * Uses OS temporary directory when executing on Vercel serverless environment,
 * and process.cwd() for local execution.
 */
export const getBulkPhotoDir = (subPath: string = ""): string => {
  const base = process.env.VERCEL === "1" ? os.tmpdir() : process.cwd();
  return path.join(base, "bulk_photo", subPath);
};

/**
 * Ensures that a target directory exists.
 */
export const ensureDirExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Safely removes a directory recursively if it exists.
 */
export const removeDirSync = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Failed to delete directory ${dirPath}:`, err);
    }
  }
};
