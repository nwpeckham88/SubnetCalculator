import { GoogleGenAI, Chat } from "@google/genai";
import { CalculationContext } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.error("API_KEY not found in environment variables.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const initializeChat = (context: CalculationContext) => {
  const ai = getGenAI();
  if (!ai) return null;

  const systemPrompt = `
    You are an expert Network Engineering Tutor. You are embedded inside a visual Subnet Calculator.
    
    The user is currently operating in **${context.mode}** mode.
    
    Current Configuration:
    - IP Address: ${context.ip}
    - Initial Prefix/Mask: /${context.initialMask}
    - New Prefix/Mask: /${context.newMask}
    - Network Address: ${context.networkAddress}
    - ${context.mode === 'IPv4' ? 'Broadcast' : 'Last'} Address: ${context.broadcastAddress}
    - IP Type: ${context.ipClass} (${context.isPrivate ? 'Private' : 'Public'})
    - Usable Hosts: ${context.totalHosts}
    
    Goal: Explain networking concepts simply using these numbers.
    For IPv6, focus on hex notation, quartets/hextets, and the vast address space.
    If the user asks about "Broadcast" in IPv6, explain that IPv6 uses Multicast instead.
    
    Keep answers concise, helpful, and educational. Use Markdown.
  `;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemPrompt,
    },
  });
  
  return chatSession;
};

export const sendMessageToGemini = async (message: string, currentContext: CalculationContext) => {
  const ai = getGenAI();
  if (!ai) throw new Error("API Key missing");

  if (!chatSession) {
    initializeChat(currentContext);
  }

  const contextualMessage = `
    [Context Update: Mode=${currentContext.mode}, IP=${currentContext.ip}, NewPrefix=/${currentContext.newMask}]
    User Question: ${message}
  `;

  if (!chatSession) throw new Error("Failed to initialize chat");

  try {
    const response = await chatSession.sendMessage({ message: contextualMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};