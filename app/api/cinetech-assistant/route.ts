import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai/index.mjs';
import { performBingSearch, BingSearchResult } from '../../helpers/performBingSearch'; // Adjust the import path as needed
import { processSearchResults } from '../../helpers/processSearchResults'; // Adjust the import path as needed
import { generateImage } from '../../helpers/generateImage'; // Adjust the import path as needed
import { AssistantStream } from 'openai/lib/AssistantStream';

// This enables Edge Functions in Vercel
export const runtime = 'edge';

// Post a new message and stream OpenAI Assistant response
export async function POST(request: NextRequest) {
  //console.log('POST request received');
  
  // Parse message from post
  const newMessage = await request.json();
  //console.log('Parsed new message:', newMessage);

  // Create OpenAI client
  const openai = new OpenAI();

  // If no thread id then create a new openai thread
  if (newMessage.threadId == null) {
    //console.log('Creating a new thread');
    const thread = await openai.beta.threads.create();
    newMessage.threadId = thread.id;
  }
  //console.log('Thread ID:', newMessage.threadId);

  // Add new message to thread
  await openai.beta.threads.messages.create(newMessage.threadId, {
    role: 'user',
    content: newMessage.content,
  });
  //console.log('Message added to thread');

  // Create a run and stream it
  const runStream = await openai.beta.threads.runs.createAndStream(newMessage.threadId, {
    assistant_id: newMessage.assistantId,
    stream: true,
  });
  //console.log('Run created and streaming started');

  const assistantStream = runStream; // Use runStream directly if it supports the necessary methods
  const readableStream = runStream.toReadableStream();
  //console.log('Readable stream created');

  // Polling function to check run status
  async function pollRunStatus(assistantStream: AssistantStream) {
    //console.log('Polling run status started');
    let runStatus = assistantStream.currentRun();

    while (runStatus?.status !== 'completed') {
      //console.log('Current run status:', runStatus?.status);

      if (runStatus?.status === 'requires_action' && runStatus.required_action) {
        //console.log('Action required. Processing tool calls.');
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let output: string | undefined;

          try {
            if (functionName === 'performBingSearch') {
              const searchResults: BingSearchResult[] = await performBingSearch(args.user_request);
              const searchResultsString = JSON.stringify(searchResults);
              output = await processSearchResults(args.user_request, searchResultsString);
            } else if (functionName === 'generateImage') {
              const imageUrl = await generateImage(args.content);
              output = imageUrl ?? undefined;
            }

            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: output,
            });
          } catch (error) {
            //console.error(`Error performing ${functionName}:`, error);
            // Handle the error appropriately, e.g., log it or add a failed status
            continue;
          }
        }

        // Submit tool outputs
        //console.log('Submitting tool outputs:', toolOutputs);
        await openai.beta.threads.runs.submitToolOutputs(runStatus.thread_id, runStatus.id, {
          tool_outputs: toolOutputs,
        });
        //console.log('Tool outputs submitted');

        // After submitting tool outputs, break the loop and wait for the next status update
        break;
      }

      // Implement a delay or polling mechanism to avoid too frequent requests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the current run status again from the assistantStream
      runStatus = assistantStream.currentRun();
      //console.log('Run status updated:', runStatus);
    }

    //console.log('Run completed');
  }

  // Start polling the run status
  pollRunStatus(assistantStream).catch((error) => {
    //console.error('Error during polling run status:', error);
  });

  return new Response(readableStream);
}

// Define the RunStatus type
interface RunStatus {
  status: string;
  required_action?: {
    submit_tool_outputs: {
      tool_calls: ToolCall[];
    };
  };
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

// Get all of the OpenAI Assistant messages associated with a thread
export async function GET(request: NextRequest) {
  //console.log('GET request received');
  
  // Get thread id
  const searchParams = request.nextUrl.searchParams;
  const threadId = searchParams.get('threadId');
  const messageLimit = searchParams.get('messageLimit');

  if (threadId == null) {
    //console.error('Missing threadId');
    throw Error('Missing threadId');
  }

  if (messageLimit == null) {
    //console.error('Missing messageLimit');
    throw Error('Missing messageLimit');
  }

  // Create OpenAI client
  const openai = new OpenAI();

  // Get thread and messages
  const threadMessages = await openai.beta.threads.messages.list(threadId, {
    limit: parseInt(messageLimit),
  });

  // Only transmit the data that we need
  const cleanMessages = threadMessages.data.map((m) => {
    return {
      id: m.id,
      role: m.role,
      content: m.content[0].type == 'text' ? m.content[0].text.value : '',
      createdAt: m.created_at,
    };
  });

  // Reverse chronology
  cleanMessages.reverse();

  // Return back to client
  //console.log('Returning messages to client:', cleanMessages);
  return NextResponse.json(cleanMessages);
}
