import { GoogleGenAI, Type } from "@google/genai";
import { AIReminderResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguageReminder = async (input: string): Promise<AIReminderResponse | null> => {
  try {
    const now = new Date();
    const currentContext = `Current Date and Time: ${now.toISOString()} (Locale: ${now.toLocaleString()}). Use this to calculate relative dates like 'tomorrow' or 'next tuesday'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: ${currentContext}\n\nTask: Extract the reminder details from this user input: "${input}". Return a JSON object. If no time is specified, default to 9:00 AM of the target date. If no date is specified, default to today if time is in future, or tomorrow.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The main action or title of the reminder" },
            description: { type: Type.STRING, description: "Any additional details mentioned" },
            dueDate: { type: Type.STRING, description: "ISO 8601 formatted date string" },
            priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Infer priority based on urgency words" }
          },
          required: ["title", "dueDate"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as AIReminderResponse;
  } catch (error) {
    console.error("Error parsing reminder with Gemini:", error);
    return null;
  }
};
