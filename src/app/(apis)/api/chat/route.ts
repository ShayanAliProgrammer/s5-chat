import { smoothStream, streamText } from 'ai';
import models from '~/lib/ai/models';
import { calculatorTools } from '~/lib/ai/tools/math';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
        model: models['llama-3.1-8b-instant (Groq)'],
        messages,

        // maxTokens: 1000,

        maxSteps: 10,

        experimental_transform: smoothStream({
            delayInMs: 30, // optional: defaults to 10ms
            chunking: 'line', // optional: defaults to 'word'
        }),

        abortSignal: req.signal,


        // disable web tools for now, we have to work on these tools to make them better
        tools: {
            // ...getWebTools(),
            ...calculatorTools()
        },

    });

    return result.toDataStreamResponse();
}
