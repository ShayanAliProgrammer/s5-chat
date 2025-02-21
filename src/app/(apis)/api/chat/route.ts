import { smoothStream, streamText } from 'ai';
import models from '~/lib/ai/models';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
<<<<<<< HEAD
        model: models['llama-3.1-8b-instant (Groq)'],
=======
        model: models['gemini-2.0-flash-lite-preview-02-05 (Google)'],
>>>>>>> c0bf768d63e659d756fc0e6139db7645c2cb443b
        messages,

        // maxTokens: 1000,

        maxSteps: 10,

        experimental_transform: smoothStream({
            delayInMs: 30, // optional: defaults to 10ms
            chunking: 'line', // optional: defaults to 'word'
        }),


        // disable web tools for now, we have to work on these tools to make them better
        // tools: {
        //     // ...getWebTools(),
        //     ...calculatorTools()
        // },

    });

    return result.toDataStreamResponse();
}
