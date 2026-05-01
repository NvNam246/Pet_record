import { GoogleGenAI } from "@google/genai";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const getHealthInsights = async (req, res) => {
  try {
    const { petName, species, breed, age, weight, symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Please describe the symptoms." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are an expert Veterinary AI Assistant working for the 'PetAware' app. 
      Analyze the following patient and symptoms, and provide a quick, professional health insight.
      
      Patient: ${petName} (Species: ${species || "Unknown"}, Breed: ${breed || "Unknown"}, Age: ${age || "Unknown"}, Weight: ${weight || "Unknown"})
      Symptoms reported by owner: "${symptoms}"

      Provide your response in exactly 3 short paragraphs:
      1. Potential Causes: (Briefly list 2-3 possible reasons for these symptoms).
      2. Home Care Advice: (What the owner can do right now to keep the pet comfortable).
      3. Vet Action: (Is this an emergency? Should they see a vet immediately, or wait and monitor?)

      Keep the tone empathetic, professional, and clear. Do not use Markdown formatting.
    `;

    const MAX_RETRIES = 3;
    const modelName = "gemini-2.5-flash";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Calling AI (attempt ${attempt})...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        console.log(`✅ Success!`);
        return res.status(200).json({ insight: response.text });
      } catch (error) {
        if (
          error.status === 429 ||
          error.message?.includes("429") ||
          error.message?.includes("exhausted")
        ) {
          const waitSec = attempt * 5;
          console.warn(`⚠️ API rate limited - retrying in ${waitSec}s...`);
          if (attempt < MAX_RETRIES) {
            await sleep(waitSec * 1000);
            continue;
          }
        }

        console.error("❌ API Error:", error.message);
        break;
      }
    }

    return res.status(503).json({
      message:
        "AI Engine is currently overloaded. Please try again in a few minutes.",
    });
  } catch (error) {
    console.error("System Error:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
