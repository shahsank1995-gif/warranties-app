// extractReceiptData.ts
// Requires: "@google/generative-ai" ^0.23.0

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtractedData } from "../types";

const PREFERRED_MODEL_NAME = "gemini-1.5-flash";
const SDK_MODEL_IDENTIFIER = `models/${PREFERRED_MODEL_NAME}`;

function getApiKey(): string | undefined {
  return import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
}

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

async function extractTextFromResult(result: any): Promise<string> {
  // 1) Newer SDK: result.response.text()
  try {
    if (result?.response?.text && typeof result.response.text === "function") {
      return await result.response.text();
    }
  } catch (e) {
    // ignore and try next
  }

  // 2) Some SDKs: result.output[].content[].text
  try {
    if (Array.isArray(result?.output) && result.output.length > 0) {
      const out = result.output[0];
      if (Array.isArray(out?.content) && out.content.length > 0) {
        const textPart = out.content.find((p: any) => typeof p.text === "string");
        if (textPart) return textPart.text;
      }
    }
  } catch (e) {
    // ignore
  }

  // 3) Fallback: if result is string or has `text` field
  if (typeof result === "string") return result;
  if (typeof result?.text === "string") return result.text;

  // 4) Last resort: stringify object
  return JSON.stringify(result);
}

async function listAvailableModels(genAI: any): Promise<string[]> {
  // 1) Try SDK-provided method
  try {
    const maybeList = (genAI as any).listModels;
    if (typeof maybeList === "function") {
      const res = await maybeList.call(genAI);
      if (Array.isArray(res?.models)) {
        return res.models.map((m: any) => m.name || m).filter(Boolean);
      }
      if (Array.isArray(res)) {
        return res.map((m: any) => (typeof m === "string" ? m : m.name || "")).filter(Boolean);
      }
    }
  } catch (e) {
    console.warn("SDK listModels attempt failed, will try REST fallback.", e);
  }

  // 2) REST fallback
  const key = getApiKey();
  if (!key) throw new Error("API key not found for listModels fallback");
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to list models via REST: ${res.status} - ${txt}`);
  }
  const json = await res.json();
  if (Array.isArray(json?.models)) {
    return json.models.map((m: any) => m.name).filter(Boolean);
  }
  return [];
}

export async function extractReceiptData(
  fileBase64: string,
  mimeType: string
): Promise<ExtractedData> {
  const key = getApiKey();
  if (!key) {
    throw new Error("Google Generative AI API key not set in VITE_GOOGLE_GENAI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(key);

  // Check model availability
  try {
    const models = await listAvailableModels(genAI);
    const hasModel = models.includes(SDK_MODEL_IDENTIFIER) || models.includes(PREFERRED_MODEL_NAME);

    if (!hasModel) {
      console.error("Available models (sample):", models.slice(0, 30));
      throw new Error(
        `${SDK_MODEL_IDENTIFIER} is not available. Check Google docs for supported models.`
      );
    }
  } catch (err) {
    console.error("Model availability check failed:", err);
    throw err;
  }

  // Build prompt
  const documentType = mimeType.includes("pdf") ? "PDF document" : "image";
  const prompt = `
Analyze this ${documentType} (receipt or policy document).
Extract and return ONLY a JSON object with these fields:

{
  "productName": "product or policy name",
  "purchaseDate": "YYYY-MM-DD format",
  "expiryDate": "YYYY-MM-DD or null",
  "warrantyPeriod": "e.g. 1 year",
  "retailer": "store name"
}
Return JSON only.
`;

  const filePart = fileToGenerativePart(fileBase64, mimeType);

  try {
    const model = genAI.getGenerativeModel({ model: PREFERRED_MODEL_NAME });
    const callInput = [{ text: prompt }, filePart];
    const result = await model.generateContent(callInput);

    const rawText = await extractTextFromResult(result);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in output:", rawText);
      throw new Error("Model did not return JSON");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON:", jsonMatch[0]);
      throw new Error("Failed to parse JSON from model");
    }

    return {
      productName: parsed.productName ?? null,
      purchaseDate: parsed.purchaseDate ?? null,
      expiryDate: parsed.expiryDate ?? null,
      warrantyPeriod: parsed.warrantyPeriod ?? "Not specified",
      retailer: parsed.retailer ?? null,
    } as ExtractedData;
  } catch (err) {
    console.error("generateContent error:", err);
    if (err instanceof Error && /404|not found/i.test(err.message)) {
      throw new Error(
        `404 error. Ensure SDK is v0.23+ and model "${PREFERRED_MODEL_NAME}" is supported.`
      );
    }
    throw err instanceof Error ? err : new Error("Failed to analyze receipt");
  }
}
