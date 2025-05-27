
export interface LessonStep {
  id: string;
  title: string;
  objective: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string; // For course selection screen
  aiPersona: string; // e.g., "friendly and patient AI tutor named 'Guía'"
  initialSystemPromptTemplate: string; // Template for the system prompt
  lessonSteps: LessonStep[];
  themeColor?: string; // e.g., 'blue-500' for Tailwind
  icon?: React.ElementType; // Optional icon component for the course
}

export interface Message {
  id: string;
  text: string;          // Displayed text (can be progressively typed)
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  fullText?: string;     // The complete text for an AI message, especially when streaming
  isStreamingApi?: boolean; // True if the API is still sending chunks for this AI message
  isTypingAnimated?: boolean; // True if this AI message is currently undergoing typing animation
}

// For grounding metadata from Gemini API if used (not used in this version but good to have)
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // other types of grounding chunks can be added here
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other grounding metadata fields
}