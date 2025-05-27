
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

// Ensure API_KEY is accessed as per prompt requirements.
// In a Vite/CRA app, process.env.VITE_GEMINI_API_KEY or process.env.REACT_APP_GEMINI_API_KEY would be typical.
// The prompt strictly says `process.env.API_KEY`.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key (process.env.API_KEY) is not set. AI features will not work.");
  // This error should ideally be handled more gracefully in the UI,
  // but App.tsx already has a check. This is a service-level guard.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion if confident it's set by App.tsx logic or build.

const createChatSession = (systemInstructionText: string) => {
  if (!API_KEY) {
    throw new Error("API Key not configured for Gemini Service.");
  }
  const systemInstructionPart: Part = { text: systemInstructionText };
  
  const chat: Chat = ai.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      // systemInstruction is an object with a Part, not a direct string.
      systemInstruction: systemInstructionPart, 
      // Using default thinkingConfig (enabled) for higher quality responses.
      // To disable for low latency (e.g. game AI):
      // thinkingConfig: { thinkingBudget: 0 } 
    },
    // History can be added here if needed for resuming chats.
    // history: [] 
  });
  return chat;
};

// sendMessage and sendMessageStream are methods of the Chat object returned by createChatSession.
// So, no separate functions here, they will be called on the 'chat' instance.

// Example of how to parse JSON if needed (not directly used in this app's current chat flow for AI responses, but good for reference)
const parseJsonResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", responseText);
    return null;
  }
};


export const geminiService = {
  createChatSession,
  parseJsonResponse // Exporting for potential future use
};
    