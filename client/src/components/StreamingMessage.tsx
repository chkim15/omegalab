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
    // Remove asterisks used for markdown formatting
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    
    // Split content by math delimiters
    const parts = cleanText.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const mathContent = part.slice(2, -2);
        try {
          return (
            <div key={index} className="my-2">
              <BlockMath math={mathContent} />
            </div>
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const mathContent = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={mathContent} />;
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else {
        // Regular text - preserve formatting and handle bold
        const formattedText = part
          .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
          .map((segment, segIndex) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              return <strong key={segIndex}>{segment.slice(2, -2)}</strong>;
            } else if (segment.startsWith('*') && segment.endsWith('*')) {
              return <em key={segIndex}>{segment.slice(1, -1)}</em>;
            }
            return segment;
          });
        
        return (
          <span key={index} className="whitespace-pre-wrap">
            {formattedText}
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