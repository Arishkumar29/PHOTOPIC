import path from "path";
import fs from "fs";
import os from "os";

export const getBulkPhotoDir = (subPath: string = ""): string => {
  const base = process.env.VERCEL === "1" ? os.tmpdir() : process.cwd();
  return path.join(base, "bulk_photo", subPath);
};

export const ensureDirExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const removeDirSync = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Failed to delete directory ${dirPath}:`, err);
    }
  }
};
