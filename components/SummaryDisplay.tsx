
import React from 'react';

interface SummaryDisplayProps {
  summary: string;
}

// A simple parser to render markdown-like text from Gemini
const SummaryRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 pl-4">
          {listItems.map((item, index) => (
            <li key={`li-${index}`}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    line = line.trim();

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-2xl font-semibold text-purple-300 mt-6 mb-3">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('* ')) {
      const content = line.substring(2); // remove '* '
      const parts = content.split('**');
      const jsxContent = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-200">{part}</strong> : <span key={i}>{part}</span>
      );
      listItems.push(<>{jsxContent}</>);
    } else if (line) {
      flushList();
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-200">$1</strong>');
      elements.push(<p key={index} className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
    }
  });

  flushList(); // Add any remaining list items

  return <div className="space-y-4">{elements}</div>;
};


export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700">
      <SummaryRenderer text={summary} />
    </div>
  );
};
