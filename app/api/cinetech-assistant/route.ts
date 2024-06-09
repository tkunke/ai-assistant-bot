import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai/index.mjs';
import { performBingSearch } from '../../helpers/performBingSearch'; // Adjust the import path as needed
import { processSearchResults } from '../../helpers/processSearchResults'; // Adjust the import path as needed
import { generateImage } from '../../helpers/generateImage'; // Adjust the import path as needed
import { AssistantStream } from 'openai/lib/AssistantStream';
import { genStoryBoard } from '@/app/helpers/storyboardImage';

// This enables Edge Functions in Vercel
//export const runtime = 'edge';

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
    let runStatus: OpenAI.Beta.Threads.Runs.Run | undefined;
    let runId: string | undefined;
    let isCompleted = false;

    // Wait for the initial run status to be available
    while (!runStatus) {
      runStatus = assistantStream.currentRun();
      if (runStatus) {
        runId = runStatus.id;
      } else {
        console.log('Current run is undefined, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Initial run status:', runStatus);

    while (!isCompleted) {
      console.log('Current run status:', runStatus?.status, 'Thread ID:', runStatus?.thread_id);

      if (runStatus?.status === 'requires_action' && runStatus.required_action) {
        console.log('Action required. Processing tool calls.');
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let output;
  
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
            } else if (functionName === 'genStoryBoard') {
              const imageUrl = await genStoryBoard(args.content);
              output = imageUrl ?? undefined;
            }
  
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: output,
            });

            // Check the run status after processing each tool call
            runStatus = await openai.beta.threads.runs.retrieve(runStatus.thread_id, runId!);
            if (runStatus.status === 'completed') {
              console.log('Run is completed after processing tool call, breaking the loop.');
              isCompleted = true;
              break;
            }

          } catch (error) {
            console.error(`Error performing ${functionName}:`, error);
            continue;
          }
        }

        if (isCompleted) {
          break;
        }

        console.log('Submitting tool outputs:', toolOutputs, 'Thread ID:', runStatus.thread_id);
        await openai.beta.threads.runs.submitToolOutputsStream(runStatus.thread_id, runStatus.id, {
          tool_outputs: toolOutputs,
        });
        console.log('Tool outputs submitted for thread ID:', runStatus.thread_id);
        
        // Retrieve the latest run status using runId
        runStatus = await openai.beta.threads.runs.retrieve(runStatus.thread_id, runId!);
        console.log('Run status retrieved:', runStatus);

        // Check if the run status is completed and break the loop if it is
        if (runStatus.status === 'completed') {
          console.log('Run is completed after submitting tool outputs, breaking the loop.');
          isCompleted = true;
          break;
        }
      }

      // Implement a delay or polling mechanism to avoid too frequent requests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the current run status again from the assistantStream
      runStatus = assistantStream.currentRun();
      console.log('Run status updated:', runStatus);

      // Check if the runStatus is null or undefined
      if (!runStatus) {
        console.log('Run status is no longer available. Exiting loop.');
        break;
      }

      // Break the loop if the run status is completed
      if (runStatus?.status === 'completed') {
        console.log('Run is completed in the polling loop, breaking.');
        isCompleted = true;
        break;
      }

      // Update the run status store
      if (runStatus) {
        runStatusStore[runStatus.thread_id] = runStatus;
      }
    }

    // Final update to the run status store
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
      } else if (messageContent.type === 'image_file' || 'image_url') {
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
