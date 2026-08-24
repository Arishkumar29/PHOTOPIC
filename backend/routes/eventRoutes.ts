import { Router } from "express";
import multer from "multer";
import {
  createEvent,
  getEvents,
  deleteEvent,
  uploadEventPhotos,
  clearEventPhotos,
  proxyDriveImage
} from "../controllers/eventController";
import { getBulkPhotoDir, ensureDirExists } from "../services/storageService";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = getBulkPhotoDir();
    ensureDirExists(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

router.post("/create-event", createEvent);
router.get("/events", getEvents);
router.delete("/events/:eventId", deleteEvent);
router.post("/events/:eventId/upload", upload.array("photos"), uploadEventPhotos);
router.post("/events/:eventId/clear", clearEventPhotos);
router.get("/drive-proxy/:fileId", proxyDriveImage);

export default router;
