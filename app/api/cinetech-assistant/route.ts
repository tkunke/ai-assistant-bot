import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai/index.mjs';
import { performBingSearch } from '../../helpers/performBingSearch'; // Adjust the import path as needed
import { processSearchResults } from '../../helpers/processSearchResults'; // Adjust the import path as needed
import { generateImage } from '../../helpers/generateImage'; // Adjust the import path as needed
import { AssistantStream } from 'openai/lib/AssistantStream';

// This enables Edge Functions in Vercel
export const runtime = 'edge';

// Define the RunStatus type
interface RunStatus {
  status: string;
  required_action?: {
    submit_tool_outputs: {
      tool_calls: ToolCall[];
    };
  } | null; // Allow null for compatibility
  thread_id: string;
  id: string;
}

// Define the ToolCall type (ensure this matches your actual type)
interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

type TextContent = {
  type: 'text';
  text: {
    value: string;
  };
};

type ImageContent = {
  type: 'image_file' | 'image_url';
  image: {
    url: string;
  };
};

type MessageContent = TextContent | ImageContent;

// In-memory store for run statuses
interface RunStatusStore {
  [key: string]: RunStatus; // Define the type of the store
}

const runStatusStore: RunStatusStore = {}; // Initialize the store with the proper type

// Post a new message and stream OpenAI Assistant response
export async function POST(request: NextRequest) {
  console.log('POST request received');
  
  // Parse message from post
  const newMessage = await request.json();
  console.log('Parsed new message:', newMessage);

  // Create OpenAI client
  const openai = new OpenAI();

  // If no thread id then create a new openai thread
  if (newMessage.threadId == null) {
    console.log('Creating a new thread');
    const thread = await openai.beta.threads.create();
    newMessage.threadId = thread.id;
  }
  console.log('Thread ID:', newMessage.threadId);

  // Add new message to thread
  await openai.beta.threads.messages.create(newMessage.threadId, {
    role: 'user',
    content: newMessage.content,
  });
  console.log('Message added to thread');

  // Create a run and stream it
  const runStream = openai.beta.threads.runs.stream(newMessage.threadId, {
    assistant_id: newMessage.assistantId
  });

  const assistantStream = runStream; // Use runStream directly if it supports the necessary methods
  const readableStream = runStream.toReadableStream();
  console.log('Readable stream created');

  // Polling function to check run status
  async function pollRunStatus(assistantStream: AssistantStream) {
    let runStatus = assistantStream.currentRun();
    console.log('Initial run status:', runStatus);

    while (runStatus?.status !== 'completed') {
      console.log('Current run status:', runStatus?.status, 'Thread ID:', runStatus?.thread_id);

      if (runStatus?.status === 'requires_action' && runStatus.required_action) {
        console.log('Action required. Processing tool calls.');
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let output: string | undefined;

          try {
            if (functionName === 'performBingSearch') {
              const searchResults = await performBingSearch(args.user_request); 
              const searchResultsString = JSON.stringify(searchResults);
              console.log('Search results string:', searchResultsString);
              output = await processSearchResults(args.user_request, searchResultsString);
              console.log('Processed search results output:', output);
            } else if (functionName === 'generateImage') {
              const imageUrl = await generateImage(args.content);
              output = imageUrl ?? undefined;
            }

            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: output,
            });
          } catch (error) {
            console.error(`Error performing ${functionName}:`, error);
            // Handle the error appropriately, e.g., log it or add a failed status
            continue;
          }
        }

        console.log('Submitting tool outputs:', toolOutputs, 'Thread ID:', runStatus.thread_id);
        openai.beta.threads.runs.submitToolOutputsStream(runStatus.thread_id, runStatus.id, {
          tool_outputs: toolOutputs,
        });
        console.log('Tool outputs submitted for thread ID:', runStatus.thread_id);

        // After submitting tool outputs, break the loop and wait for the next status update
        break;
      }

      // Implement a delay or polling mechanism to avoid too frequent requests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the current run status again from the assistantStream
      runStatus = assistantStream.currentRun();
      console.log('Run status updated:', runStatus);

      if (runStatus) {
        runStatusStore[runStatus.thread_id] = runStatus;
      }
    }

    if (runStatus) {
      runStatusStore[runStatus.thread_id] = runStatus;
    }

    console.log('Run completed with status:', runStatus?.status, 'Thread ID:', runStatus?.thread_id);
    return runStatus?.status === 'completed';
  }

  pollRunStatus(runStream).then((isCompleted) => {
    console.log(`Run status completed: ${isCompleted}`);
  }).catch((error) => {
    console.error('Error during polling run status:', error);
  });

  return new Response(readableStream);
}

// Get all of the OpenAI Assistant messages associated with a thread
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const threadId = searchParams.get('threadId');

  if (threadId == null) {
    throw Error('Missing threadId');
  }

  // Create OpenAI client
  const openai = new OpenAI();

  // Get thread and messages
  const threadMessages = await openai.beta.threads.messages.list(threadId);

  // Only transmit the data that we need
  const cleanMessages = threadMessages.data.map((m) => {
    let content = '';
    if (m.content && Array.isArray(m.content) && m.content.length > 0) {
      const messageContent = m.content[0] as MessageContent;
      if (messageContent.type === 'text') {
        content = messageContent.text.value;
      } else if (messageContent.type === 'image_file' || messageContent.type === 'image_url') {
        content = messageContent.image.url;
      }
    }
    return {
      id: m.id,
      role: m.role,
      content: content,
      createdAt: m.created_at,
    };
  });

  // Reverse chronology
  cleanMessages.reverse();

  // Retrieve the current run status from the in-memory store
  const runStatus = runStatusStore[threadId];

  // Return back to client
  return NextResponse.json({
    messages: cleanMessages,
    runStatus: runStatus,
  });
}