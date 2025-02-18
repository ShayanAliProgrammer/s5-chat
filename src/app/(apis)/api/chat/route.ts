import { streamText } from 'ai';
import models from '~/lib/ai/models';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
        model: models['gemini-1.5-flash-8b-001 (Google)'],
        messages,

        // maxTokens: 1000,

        maxSteps: 10,


        // disable web tools for now, we have to work on these tools to make them better
        // tools: {
        //     // ...getWebTools(),
        //     ...calculatorTools()
        // },

    });

    return result.toDataStreamResponse();
}