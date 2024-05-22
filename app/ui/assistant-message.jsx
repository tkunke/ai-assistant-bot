import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartComponent } from './chart-gen';

export default function CinetechAssistantMessage({ message }) {
  function displayRole(roleName) {
    const maroonRed = '#800000';
    const roleStyle = {
      fontWeight: 'bold',
      fontSize: '16px',
      color: roleName === 'assistant' ? maroonRed : 'inherit',
    };
    switch (roleName) {
      case 'user':
        return <span style={roleStyle}>User</span>;
      case 'assistant':
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
    <div
      className={`flex flex-col rounded text-gray-700 text-left px-4 py-2 m-2 bg-opacity-100`}
      style={{ alignItems: 'flex-start' }}
    >
      <div className="text-4xl">{displayRole(message.role)}</div>
      {message.chartData ? (
        <div className="chart-container">
            <ChartComponent {...message.chartData} />
        </div>
      ) : message.isMarkdown ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      ) : (
        <div>{renderFormattedResponse()}</div>
      )}
    </div>
  );
}
