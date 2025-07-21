import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
  streamingSpeed?: number;
  onContentChange?: (content: string) => void;
}

export default function StreamingMessage({ 
  content, 
  isStreaming = false, 
  streamingSpeed = 50,
  onContentChange
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      onContentChange?.(content);
      return;
    }

    setDisplayedContent('');
    setCurrentIndex(0);
  }, [content, isStreaming, onContentChange]);

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
        const newContent = content.substring(0, nextIndex);
        setDisplayedContent(newContent);
        setCurrentIndex(nextIndex);
        onContentChange?.(newContent);
      }, streamingSpeed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, content, isStreaming, streamingSpeed, onContentChange]);

  const renderMathContent = (text: string) => {
    // First convert common math symbols to proper notation
    let processedText = text
      .replace(/sqrt\(([^)]+)\)/g, '√($1)')  // sqrt(x) → √(x)
      .replace(/sqrt([a-zA-Z0-9]+)/g, '√$1')  // sqrtx → √x
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Convert ** to <strong>
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Convert * to <em>
      .replace(/\^2/g, '²')  // x^2 → x²
      .replace(/\^3/g, '³')  // x^3 → x³
      .replace(/\^([0-9]+)/g, '<sup>$1</sup>'); // x^n → x^n with superscript
    
    // Split content by math delimiters
    const parts = processedText.split(/(\$[^$]+\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math with KaTeX
        const mathContent = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={mathContent} />;
        } catch (e) {
          return <span key={index} className="font-mono bg-gray-100 px-1 rounded">{mathContent}</span>;
        }
      } else {
        // Regular text with HTML formatting and math symbols
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