import { GoogleGenAI, Type } from "@google/genai";

// Initialized GoogleGenAI strictly using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartAssistantResponse = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: "You are FoodCarry AI, an expert in culinary logistics and food safety for Lucknow-wide premium food delivery. You provide professional advice on whether specific food items (like 3-tier cakes, liquid curries, fragile pastries) can be safely delivered across all major zones of Lucknow (Indiranagar, Rajajipuram, Aliganj, Hazratganj, Gomti Nagar, Charbagh, etc.). Focus on technical aspects like G-force sensitivity, thermal stability, and tilt risks. Use polite, professional 'Lucknowi' tone (Adab). Emphasize that we now serve the entire city of Lucknow. Keep responses concise.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: {
              type: Type.STRING,
              description: "The core advice for the user.",
            },
            safe: {
              type: Type.BOOLEAN,
              description: "Whether the item is generally safe for precision delivery.",
            },
            riskFactor: {
              type: Type.STRING,
              description: "The primary risk involved (vibration, temp, tilt).",
            }
          },
          required: ["advice", "safe", "riskFactor"]
        }
      },
    });

    // Accessed .text property directly as per guidelines
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      advice: "I'm having trouble connecting to my logistics brain. Please consult our human pilots for now!",
      safe: false,
      riskFactor: "connection"
    };
  }
};