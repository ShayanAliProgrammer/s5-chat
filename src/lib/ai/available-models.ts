const AVAILABLE_MODELS = [
    // Google
    'gemini-1.5-flash (Google)',
    'gemini-1.5-flash-latest (Google)',
    'gemini-1.5-pro (Google)',
    'gemini-1.5-pro-latest (Google)',
    'gemini-2.0-flash-lite-preview-02-05 (Google)',
    'gemini-2.0-pro-exp-02-05 (Google)',
    'gemini-exp-1206 (Google)',

    // Cerebras
    "llama-3.3-70b (Cerebras)",

    // Groq
    "deepseek-r1-distill-llama-70b (Groq)",
    "llama3-70b-8192 (Groq)",
    "llama3-8b-8192 (Groq)",

    // OpenRouter
    'microsoft/phigoogle/gemini-2.0-flash-lite-preview-02-05 (Open Router)',
] as const;

const arr = Array.from(AVAILABLE_MODELS);
type Model = typeof arr[number];

export { AVAILABLE_MODELS, type Model };

