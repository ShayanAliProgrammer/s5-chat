import { smoothStream, streamText } from 'ai';
import models from '~/lib/ai/models';
import { getWebTools } from '~/lib/ai/tools/internet';
import { calculatorTools } from '~/lib/ai/tools/math';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
        model: models['deepseek-r1-distill-llama-70b (Groq)'],
        messages,

        // maxTokens: 1000,

        maxSteps: 10,

        experimental_transform: smoothStream({
            delayInMs: 12, // optional: defaults to 10ms
            chunking: 'line', // optional: defaults to 'word'
        }),

        abortSignal: req.signal,


        // disable web tools for now, we have to work on these tools to make them better
        tools: {
            ...getWebTools(),
            ...calculatorTools()
        },

        toolCallStreaming: true
    });

    return result.toDataStreamResponse();
}
