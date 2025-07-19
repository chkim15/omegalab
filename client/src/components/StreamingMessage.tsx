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
    // First, let's clean up the text to handle formatting better
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Convert ** to <strong>
      .replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Convert * to <em>
    
    // Split content by math delimiters, but keep them simple for now
    const parts = cleanText.split(/(\$[^$]+\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        const mathContent = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={mathContent} />;
        } catch (e) {
          return <span key={index} className="font-mono bg-gray-100 px-1 rounded">{mathContent}</span>;
        }
      } else {
        // Regular text - handle HTML tags we created
        return (
          <span key={index} 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: part }}
          />
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