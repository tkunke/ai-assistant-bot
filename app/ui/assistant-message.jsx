import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartComponent } from './chart-gen';
import styles from './assistant-message.module.css';

export default function CinetechAssistantMessage({ message }) {
  if (!message) return null;
  if (!message.role) return null;

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
        return <span style={roleStyle}>Ozzi</span>;
      default:
        return null;
    }
  }

  const renderers = {
    image: ({ src, alt }) => {
      return <img src={src} alt={alt} className="mx-auto my-2 rounded-lg" />;
    },
    link: ({ href, children }) => {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  };

  const isImageMessage = message.content.includes("![") && message.content.includes("](");

  return (
    <div
      className={`${styles.messageContainer} ${
        message.role === 'user' ? styles.selfStart : isImageMessage ? styles.selfCenter : styles.selfStart
      } text-gray-700 text-left px-4 py-2 m-2 bg-opacity-100`}
    >
      <div className="text-4xl" style={{ userSelect: 'text' }}>{displayRole(message.role)}</div>
      {message.chartData ? (
        <div className="chart-container">
          <ChartComponent {...message.chartData} />
        </div>
      ) : (
        <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      )}
    </div>
  );
}
