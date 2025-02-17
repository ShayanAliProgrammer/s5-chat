import { streamText } from 'ai';
import models from '~/lib/ai/models';
import { SYSTEM_PROMPT } from '~/lib/ai/prompts/system';
import { getWebTools } from '~/lib/ai/tools/internet';
import { calculatorTools } from '~/lib/ai/tools/math';

export const maxDuration = 30; // Allow streaming response upto 30 seconds

export async function POST(req: Request) {
    const { messages, id } = await req.json();

    const result = streamText({
        model: models['gemini-2.0-flash-lite-preview-02-05 (Google)'],
        messages,
        toolCallStreaming: true,
        maxSteps: 10,

        system: SYSTEM_PROMPT,


        tools: {
            ...getWebTools(),
            ...calculatorTools()
        },


        // async onFinish({ response }) {
        //   await saveChat({
        //     id,
        //     messages: appendResponseMessages({
        //       messages,
        //       responseMessages: response.messages,
        //     }),
        //   });
        // },
    });

    return result.toDataStreamResponse();
}