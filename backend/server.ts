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

// Register API routes
app.use("/api", eventRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", scanRoutes);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), "frontend"),
      configFile: path.join(process.cwd(), "frontend", "vite.config.js"),
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.join(process.cwd(), "frontend", "index.html");
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send("index.html not found");
        }
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      const indexPath = path.join(process.cwd(), "dist", "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("index.html not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
