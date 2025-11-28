import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DietPlanDay, UserProfile } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeExerciseVideo = async (
  videoBase64: string,
  mimeType: string,
  exercise: string,
  profile: UserProfile
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Analyze this video of a user doing ${exercise}. 
      User Context: ${profile.age} years old, ${profile.disease !== 'None' ? `Has ${profile.disease}` : 'No specific conditions'}.
      
      1. Count the number of completed repetitions.
      2. Analyze the form strictly. Provide specific advice on how to improve.
      3. Rate the form from 1 to 10.
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType, data: videoBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reps: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            formScore: { type: Type.NUMBER },
          },
          required: ['reps', 'feedback', 'formScore']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const generateDietPlan = async (
  profile: UserProfile, 
  days: number,
  exerciseDays: number,
  exercisePreferences: string
): Promise<DietPlanDay[]> => {
  // Optimized prompt for speed
  const prompt = `
    Generate a ${days}-day diet plan (JSON) for:
    Profile: ${profile.age}yrs, ${profile.weight}kg, Goal: ${profile.goal}.
    Activity: ${exerciseDays} days/week doing ${exercisePreferences}.
    
    Return JSON array:
    [{ "day": "Day 1", "meals": { "breakfast": "...", "lunch": "...", "dinner": "...", "snacks": "..." }, "calories": 2000 }]
    Keep descriptions concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              meals: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING },
                  snacks: { type: Type.STRING },
                },
              },
              calories: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    return response.text ? JSON.parse(response.text) : [];
  } catch (e) {
    console.error("Diet Plan Error", e);
    return [];
  }
};

export const getRecommendations = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const text = response.text;
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text, chunks };
};

export const getTrendingShorts = async () => {
   const prompt = `Find 5 trending fitness news or workout videos for today. 
   Return a JSON array with these exact keys: "title", "summary", "source".
   Do NOT generate a URL field.
   `;
   
   const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const text = response.text || "[]";
  let parsed: any[] = [];
  
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(text);
    }
  } catch (e) {
    console.warn("Could not parse trending shorts JSON:", e);
  }

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  // Fallback: If JSON is empty or failed, use chunks
  if (parsed.length === 0 && chunks.length > 0) {
    parsed = chunks.filter((c: any) => c.web).map((c: any) => ({
      title: c.web.title,
      summary: "Trending topic found via Google Search.",
      source: "Google Search",
      // If we create items from chunks, we have the URI directly
      url: c.web.uri
    })).slice(0, 5);
  }

  // Final URL Construction:
  // For items parsed from JSON, we match with grounding chunks or create a Search URL.
  // This avoids 404s from hallucinated URLs.
  parsed = parsed.map((item: any) => {
     // If we already have a valid url (from the fallback block above), keep it.
     if (item.url && item.url.startsWith('http')) return item;

     // Try to find a matching grounding chunk
     const match = chunks.find((c: any) => 
        c.web?.title && item.title && (
            c.web.title.toLowerCase().includes(item.title.toLowerCase()) || 
            item.title.toLowerCase().includes(c.web.title.toLowerCase())
        )
     );

     let finalUrl = "";
     if (match && match.web?.uri) {
         finalUrl = match.web.uri;
     } else {
         // Fallback: Create a safe Google Search URL for the title
         const query = item.title ? `${item.title} fitness news` : "trending fitness news";
         finalUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
     }
     
     return { ...item, url: finalUrl };
  });

  return parsed;
}

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
        { text: "Transcribe this audio exactly." }
      ]
    }
  });
  return response.text || "";
};

export const chatWithBot = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  imageBase64?: string
) => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history as any,
  });

  let messagePayload: any;

  if (imageBase64) {
    messagePayload = [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: message }
    ];
  } else {
    // Pass string directly for simple text messages to avoid structure issues
    messagePayload = message; 
  }

  const result = await chat.sendMessage({ message: messagePayload });
  return result.text;
};

// Live API Helpers
export const connectLiveSession = async (
  onAudioData: (base64: string) => void,
  onOpen: () => void,
  onClose: () => void
) => {
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: onOpen,
      onclose: onClose,
      onmessage: (msg) => {
        if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
          onAudioData(msg.serverContent.modelTurn.parts[0].inlineData.data);
        }
      },
      onerror: (err) => console.error(err)
    },
    config: {
      responseModalities: ["AUDIO"],
      systemInstruction: "You are an energetic, motivating fitness coach voice assistant. Keep answers concise and encouraging.",
    }
  });
};
