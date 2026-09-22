import { NextRequest } from 'next/server';
import { processChatStream } from '@/lib/gemini';
import { ReplyLanguage } from '@/lib/language';
import { isAIModelId } from '@/lib/models';
import { getSettings } from '@/lib/app-store';
import { getSessionUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, apiKey, language, modelId } = body as {
      messages?: unknown;
      apiKey?: string;
      language?: ReplyLanguage | null;
      modelId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const settings = await getSettings();
    const session = await getSessionUser();
    if ((!settings.allowGuestChat || settings.requireLogin) && !session) {
      return new Response(JSON.stringify({ error: 'Sign in to chat' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          const result = await processChatStream(
            {
              messages,
              apiKey,
              language: language || null,
              modelId: isAIModelId(modelId) ? modelId : 'auto',
            },
            (chunk) => send({ type: 'delta', text: chunk })
          );

          send({
            type: 'done',
            text: result.text,
            modelUsed: result.modelUsed,
            language: result.language,
            mediaUrl: result.mediaUrl,
            mediaType: result.mediaType,
          });
        } catch (error: any) {
          send({ type: 'error', error: error.message || 'Failed to process chat' });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
