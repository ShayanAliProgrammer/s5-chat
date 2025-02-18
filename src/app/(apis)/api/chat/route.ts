import { streamText } from 'ai';
import models from '~/lib/ai/models';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
        model: models['gemini-2.0-flash-lite-preview-02-05 (Google)'],
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
