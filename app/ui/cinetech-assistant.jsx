'use client';

import { useState, useEffect, useRef } from 'react';
import CinetechAssistantMessage from './assistant-message';
import InputForm from './input-form';
import { parseChartMarkdown } from './chart-gen';

function containsMarkdown(content) {
  return /(\*\*|__|`|#|\*|-|\||\n[\-=\*]{3,}\s*$)/.test(content.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, ''));
}

export default function CinetechAssistant({
  assistantId,
  greeting = 'I am a helpful chat assistant. How can I help you?'
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null); // Default to null
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState({
    role: 'assistant',
    content: 'Thinking...',
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [chunkCounter, setChunkCounter] = useState(0);

  const greetingMessage = {
    role: 'assistant',
    content: greeting,
  };

  async function initializeThread() {
    try {
      const response = await fetch('/api/thread-init', {
        method: 'POST',
      });
      const data = await response.json();
      setThreadId(data.threadId);
      return data.threadId;
    } catch (error) {
      console.error('Error initializing thread:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setStreamingMessage({
      role: 'assistant',
      content: 'Thinking...',
    });

    setIsLoading(true);

    setMessages([
      ...messages,
      {
        id: 'temp_user',
        role: 'user',
        content: prompt,
      },
    ]);
    setPrompt('');

    try {
      let currentThreadId = threadId;

      if (!currentThreadId) {
        currentThreadId = await initializeThread();
      }

      const response = await fetch('/api/cinetech-assistant', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: assistantId,
          threadId: currentThreadId,
          content: prompt,
        }),
      });

      const reader = response.body.getReader();
      let contentSnapshot = '';
      let processingCompleted = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const strChunk = new TextDecoder().decode(value).trim();
        const strServerEvents = strChunk.split('\n\n');

        for (const strServerEvent of strServerEvents) {
          if (strServerEvent) {
            try {
              const serverEvent = JSON.parse(strServerEvent);
              switch (serverEvent.event) {
                case 'thread.message.created':
                  setThreadId(serverEvent.data.thread_id);
                  break;
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
                    setChunkCounter((prevCounter) => prevCounter + 1);
                  }

                  if (serverEvent.data.delta.content[0].image && serverEvent.data.delta.content[0].image.url) {
                    const imageUrl = serverEvent.data.delta.content[0].image.url;
                    const newImageMessage = {
                      id: `image_${Date.now()}`,
                      role: 'assistant',
                      content: '',
                      imageUrl: imageUrl,
                    };

                    setMessages((prevMessages) => {
                      return [...prevMessages, newImageMessage];
                    });
                  }
                  break;
                case 'thread.processing.completed':
                  processingCompleted = true;
                  break;
              }
            } catch (error) {
              console.error('Error parsing server event:', error, strServerEvent);
            }
          }
        }
      }

      await fetchMessages(currentThreadId); // Fetch messages immediately after POST

      if (!processingCompleted) {
        pollForRunStatus(currentThreadId); // Start polling for run status
      }
    } catch (error) {
      console.error(`Error during request with thread ID: ${threadId}`, error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMessages(threadId) {
    try {
      const messagesResponse = await fetch('/api/cinetech-assistant?' + new URLSearchParams({
        threadId: threadId
      }));
      const allMessages = await messagesResponse.json();
      setMessages(allMessages.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  async function pollForRunStatus(threadId, timeout = 60000) { // timeout in milliseconds, default is 60 seconds
    const startTime = Date.now();
    
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch('/api/cinetech-assistant?' + new URLSearchParams({
          threadId: threadId
        }));
        const { messages, runStatus } = await statusResponse.json();
        setMessages(messages);
  
        if (runStatus && runStatus.status === 'completed') {
          clearInterval(interval);
        } else if (Date.now() - startTime >= timeout) {
          console.warn('Polling timed out.');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling for run status:', error);
      }
    }, 1000);
  }
  

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chunkCounter]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]);

  useEffect(() => {
    if (messages.length > 0) {
      console.log('New messages state:', JSON.stringify(messages, null, 2));
    }
  }, [messages]);

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
            imageUrl: m.imageUrl,
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
