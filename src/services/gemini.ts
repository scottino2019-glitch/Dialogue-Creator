import { GoogleGenAI, Type } from "@google/genai";
import { DialogueEntry, Language, VocabularyEntry } from "../types";


export interface GeneratedContent {
  dialogue: DialogueEntry[];
  vocabulary: VocabularyEntry[];
}

export interface AIConfig {
  apiKey?: string;
  systemPrompt?: string;
}

export async function generateDialogue(
  topic: string, 
  language: Language, 
  config?: AIConfig
): Promise<GeneratedContent> {
  // Priority: 1. Manual override, 2. Vite Env (Netlify), 3. Process Env (AI Studio)
  const apiKey = config?.apiKey || 
                 import.meta.env.VITE_GEMINI_API_KEY || 
                 (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Set VITE_GEMINI_API_KEY in environment or settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const systemInstructions = config?.systemPrompt || `Generate a professional and helpful dialogue.`;

  const prompt = `${systemInstructions}
  
  Generate a dialogue in ${language} about "${topic}". 
  Provide the result as a JSON object with two fields:
  1. "dialogue": An array of dialogue lines.
     Each object should have:
     - speaker: string (name of the character)
     - text: string (the text in ${language})
     - translation: string (the text in Italian)
     - pronunciation: string (phonetic pronunciation, e.g. Pinyin for Chinese, Romaji for Japanese, etc.)
     - side: "left" or "right" (to differentiate speakers)
  2. "vocabulary": An array of 5-8 key words or short phrases extracted from the dialogue.
     Each object should have:
     - word: string (the word in ${language})
     - translation: string (the word in Italian)
     - pronunciation: string (phonetic pronunciation)

  Output exactly 4-6 lines of dialogue and a comprehensive vocabulary list.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dialogue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                translation: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                side: { type: Type.STRING, enum: ["left", "right"] },
              },
              required: ["speaker", "text", "translation", "pronunciation", "side"],
            },
          },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                translation: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
              },
              required: ["word", "translation", "pronunciation"],
            },
          },
        },
        required: ["dialogue", "vocabulary"],
      },
    },
  });

  try {
    const rawData = JSON.parse(response.text || '{"dialogue":[], "vocabulary":[]}');
    
    const dialogue = (rawData.dialogue || []).map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));

    const vocabulary = (rawData.vocabulary || []).map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));

    return { dialogue, vocabulary };
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { dialogue: [], vocabulary: [] };
  }
}
