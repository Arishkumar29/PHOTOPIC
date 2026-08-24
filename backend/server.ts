import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

import eventRoutes from "./routes/eventRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import scanRoutes from "./routes/scanRoutes";
import { getBulkPhotoDir } from "./services/storageService";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));

// Serve static bulk photos from storage directory
app.use("/bulk_photo", (req, res, next) => {
  const targetPath = getBulkPhotoDir(req.path);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return res.sendFile(targetPath);
  }
  const rootPath = path.join(process.cwd(), "bulk_photo", req.path);
  if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
    return res.sendFile(rootPath);
  }
  next();
});

// Register modular API routes
app.use("/api", eventRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", scanRoutes);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), "frontend"),
      configFile: path.join(process.cwd(), "vite.config.js"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  app.get("*", (req, res) => {
    const indexPath = process.env.NODE_ENV !== "production"
      ? path.join(process.cwd(), "frontend", "index.html")
      : path.join(process.cwd(), "dist", "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
