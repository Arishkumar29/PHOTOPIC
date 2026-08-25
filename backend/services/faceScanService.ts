import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export interface ScanMatch {
  name: string;
  confidence: string;
  path?: string;
}

export function runPythonScan(selfiePath: string, bulkDirPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "backend", "scripts", "scan_faces.py");
    const pythonProcess = spawn("python", [scriptPath, selfiePath, bulkDirPath]);

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}. Stderr: ${stderrData}`));
      } else {
        try {
          const parsed = JSON.parse(stdoutData);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse Python script output: ${stdoutData}`));
        }
      }
    });

    pythonProcess.on("error", (err) => {
      reject(err);
    });
  });
}

async function callGeminiApiNode(
  model: string,
  apiKey: string,
  selfieMime: string,
  selfieBase64: string,
  chunkFiles: { name: string; path: string }[]
): Promise<any> {
  const parts: any[] = [];
  const prompt = `You are a high-precision biometric face detection and recognition AI model. Your task is to detect and match human faces across event photographs. 1. The image labeled 'Reference Face' contains the target individual's face. 2. Carefully detect all faces present in each candidate 'Event Photo'. 3. Perform detailed facial feature comparison (eyes, eyebrows, nose bridge, jaw structure, lip contours, cheekbones, facial proportions). 4. Ignore non-biometric variations such as lighting conditions, shadows, head rotation up to 45 degrees, smile/expression changes, hair style changes, or accessories like glasses. 5. If the target person appears anywhere in an Event Photo (even in group shots or background), include it in the matches list with its exact filename and match confidence ('high' for clear match, 'medium' for partial/angled match). Output a JSON object with a single field 'matches'.`;
  
  parts.push({ text: prompt });
  parts.push({ text: "--- Reference Face ---" });
  parts.push({ inlineData: { mimeType: selfieMime, data: selfieBase64 } });
  
  for (const file of chunkFiles) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const base64Data = fileBuffer.toString("base64");
      const ext = path.extname(file.name).toLowerCase();
      let mimeType = "image/jpeg";
      if (ext === ".png") mimeType = "image/png";
      else if (ext === ".webp") mimeType = "image/webp";
      
      parts.push({ text: `--- Event Photo: ${file.name} ---` });
      parts.push({ inlineData: { mimeType, data: base64Data } });
    } catch (err) {
      console.error(`Failed to read/convert file ${file.name} for Gemini API:`, err);
    }
  }
  
  const payload = {
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          matches: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                filename: { type: "STRING" },
                confidence: { type: "STRING", enum: ["high", "medium", "low"] }
              },
              required: ["filename", "confidence"]
            }
          }
        },
        required: ["matches"]
      }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error (Status ${response.status}): ${await response.text()}`);
  }

  const resJson: any = await response.json();
  const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response text returned from Gemini API");
  }
  return JSON.parse(text);
}

async function processChunkWithModelFallbackNode(
  apiKey: string,
  selfieMime: string,
  selfieBase64: string,
  chunkFiles: { name: string; path: string }[]
): Promise<ScanMatch[]> {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];
  
  let lastError = null;
  for (const model of models) {
    try {
      console.log(`Node calling Gemini model: ${model} for chunk of ${chunkFiles.length} files...`);
      const result = await callGeminiApiNode(model, apiKey, selfieMime, selfieBase64, chunkFiles);
      const matches: ScanMatch[] = [];
      for (const item of result.matches || []) {
        const matchedFile = chunkFiles.find(f => f.name === item.filename);
        if (matchedFile) {
          matches.push({
            name: item.filename,
            path: matchedFile.path,
            confidence: item.confidence
          });
        }
      }
      return matches;
    } catch (err: any) {
      console.warn(`Model ${model} failed in Node scan: ${err.message || err}`);
      lastError = err;
      if (err.message && (err.message.includes("API key") || err.message.includes("INVALID_ARGUMENT") || err.message.includes("400") || err.message.includes("403"))) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw lastError || new Error("All model candidates failed");
}

export async function scanFacesWithGeminiNode(
  apiKey: string,
  selfieMime: string,
  selfieBase64: string,
  imageFiles: { name: string; path: string }[]
): Promise<ScanMatch[]> {
  const chunkSize = 4;
  const chunks: { name: string; path: string }[][] = [];
  for (let i = 0; i < imageFiles.length; i += chunkSize) {
    chunks.push(imageFiles.slice(i, i + chunkSize));
  }

  const results: ScanMatch[] = [];
  const batchSize = 3;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(`Processing Node scan batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(chunks.length / batchSize)}...`);
    const batchResults = await Promise.all(
      batch.map(chunk => processChunkWithModelFallbackNode(apiKey, selfieMime, selfieBase64, chunk))
    );
    for (const res of batchResults) {
      results.push(...res);
    }
  }
  return results;
}
