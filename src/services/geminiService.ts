import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CarSpecs {
  topSpeed: string;
  acceleration: string;
  power: string;
}

export interface GeneratedConcept {
  name: string;
  imageUrl: string;
  prompt: string;
  specs: CarSpecs;
  description: string;
}

export async function generateCarConcept(
  prompt: string,
  style: string,
  color: string
): Promise<GeneratedConcept> {
  const model = "gemini-3.1-flash-image-preview";
  
  const fullPrompt = `A high-end, futuristic, ultra-luxury concept car. 
    Style: ${style}. 
    Primary Color: ${color}. 
    Details: ${prompt}. 
    Masterpiece, photorealistic, 8k resolution, cinematic lighting, sleek design, automotive photography style, shallow depth of field.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("Failed to generate image.");
    }

    // Also generate specs and metadata using flash model with strict schema
    const metadataResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a name, a 2-sentence luxury description, and performance specs (Top Speed, 0-60 acceleration, Horsepower) for a concept car described as: "${fullPrompt}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            topSpeed: { type: Type.STRING },
            acceleration: { type: Type.STRING },
            power: { type: Type.STRING }
          },
          required: ["name", "description", "topSpeed", "acceleration", "power"]
        }
      }
    });

    const metadata = JSON.parse(metadataResponse.text);

    return {
      name: metadata.name,
      imageUrl,
      prompt: fullPrompt,
      description: metadata.description,
      specs: {
        topSpeed: metadata.topSpeed,
        acceleration: metadata.acceleration,
        power: metadata.power,
      }
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
