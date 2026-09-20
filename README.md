# Devesh AI

One Chat. 20+ AI Minds.

## Overview

Devesh AI is a multi-model AI workspace with a modular router, model registry, streaming chat interface, protected routes, and graceful configuration states when external AI providers are not configured.

## Features

- Multi-model workspace and model selector
- Auto routing between coding, reasoning, research, and creative tasks
- Compare mode and conversation persistence with local storage
- Provider abstraction with environment-based configuration
- Clear setup/error states when keys are missing
- Admin/provider architecture for future Supabase or managed database integration

## Local development

1. Install dependencies:
   npm install
2. Copy environment variables:
   cp .env.example .env.local
3. Add provider keys if you want live AI responses.
4. Start the app:
   npm run dev
5. Open http://localhost:3000

## Production notes

- Provider secrets must stay on the server.
- Use Supabase/PostgreSQL for production persistence and auth.
- Add real provider adapters for OpenAI, Anthropic, Google, xAI, DeepSeek, Qwen, Mistral, and Perplexity.
