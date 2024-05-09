'use client'
import {useState, useEffect, useRef} from "react";
import {AiOutlineUser, AiOutlineSend, AiOutlineCamera} from "react-icons/ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function containsMarkdown(content) {
    // Check if the content contains Markdown syntax
    return /(\*\*|__|`|#|\*|-|\||\n[\-=\*]{3,}\s*$)/.test(content.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, ''));
}

export default function CinetechAssistant({
    assistantId,
    greeting = "I am a helpful chat assistant. How can I help you?",
    messageLimit = 10,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState();
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [streamingMessage, setStreamingMessage] = useState({
        role: "assistant",
        content: "Thinking...",
    });
    const messagesEndRef = useRef(null);
    const [chunkCounter, setChunkCounter] = useState(0);

    // set default greeting Message
    const greetingMessage = {
        role: "assistant",
        content: greeting,
    };

    async function handleSubmit(e) {
        e.preventDefault();

        // clear streaming message
        setStreamingMessage({
            role: "assistant",
            content: "Thinking...",
        });

        // add busy indicator
        setIsLoading(true);

        // add user message to list of messages
        setMessages(
            [
                ...messages, 
                {
                    id: "temp_user",
                    role: "user",
                    content: prompt,
                }
            ]
        );
        setPrompt("");

        // post new message to server and stream OpenAI Assistant response
        const response = await fetch('/api/cinetech-assistant', {
            method: 'POST',
            body: JSON.stringify({
                assistantId: assistantId,
                threadId: threadId,
                content: prompt,
            }),
        });

        let contentSnapshot = "";
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

            // split on newlines (to handle multiple JSON elements passed at once)
            const strServerEvents = strChunk.split("\n");

            // process each event
            for (const strServerEvent of strServerEvents) {
                const serverEvent = JSON.parse(strServerEvent);
                // console.log(serverEvent);
                switch (serverEvent.event) {
                    // create new message
                    case "thread.message.created":
                        newThreadId = serverEvent.data.thread_id;
                        setThreadId(serverEvent.data.thread_id);
                        break;

                    // update streaming message content
                    case "thread.message.delta":
                        contentSnapshot += serverEvent.data.delta.content[0].text.value;
                        const isMarkdown = serverEvent.data.delta.content[0].hasOwnProperty('markdown');
                        const newStreamingMessage = {
                            ...streamingMessage,
                            content: contentSnapshot,
                            isMarkdown: isMarkdown,
                        };
                        setStreamingMessage(newStreamingMessage);
                        setChunkCounter(prevCounter => prevCounter + 1);  // Increments the counter by one
                        break;
                }
            }
        }

        // refetch all of the messages from the OpenAI Assistant thread
        const messagesResponse = await fetch("/api/cinetech-assistant?" + new URLSearchParams({
            threadId: newThreadId,
            messageLimit: messageLimit,
        }));
        const allMessages = await messagesResponse.json();
        setMessages(allMessages);

        // remove busy indicator
        setIsLoading(false);
    }

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chunkCounter]);  // Triggers whenever the chunkCounter changes

    // handles changes to the prompt input field
    function handlePromptChange(e) {
        setPrompt(e.target.value);
      }

    return (
        <div className="flex flex-col relative py-10">
            <CinetechAssistantMessage
                message={greetingMessage}
            />
            {messages.map(m => 
                <CinetechAssistantMessage
                    key={m.id}
                    message={{
                        ...m,
                        isMarkdown: containsMarkdown(m.content)
                    }}
                />
            )}
            {isLoading &&
                <CinetechAssistantMessage 
                    message={streamingMessage}
                />
            }
            <div ref={messagesEndRef} style={{ height: '1px' }}></div>
            <div>
                <footer className="footer">
                    <div className="mx-auto mb-20 max-w-custom text-center p-8 rounded-lg xs:p-2 md:p-4 md:py-2" style={{ height: '2vh' }}>
                        <form onSubmit={handleSubmit} className="m-2 flex flex-col md:flex-row items-center">
                            <input 
                                disabled={isLoading}
                                className="border rounded w-full md:w-auto py-2 px-3 text-gray-700 mb-2 md:mb-0 md:mr-2" 
                                onChange={handlePromptChange}
                                value={prompt}
                                placeholder="Type your query here..." 
                                style={{ minWidth: '200px', flexGrow: 1 }} // Set minimum width for smaller screens and allow it to grow to fill available space
                                backgroundcolor="whitesmoke"
                            />
                            {isLoading ? 
                                <button 
                                    disabled
                                    className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:ml-2">   
                                    <CinetechSpinner /> 
                                </button>
                            : 
                                <button 
                                    disabled={prompt.length === 0}
                                    className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 md:mb-0 md:ml-2">   
                                    <AiOutlineSend /> 
                                </button>
                            }
                        </form>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export function CinetechAssistantMessage({ message }) {
    function displayRole(roleName) {
        const maroonRed = '#800000';
        const roleStyle = {
            fontWeight: 'bold',
            fontSize: '16px',
            color: roleName === "assistant" ? maroonRed : 'inherit'
        };
        switch (roleName) {
            case "user":
                return <span style={roleStyle}>User</span>;
            case "assistant":
                return <span style={roleStyle}>Cinetech</span>;
            default:
                return null;
        }
    }

    const formatHyperlinks = (text) => {
        const urlRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
    
        return text.replace(urlRegex, (match, text, url) => {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer"><strong><u>${text}</u></strong></a>`;
        });
    };

    const renderFormattedResponse = () => {
        const formattedText = formatHyperlinks(message.content);
        return (
            <div
                dangerouslySetInnerHTML={{ __html: formattedText }}
                className="mx-4 text-left overflow-auto openai-text"
            />
        );
    };
    return (
        <div className={`flex flex-col rounded text-gray-700 text-center px-4 py-2 m-2 bg-opacity-100`} style={{ alignItems: 'flex-start' }}>
            <div className="text-4xl">
                {displayRole(message.role)}
            </div>
            {message.isMarkdown ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                </ReactMarkdown>
            ) : (
                <div>
                    {renderFormattedResponse()}
                </div>
            )}
        </div>
    );
}


// Based on https://flowbite.com/docs/components/spinner/
function CinetechSpinner() {
    return (
        <svg aria-hidden="true" role="status" className="inline w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </svg>    
    )
}