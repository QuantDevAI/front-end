export type PipocaiMessageRole = 'assistant' | 'user';

export type PipocaiRecommendation = {
  compatibilityScore: number;
  movieId: string;
  reason: string;
  title: string;
  year: number;
};

export type PipocaiMessage = {
  createdAt: string;
  id: string;
  recommendation?: PipocaiRecommendation;
  role: PipocaiMessageRole;
  text: string;
};

export type PipocaiConversationPayload = {
  messages: PipocaiMessage[];
  suggestedPrompts: string[];
};

export type SendPipocaiMessageRequest = {
  text: string;
};

export type PipocaiMemoryEntry = {
  createdAt: string;
  id: string;
  text: string;
  updatedAt: string;
};

export type SavePipocaiMemoryRequest = {
  text: string;
};
