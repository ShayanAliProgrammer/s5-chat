import { streamText } from 'ai';
import models from '~/lib/ai/models';
import { SYSTEM_PROMPT } from '~/lib/ai/prompts/system';
import { calculatorTools } from '~/lib/ai/tools/math';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
        model: models['gemini-2.0-flash-lite-preview-02-05 (Google)'],
        messages,
        toolCallStreaming: true,
        temperature: 0.7,
        // maxTokens: 1000,
        topK: 5,

        maxSteps: 10,

        system: SYSTEM_PROMPT,


        tools: {
            // disable web tools for now, we have to work on these tools to make them better
            // ...getWebTools(),
            ...calculatorTools()
        },

    });

    return result.toDataStreamResponse();
}