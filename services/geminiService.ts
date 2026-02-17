
import { GoogleGenAI } from "@google/genai";

export const getGeminiAdvisorResponse = async (userQuery: string, history: {role: string, parts: {text: string}[]}[]) => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are the Elite Academy AI Advisor. 
    Our current promotion is the "Ramadan Jackpot Offer" which includes 150 hours of intensive learning for only $199 (Original price: $500). 
    We offer courses in Data Science, AI, Web Development, and Digital Marketing. 
    The Academy is located at Downtown Plaza.
    Be professional, encouraging, and informative. Use short, helpful responses. 
    Always emphasize the limited-time nature of the jackpot offer.
    Respond in friendly professional tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: userQuery }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "I'm sorry, I couldn't process that. How else can I help you with our Elite Academy offer?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The academy is currently busy processing requests! Please try again in a moment or visit our campus.";
  }
};
