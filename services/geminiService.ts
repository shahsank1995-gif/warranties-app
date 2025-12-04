
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ExtractedData } from '../types';

// Remove top-level initialization

const model = "gemini-flash-latest";

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export async function extractReceiptData(
  fileBase64: string,
  mimeType: string
): Promise<ExtractedData> {
  const filePart = fileToGenerativePart(fileBase64, mimeType);
  const documentType = mimeSchemaType.includes('pdf') ? 'PDF document' : 'image';

  const prompt = `
    You are an intelligent assistant for a warranty tracking application.
    Analyze the following ${documentType} which is either a receipt or a policy document.
    Extract the requested information in a structured JSON format.
    - productName: The main product or policy name. Be specific (e.g., "Bajaj Avenger 150 Insurance", "Sony WH-1000XM4 Headphones").
    - purchaseDate: The date of purchase or policy start date in YYYY-MM-DD format.
    - expiryDate: The explicit expiry date if mentioned (e.g., policy expiry). If present, use this over calculating from a warranty period. Format: YYYY-MM-DD.
    - warrantyPeriod: The warranty or policy duration (e.g., "1 year", "90 days"). If not mentioned, use "Not specified".
    - retailer: The name of the store, retailer, or policy issuer (e.g., "Best Buy", "ACKO General Insurance").

    If any information is unclear or not present, use a null value for that field.
    Your response must be only the JSON object, without any surrounding text or markdown formatting.
  `;

  try {
    const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    if (!API_KEY) {
      throw new Error("VITE_GOOGLE_GENAI_API_KEY not set in environment variables. Please check .env.local");
    }
   const ai = new GoogleGenerativeAI(API_KEY);

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [filePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            productName: { type: SchemaType.STRING, description: "The name of the primary product or policy." },
            purchaseDate: { type: SchemaType.STRING, description: "The purchase or start date in YYYY-MM-DD format." },
            expiryDate: { type: SchemaType.STRING, description: "The policy or warranty expiry date in YYYY-MM-DD format, if available.", nullable: true },
            warrantyPeriod: { type: SchemaType.STRING, description: "The duration of the warranty (e.g., '1 year')." },
            retailer: { type: SchemaType.STRING, description: "The name of the retailer or issuer." },
          },
          required: ["productName", "purchaseDate", "warrantyPeriod"],
        },
      },
    });

    const text = response.text.trim();
    const cleanedText = text.replace(/```json|```/g, '').trim();

    const data = JSON.parse(cleanedText);

    // Basic validation
    if (!data.productName || !data.warrantyPeriod) {
      throw new Error("AI failed to extract required fields.");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (data.purchaseDate && !dateRegex.test(data.purchaseDate)) {
      console.warn("AI returned invalid date format:", data.purchaseDate);
      data.purchaseDate = ""; // Reset to empty if invalid
    }

    return data as ExtractedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process document with AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing the document.");
  }
}
