import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartComponent } from './chart-gen';
import styles from './assistant-message.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AiOutlineDownload } from 'react-icons/ai'; // Import the icon

export default function CinetechAssistantMessage({ message }) {
  const tableRef = useRef(null);
  const buttonRef = useRef(null);

  if (!message) return null;
  if (!message.role) return null;

  function displayRole(roleName) {
    const maroonRed = '#800000';
    const roleStyle = {
      fontWeight: 'bold',
      fontSize: '16px',
      color: roleName === 'assistant' ? maroonRed : 'inherit',
    };

    const iconStyle = {
      width: '16px',
      height: '16px',
      marginRight: '4px', // Adjust spacing as needed
    };
    
    switch (roleName) {
      case 'user':
        return <span style={roleStyle}>User</span>;
      case 'assistant':
        return <span style={roleStyle}>CT Assistant</span>;
      default:
        return null;
    }
  }

  const handleDownloadTable = async () => {
    if (tableRef.current) {
      buttonRef.current.style.display = 'none';
      const canvas = await html2canvas(tableRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('table.pdf');
      buttonRef.current.style.display = 'block';
    }
  };

  const handleDownloadImage = (imageUrl) => {
    fetch(`/api/fetch-image?url=${encodeURIComponent(imageUrl)}`)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'generated-image.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Could not download image'));
  };

  const renderers = {
    table: ({ node, children }) => (
      <div className="relative-container" ref={tableRef}>
        <table className="table-auto w-full">
          {children}
        </table>
        <div
        className="download-button"
        ref={buttonRef}
        onClick={handleDownloadTable}
        style={{ fontSize: '1.75rem', cursor: 'pointer' }} // Inline styles for the icon
      >
        <AiOutlineDownload />
      </div>
      </div>
    ),
    img: ({ src, alt }) => (
      <div className="relative-container">
        <img src={src} alt={alt} className="mx-auto my-2 rounded-lg" />
        <div
        className="download-button"
        onClick={() => handleDownloadImage(src)}
        style={{ fontSize: '1.75rem', cursor: 'pointer' }} // Inline styles for the icon
      >
        <AiOutlineDownload />
      </div>
      </div>
    ),
    p: ({ node, children }) => {
      const hasImage = node.children.some(child => child.tagName === 'img');
      if (hasImage) {
        return <>{children}</>;
      }
      return <p>{children}</p>;
    },
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
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
