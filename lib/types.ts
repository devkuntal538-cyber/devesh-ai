export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  modelId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  archived: boolean;
  favorite: boolean;
  modelId: string;
  mode: 'auto' | 'fast' | 'reasoning' | 'coding' | 'research' | 'creative' | 'vision';
  messages: Message[];
}

export type ModelCategory = 'General AI' | 'Reasoning AI' | 'Coding AI' | 'Research/Search AI' | 'Open/Alternative Models';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  contextLength?: string;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsWebSearch: boolean;
  supportsImageGeneration: boolean;
  capabilities: string[];
  configured?: boolean;
}
