// app/api/thread-init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai/index.mjs';

// This enables Edge Functions in Vercel
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('Thread initialization request received');

  // Create OpenAI client
  const openai = new OpenAI();

  // Create a new thread
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;

  console.log('New thread created:', threadId);

  // Return the thread ID to the client
  return NextResponse.json({ threadId });
}
