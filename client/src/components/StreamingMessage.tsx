import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
  streamingSpeed?: number;
}

export default function StreamingMessage({ 
  content, 
  isStreaming = false, 
  streamingSpeed = 50 
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      return;
    }

    setDisplayedContent('');
    setCurrentIndex(0);
  }, [content, isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;

    if (currentIndex < content.length) {
      // Find next word boundary
      let nextIndex = currentIndex;
      while (nextIndex < content.length && !/\s/.test(content[nextIndex])) {
        nextIndex++;
      }
      // Include the space
      if (nextIndex < content.length) nextIndex++;

      const timer = setTimeout(() => {
        setDisplayedContent(content.substring(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, streamingSpeed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, content, isStreaming, streamingSpeed]);

  const renderMathContent = (text: string) => {
    // Split content by math delimiters
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const mathContent = part.slice(2, -2);
        return (
          <div key={index} className="my-2">
            <BlockMath math={mathContent} />
          </div>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const mathContent = part.slice(1, -1);
        return <InlineMath key={index} math={mathContent} />;
      } else {
        // Regular text - preserve formatting
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }
    });
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {renderMathContent(displayedContent)}
      {isStreaming && currentIndex < content.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}