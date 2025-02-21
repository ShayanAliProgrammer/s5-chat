import { cerebras } from "@ai-sdk/cerebras";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { env } from "~/env";

const openrouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
});

export default {
    // Google
    'gemini-1.5-flash (Google)': google('gemini-1.5-flash'),
    'gemini-1.5-flash-001 (Google)': google('gemini-1.5-flash-001'),
    'gemini-1.5-flash-002 (Google)': google('gemini-1.5-flash-002'),
    'gemini-1.5-flash-8b (Google)': google('gemini-1.5-flash-8b'),
    'gemini-1.5-flash-8b-001 (Google)': google('gemini-1.5-flash-8b-001'),
    'gemini-1.5-flash-8b-latest (Google)': google('gemini-1.5-flash-8b-latest'),
    'gemini-1.5-flash-latest (Google)': google('gemini-1.5-flash-latest'),
    'gemini-1.5-pro (Google)': google('gemini-1.5-pro'),
    'gemini-1.5-pro-001 (Google)': google('gemini-1.5-pro-001'),
    'gemini-1.5-pro-002 (Google)': google('gemini-1.5-pro-002'),
    'gemini-1.5-pro-latest (Google)': google('gemini-1.5-pro-latest'),
    'gemini-2.0-flash-001 (Google)': google('gemini-2.0-flash-001'),
    'gemini-2.0-flash-exp (Google)': google('gemini-2.0-flash-exp'),
    'gemini-2.0-flash-lite-preview-02-05 (Google)': google('gemini-2.0-flash-lite-preview-02-05'),
    'gemini-2.0-flash-thinking-exp-01-21 (Google)': google('gemini-2.0-flash-thinking-exp-01-21'),
    'gemini-2.0-pro-exp-02-05 (Google)': google('gemini-2.0-pro-exp-02-05'),
    'gemini-exp-1206 (Google)': google('gemini-exp-1206'),
    'learnlm-1.5-pro-experimental (Google)': google('learnlm-1.5-pro-experimental'),


    // Cerebras
    "llama-3.3-70b (Cerebras)": cerebras('llama-3.3-70b'),
    "llama3.1-70b (Cerebras)": cerebras('llama3.1-70b'),
    "llama3.1-8b (Cerebras)": cerebras('llama3.1-8b'),


    // Groq
    "deepseek-r1-distill-llama-70b (Groq)": groq('deepseek-r1-distill-llama-70b'),
    "gemma-7b-it (Groq)": groq('gemma-7b-it'),
    "gemma2-9b-it (Groq)": groq('gemma2-9b-it'),
    "llama-3.1-8b-instant (Groq)": groq('llama-3.1-8b-instant'),
    "llama-3.3-70b-versatile (Groq)": groq('llama-3.3-70b-versatile'),
    "llama-guard-3-8b (Groq)": groq('llama-guard-3-8b'),
    "llama3-70b-8192 (Groq)": groq('llama3-70b-8192'),
    "llama3-8b-8192 (Groq)": groq('llama3-8b-8192'),
    "mixtral-8x7b-32768 (Groq)": groq('mixtral-8x7b-32768'),

    // OpenRouter
    'qwen/qwen-max (Open Router)': openrouter.chat('qwen/qwen-max'),
    'deepseek/deepseek-r1-distill-qwen-32b (Open Router)': openrouter.chat('deepseek/deepseek-r1-distill-qwen-32b'),
    'deepseek/deepseek-r1 (Open Router)': openrouter.chat('deepseek/deepseek-r1:free'),


    'mistralai/mistral-nemo (Open Router)': openrouter.chat('mistralai/mistral-nemo:free'),
    'cognitivecomputations/dolphin3.0-r1-mistral-24b:free (Open Router)': openrouter.chat('cognitivecomputations/dolphin3.0-r1-mistral-24b:free'),

} as const;
