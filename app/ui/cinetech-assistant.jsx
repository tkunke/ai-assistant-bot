'use client';

import { useState, useEffect, useRef } from 'react';
import CinetechAssistantMessage from './assistant-message';
import InputForm from './input-form';
import { parseChartMarkdown } from './chart-gen';

function containsMarkdown(content) {
  // Check if the content contains Markdown syntax
  return /(\*\*|__|`|#|\*|-|\||\n[\-=\*]{3,}\s*$)/.test(content.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, ''));
}

export default function CinetechAssistant({
  assistantId,
  greeting = 'I am a helpful chat assistant. How can I help you?',
  messageLimit = 10,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState({
    role: 'assistant',
    content: 'Thinking...',
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [chunkCounter, setChunkCounter] = useState(0);

  // set default greeting Message
  const greetingMessage = {
    role: 'assistant',
    content: greeting,
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // clear streaming message
    setStreamingMessage({
      role: 'assistant',
      content: 'Thinking...',
    });

    // add busy indicator
    setIsLoading(true);

    // add user message to list of messages
    setMessages([
      ...messages,
      {
        id: 'temp_user',
        role: 'user',
        content: prompt,
      },
    ]);
    setPrompt('');

    // post new message to server and stream OpenAI Assistant response
    const response = await fetch('/api/cinetech-assistant', {
      method: 'POST',
      body: JSON.stringify({
        assistantId: assistantId,
        threadId: threadId,
        content: prompt,
      }),
    });

    let contentSnapshot = '';
    let newThreadId;

    // this code can be simplified when more browsers support async iteration
    // see https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#consuming_a_fetch_using_asynchronous_iteration
    let reader = response.body.getReader();
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      // parse server sent event
      const strChunk = new TextDecoder().decode(value).trim();
      //console.log('Received chunk:', strChunk);

      // split on newlines (to handle multiple JSON elements passed at once)
      const strServerEvents = strChunk.split('\n');

      // process each event
      for (const strServerEvent of strServerEvents) {
        const serverEvent = JSON.parse(strServerEvent);
        //console.log('Parsed server event:', serverEvent);
        switch (serverEvent.event) {
          // create new message
          case 'thread.message.created':
            newThreadId = serverEvent.data.thread_id;
            setThreadId(serverEvent.data.thread_id);
            //console.log('New thread ID set:', newThreadId);
            break;

        // update streaming message content
        case 'thread.message.delta':
            if (serverEvent.data.delta.content[0].text && serverEvent.data.delta.content[0].text.value) {
                contentSnapshot += serverEvent.data.delta.content[0].text.value;
                const isMarkdown = serverEvent.data.delta.content[0].hasOwnProperty('markdown');
                const newStreamingMessage = {
                ...streamingMessage,
                content: contentSnapshot,
                isMarkdown: isMarkdown,
            };
            setStreamingMessage(newStreamingMessage);
            setChunkCounter((prevCounter) => prevCounter + 1); // Increments the counter by one
            //console.log('Updated streaming message:', newStreamingMessage);
            }
            break;
        }
      }
    }

    // refetch all of the messages from the OpenAI Assistant thread
    const messagesResponse = await fetch('/api/cinetech-assistant?' + new URLSearchParams({
      threadId: newThreadId,
      messageLimit: messageLimit,
    }));
    const allMessages = await messagesResponse.json();
    //console.log('Fetched all messages:', allMessages);
    setMessages(allMessages);

    // remove busy indicator
    setIsLoading(false);
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chunkCounter]); // Triggers whenever the chunkCounter changes

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]);

  // Log messages to console whenever they change
  useEffect(() => {
    console.log('Current messages state:', messages);
  }, [messages]);
  
  // handles changes to the prompt input field
  function handlePromptChange(e) {
    setPrompt(e.target.value);
  }

  return (
    <div className="flex flex-col relative py-10">
      <CinetechAssistantMessage message={greetingMessage} />
      {messages.map((m) => (
        <CinetechAssistantMessage
          key={m.id}
          message={{
            ...m,
            isMarkdown: containsMarkdown(m.content),
            chartData: parseChartMarkdown(m.content),
          }}
        />
      ))}
      {isLoading && <CinetechAssistantMessage message={streamingMessage} />}
      <div ref={messagesEndRef} style={{ height: '1px' }}></div>
      <div>
        <footer className="footer">
          <div
            className="mx-auto mb-20 max-w-custom text-center p-8 rounded-lg xs:p-2 md:p-4 md:py-2"
            style={{ height: '2vh' }}
          >
            <InputForm
              handleSubmit={handleSubmit}
              handlePromptChange={handlePromptChange}
              prompt={prompt}
              isLoading={isLoading}
              inputRef={inputRef}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
