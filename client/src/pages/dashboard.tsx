import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { 
  Plus, 
  MessageSquare, 
  FileText, 
  Mic, 
  Image, 
  Send,
  Settings,
  BookOpen,
  MoreHorizontal,
  Edit3,
  X,
  User,
  LogOut,
  Shield,
  Trash2,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StreamingMessage from "@/components/StreamingMessage";
import TldrawPad from "@/components/tldraw-pad";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  metadata?: {
    images?: Array<{
      url: string;
      name?: string;
      size?: number;
    }>;
  };
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<"answer" | "tutor">("tutor");
  const [defaultMode, setDefaultMode] = useState<"answer" | "tutor">("tutor");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{url: string, file: File}[]>([]);
  const [showMathInput, setShowMathInput] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const [showMathSymbols, setShowMathSymbols] = useState(false);
  const [mathSymbolSearch, setMathSymbolSearch] = useState("");
  const [selectedMathCategory, setSelectedMathCategory] = useState("Common");
  const [currentEditingMathId, setCurrentEditingMathId] = useState<string | null>(null);
  const [originalLatexBeingEdited, setOriginalLatexBeingEdited] = useState<string>('');
  const mathInputRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, logout } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Math symbols data
  const mathSymbols = [
    // Basic Operators
    { symbol: "+", name: "Plus", category: "Common" },
    { symbol: "-", name: "Minus", category: "Common" },
    { symbol: "×", name: "Multiplication", category: "Common" },
    { symbol: "÷", name: "Division", category: "Common" },
    { symbol: "±", name: "Plus-Minus", category: "Common" },
    { symbol: "□/□", name: "Fraction", category: "Common" },
    { symbol: "√□", name: "Square Root", category: "Common" },
    { symbol: "□²", name: "Squared", category: "Common" },
    { symbol: "□³", name: "Cubed", category: "Common" },
    { symbol: "□^□", name: "Exponent", category: "Common" },
    
    // Relations
    { symbol: "=", name: "Equals", category: "Common" },
    { symbol: "≠", name: "Not Equals", category: "Common" },
    { symbol: "≈", name: "Approximately", category: "Common" },
    { symbol: "<", name: "Less Than", category: "Common" },
    { symbol: "≤", name: "Less Than or Equal", category: "Common" },
    { symbol: ">", name: "Greater Than", category: "Common" },
    { symbol: "≥", name: "Greater Than or Equal", category: "Common" },
    { symbol: "·", name: "Dot", category: "Common" },
    
    // Logarithms and Variables
    { symbol: "ln □", name: "Natural Log", category: "Common" },
    { symbol: "log₁₀(□)", name: "Log Base 10", category: "Common" },
    { symbol: "log□ □", name: "Log Base", category: "Common" },
    { symbol: "e^□", name: "E to Power", category: "Common" },
    { symbol: "x", name: "Variable x", category: "Common" },
    { symbol: "y", name: "Variable y", category: "Common" },
    { symbol: "t", name: "Variable t", category: "Common" },
    { symbol: "n", name: "Variable n", category: "Common" },
    
    // Constants and Symbols
    { symbol: "π", name: "Pi", category: "Common" },
    { symbol: "e", name: "Euler's Number", category: "Common" },
    { symbol: "∞", name: "Infinity", category: "Common" },
    { symbol: "°", name: "Degree", category: "Common" },
    { symbol: "θ", name: "Theta", category: "Common" },
    { symbol: "%", name: "Percent", category: "Common" },
    { symbol: "(□)", name: "Parentheses", category: "Common" },
    { symbol: "[□]", name: "Square Brackets", category: "Common" },
    { symbol: "|□|", name: "Absolute Value", category: "Common" },
    { symbol: "||□||", name: "Norm", category: "Common" },
    { symbol: "⊢", name: "Right Tack", category: "Common" },
    
    // Summation and Functions
    { symbol: "∑", name: "Summation", category: "Common" },
    { symbol: "gcd(□, □)", name: "Greatest Common Divisor", category: "Common" },
    { symbol: "lcm(□, □)", name: "Least Common Multiple", category: "Common" },
    
    // Trigonometry
    { symbol: "sin(□)", name: "Sine", category: "Common" },
    { symbol: "cos(□)", name: "Cosine", category: "Common" },
    { symbol: "tan(□)", name: "Tangent", category: "Common" },
    { symbol: "lim□→□", name: "Limit", category: "Common" },
    { symbol: "d/dx", name: "Derivative", category: "Common" },
    
    // Integrals
    { symbol: "∫ d□", name: "Indefinite Integral", category: "Common" },
    { symbol: "∫□^□ d□", name: "Definite Integral", category: "Common" },
  ];

  const mathCategories = ["Common", "Algebra", "Calculus", "Statistics", "Geometry"];

  // Filter symbols based on search and category
  const filteredMathSymbols = mathSymbols.filter(symbol => 
    symbol.category === selectedMathCategory && 
    (symbol.name.toLowerCase().includes(mathSymbolSearch.toLowerCase()) || 
     symbol.symbol.toLowerCase().includes(mathSymbolSearch.toLowerCase()))
  );

  // Check if user is at bottom of messages
  const checkIfAtBottom = () => {
    if (!scrollAreaRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const threshold = 20; // Reduced tolerance to be more precise
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Auto-scroll to bottom when messages change, but only if user is at bottom
  const scrollToBottom = () => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Get user data from Firebase
  const userEmail = currentUser?.email || "";
  const subscription = "Free"; // This could be enhanced to check user's subscription status

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      });
    }
  };

  const handleProUpgrade = async () => {
    try {
      // Redirect to Stripe checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RmfQRKvRMqGR0DBuBE2YWTT', // Your actual Stripe price ID
          userId: currentUser?.uid,
          email: currentUser?.email,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe checkout
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update message history when message changes
  const updateMessageHistory = (newMessage: string) => {
    setMessage(newMessage);
    
    // Only add to history if it's different from current
    if (newMessage !== messageHistory[historyIndex]) {
      const newHistory = messageHistory.slice(0, historyIndex + 1);
      newHistory.push(newMessage);
      setMessageHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Drawing completion handler
  const handleDrawingComplete = (imageData: string) => {
    // Create a file from the image data
    const base64Data = imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], 'drawing.png', { type: 'image/png' });
    
    // Add the image to uploaded images
    setUploadedImages(prev => [...prev, { url: imageData, file }]);
    
    setShowDrawing(false);
  };

  // Function to insert a math symbol into the math input
  const insertMathSymbol = (symbol: string) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.write(symbol);
      mathFieldRef.current.focus();
    }
  };

  // Function to insert math expression into main message and close math input
  const insertMathIntoMessage = (latex: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    if (textarea) {
      if (currentEditingMathId) {
        // When editing, replace the original LaTeX with the new HTML expression
        const newMathExpression = `<span class="math-expression" data-latex="${latex}" data-math-id="${currentEditingMathId}"></span>`;
        const newMessage = message.replace(originalLatexBeingEdited, newMathExpression);
        setMessage(newMessage);
        setCurrentEditingMathId(null);
        setOriginalLatexBeingEdited('');
        
        // Focus back to textarea and position cursor after the edited math expression
        setTimeout(() => {
          textarea.focus();
          const mathPos = newMessage.indexOf(newMathExpression);
          const cursorPos = mathPos + newMathExpression.length;
          textarea.setSelectionRange(cursorPos, cursorPos);
          // Update visual cursor to match
          setTimeout(() => renderMathExpressions(), 10);
        }, 150);
      } else {
        // Create new math expression
        const mathId = `math_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const mathExpression = `<span class="math-expression" data-latex="${latex}" data-math-id="${mathId}"></span>`;
        const cursorPos = textarea.selectionStart || message.length;
        const newMessage = message.slice(0, cursorPos) + mathExpression + message.slice(cursorPos);
        setMessage(newMessage);
        
        // Focus back to textarea with cursor positioned after the math expression
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = cursorPos + mathExpression.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          // Update visual cursor to match
          setTimeout(() => renderMathExpressions(), 10);
        }, 150);
      }
      
      // Close math input and reset
      setShowMathInput(false);
      setShowMathSymbols(false);
      mathFieldRef.current = null;
    }
  };

  // Function to render math expressions in the textarea
  const renderMathExpressions = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea || !textarea.parentElement) return;

    // Create or update the overlay div that will contain rendered math
    let overlay = textarea.parentElement.querySelector('.math-overlay') as HTMLElement;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'math-overlay';
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 2;
        padding: 12px 16px;
        font-family: monospace;
        font-size: 16px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        color: black;
      `;
      textarea.parentElement.appendChild(overlay);
    }

    // Parse the textarea content and render math expressions
    const content = textarea.value;
    const mathRegex = /<span class="math-expression" data-latex="([^"]*)" data-math-id="([^"]*)"><\/span>/g;
    
    let lastIndex = 0;
    let renderedContent = '';
    let match;

    while ((match = mathRegex.exec(content)) !== null) {
      // Add text before math expression - make visible since textarea is transparent
      const textBefore = content.slice(lastIndex, match.index);
      const escapedTextBefore = textBefore.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      renderedContent += `<span style="color: black; text-decoration: none;">${escapedTextBefore}</span>`;
      
      // Add math expression as a clickable span
      const latex = match[1];
      const mathId = match[2];
      renderedContent += `<span class="rendered-math-expression" data-latex="${latex}" data-math-id="${mathId}" style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; cursor: pointer; pointer-events: auto; display: inline-block; margin: 0 1px; border: 1px solid #d1d5db; text-decoration: none;"></span>`;
      
      lastIndex = mathRegex.lastIndex;
    }
    
    // Add remaining text - make visible since textarea is transparent
    const remainingText = content.slice(lastIndex);
    const escapedRemainingText = remainingText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    renderedContent += `<span style="color: black; text-decoration: none;">${escapedRemainingText}</span>`;
    
    overlay.innerHTML = renderedContent;
    
    // Create a custom cursor that follows the visual layout
    const createVisualCursor = () => {
      let existingCursor = overlay.querySelector('.visual-cursor');
      if (existingCursor) {
        existingCursor.remove();
      }
      
      const cursor = document.createElement('span');
      cursor.className = 'visual-cursor';
      cursor.style.cssText = `
        position: absolute;
        width: 1px;
        height: 20px;
        background: black;
        animation: blink 1s infinite;
        pointer-events: none;
        z-index: 10;
      `;
      
      // Calculate cursor position based on content
      const cursorPos = textarea.selectionStart;
      
      // Find the visual position by measuring text up to cursor position
      const measureSpan = document.createElement('span');
      measureSpan.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: pre;
        font-family: monospace;
        font-size: 16px;
        line-height: 1.5;
      `;
      
      // Get text up to cursor accounting for math expressions
      let visualText = '';
      let contentIndex = 0;
      
      while (contentIndex < cursorPos && contentIndex < content.length) {
        if (content.slice(contentIndex).startsWith('<span class="math-expression"')) {
          // Skip the HTML tag and add a placeholder character for the math expression
          const tagEnd = content.indexOf('></span>', contentIndex) + 8;
          visualText += '■'; // Use a placeholder character for math
          contentIndex = tagEnd; // Move to end of HTML tag
        } else {
          visualText += content[contentIndex];
          contentIndex++;
        }
      }
      
      measureSpan.textContent = visualText;
      document.body.appendChild(measureSpan);
      const width = measureSpan.offsetWidth;
      document.body.removeChild(measureSpan);
      
      cursor.style.left = (12 + width) + 'px'; // 12px is the padding
      cursor.style.top = '15px';
      
      overlay.appendChild(cursor);
    };
    
    // Add blink animation if not exists
    if (!document.querySelector('#cursor-blink-style')) {
      const style = document.createElement('style');
      style.id = 'cursor-blink-style';
      style.textContent = `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Initialize MathQuill for rendered expressions
    setTimeout(() => {
      const renderedExpressions = overlay.querySelectorAll('.rendered-math-expression');
      renderedExpressions.forEach((expr) => {
        const latex = expr.getAttribute('data-latex');
        if (latex && (window as any).MathQuill) {
          const MQ = (window as any).MathQuill.getInterface(2);
          MQ.StaticMath(expr).latex(latex);
          
          // Add click handler for editing
          expr.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mathId = expr.getAttribute('data-math-id');
            setCurrentEditingMathId(mathId);
            setOriginalLatexBeingEdited(latex);
            
            // Replace the HTML math expression with plain LaTeX for editing
            const mathRegex = new RegExp(`<span class="math-expression" data-latex="([^"]*)" data-math-id="${mathId}"></span>`, 'g');
            const tempMessage = message.replace(mathRegex, latex);
            setMessage(tempMessage);
            
            setShowMathInput(true);
            
            setTimeout(() => {
              if (mathFieldRef.current) {
                mathFieldRef.current.latex(latex);
                mathFieldRef.current.focus();
              }
            }, 150);
          });
        }
      });
      
      // Create visual cursor after math is rendered
      createVisualCursor();
    }, 100);
  };

  // Function to handle clicking on existing math expressions for editing
  const handleTextareaClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    // This function is now handled by the overlay click handlers
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };
      
      setRecognition(recognitionInstance);
    }
  }, [toast]);

  // Load settings from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('defaultResponseMode') as "answer" | "tutor" | null;
    const savedTheme = localStorage.getItem('theme') as "light" | "dark" | "system" | null;
    
    if (savedMode) {
      setDefaultMode(savedMode);
      setSelectedMode(savedMode);
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Add MathQuill styles for rendered math
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .math-display {
        font-family: 'Times New Roman', serif;
        font-size: 16px;
        line-height: 1.2;
      }
      .math-display .mq-root-block {
        display: inline-block;
      }
      .mq-editable-field, .mq-math-mode {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        text-decoration: none !important;
      }
      .mq-editable-field .mq-cursor {
        border-left: 1px solid black !important;
      }
      .mq-editable-field .mq-selection, .mq-editable-field .mq-selection .mq-non-leaf {
        background: rgba(59, 130, 246, 0.3) !important;
        border: none !important;
        outline: none !important;
      }
      .mq-editable-field.mq-focused {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .mq-editable-field .mq-hasCursor {
        border: none !important;
      }
      .rendered-math-expression .mq-math-mode {
        border: none !important;
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const saveSettings = () => {
    localStorage.setItem('defaultResponseMode', defaultMode);
    localStorage.setItem('theme', theme);
    setSelectedMode(defaultMode);
    setIsSettingsOpen(false);
  };

  // Helper function to render math content
  const renderMathContent = (content: string) => {
    if (!content) return '';
    
    // Replace [MATH]...[/MATH] markers with rendered math
    return content.replace(/\[MATH\](.*?)\[\/MATH\]/g, (match, latex) => {
      try {
        // Create a temporary div to render the math
        const tempDiv = document.createElement('div');
        if ((window as any).MathQuill) {
          const MQ = (window as any).MathQuill.getInterface(2);
          const staticMath = MQ.StaticMath(tempDiv);
          staticMath.latex(latex);
          return `<span class="math-display" style="display: inline-block; margin: 0 2px;">${tempDiv.innerHTML}</span>`;
        } else {
          // Fallback to LaTeX if MathQuill not available
          return `<span class="math-display">$${latex}$</span>`;
        }
      } catch (error) {
        console.error('Error rendering math:', error);
        return `<span class="math-display">$${latex}$</span>`;
      }
    });
  };

  // Create a simple mapping between Firebase UID and numeric ID for backend compatibility
  const getUserNumericId = (firebaseUid: string | null): number => {
    if (!firebaseUid) return 1;
    // Simple hash of Firebase UID to create consistent numeric ID
    let hash = 0;
    for (let i = 0; i < firebaseUid.length; i++) {
      const char = firebaseUid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000000 + 1; // Ensure positive number between 1-1000000
  };

  const userId = currentUser?.uid ? getUserNumericId(currentUser.uid) : null;

  // Fetch conversations for the current user
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/conversations?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${currentConversationId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!currentConversationId,
  });

  useEffect(() => {
    // Only auto-scroll if user is at bottom and not actively scrolling up
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  // Track scroll position to determine if user is at bottom
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      setIsAtBottom(checkIfAtBottom());
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Initialize MathQuill when math input is shown
  useEffect(() => {
    if (showMathInput && mathInputRef.current && !mathFieldRef.current) {
      // Load MathQuill CSS and JS
      const loadMathQuill = async () => {
        // Load CSS globally if not already loaded
        if (!document.querySelector('link[href*="mathquill"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.css';
          document.head.appendChild(cssLink);
          
          // Add custom CSS to remove red dotted lines and other unwanted styling
          const customCSS = document.createElement('style');
          customCSS.textContent = `
            .mq-editable-field, .mq-math-mode {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }
            .mq-editable-field .mq-cursor {
              border-left: 1px solid black !important;
            }
            .mq-editable-field .mq-selection, .mq-editable-field .mq-selection .mq-non-leaf {
              background: rgba(59, 130, 246, 0.3) !important;
              border: none !important;
              outline: none !important;
            }
            .mq-editable-field.mq-focused {
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }
            .mq-editable-field .mq-hasCursor {
              border: none !important;
            }
            .rendered-math-expression .mq-math-mode {
              border: none !important;
              outline: none !important;
            }
          `;
          document.head.appendChild(customCSS);
        }

        // Load jQuery first (required by MathQuill)
        if (!(window as any).jQuery) {
          const jqueryScript = document.createElement('script');
          jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
          await new Promise((resolve, reject) => {
            jqueryScript.onload = resolve;
            jqueryScript.onerror = reject;
            document.head.appendChild(jqueryScript);
          });
        }

        // Load MathQuill
        if (!(window as any).MathQuill) {
          const mathquillScript = document.createElement('script');
          mathquillScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js';
          await new Promise((resolve, reject) => {
            mathquillScript.onload = resolve;
            mathquillScript.onerror = reject;
            document.head.appendChild(mathquillScript);
          });
        }

        // Initialize MathQuill
        setTimeout(() => {
          try {
            const MQ = (window as any).MathQuill.getInterface(2);
            mathFieldRef.current = MQ.MathField(mathInputRef.current, {
              spaceBehavesLikeTab: true,
              leftRightIntoCmdGoes: 'up',
              restrictMismatchedBrackets: true,
              sumStartsWithNEquals: true,
              supSubsRequireOperand: true,
              charsThatBreakOutOfSupSub: '+-=<>',
              autoSubscriptNumerals: true,
              autoCommands: 'pi theta sqrt sum prod alpha beta gamma delta epsilon zeta eta mu nu xi rho sigma tau phi chi psi omega',
              autoOperatorNames: 'sin cos tan log ln exp lim max min',
              handlers: {
                enter: () => {
                  const latex = mathFieldRef.current.latex();
                  if (latex) {
                    insertMathIntoMessage(latex);
                  }
                },
                edit: () => {
                  // Dynamically adjust width based on content
                  const latex = mathFieldRef.current.latex();
                  if (latex && mathInputRef.current) {
                    const container = mathInputRef.current.closest('.absolute') as HTMLElement;
                    if (container) {
                      const baseWidth = 200; // minimum width
                      const charWidth = 8; // approximate width per character
                      const newWidth = Math.max(baseWidth, Math.min(600, latex.length * charWidth));
                      container.style.width = `${newWidth}px`;
                    }
                  }
                }
              }
            });
            mathFieldRef.current.focus();
          } catch (error) {
            console.error('Error initializing MathQuill:', error);
            setShowMathInput(false);
          }
        }, 100);
      };

      loadMathQuill();
    }
  }, [showMathInput]);

  // Render math expressions when message changes
  useEffect(() => {
    if (message.includes('class="math-expression"') && !showMathInput) {
      renderMathExpressions();
    } else {
      // Remove overlay if no math expressions or when editing
      const overlay = document.querySelector('.math-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  }, [message, showMathInput]);

  // Handle clicking outside math input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMathInput && mathInputRef.current) {
        const mathContainer = mathInputRef.current.closest('.absolute');
        const symbolsPanel = document.querySelector('.absolute.bottom-full');
        
        const isClickInsideMathArea = mathContainer && mathContainer.contains(event.target as Node);
        const isClickInsideSymbolsPanel = symbolsPanel && symbolsPanel.contains(event.target as Node);
        
        if (!isClickInsideMathArea && !isClickInsideSymbolsPanel) {
          const latex = mathFieldRef.current?.latex();
          if (latex) {
            insertMathIntoMessage(latex);
          } else {
            // If no LaTeX and we were editing, restore the original
            if (currentEditingMathId && originalLatexBeingEdited) {
              const mathExpression = `<span class="math-expression" data-latex="${originalLatexBeingEdited}" data-math-id="${currentEditingMathId}"></span>`;
              const newMessage = message.replace(originalLatexBeingEdited, mathExpression);
              setMessage(newMessage);
            }
            setShowMathInput(false);
            setShowMathSymbols(false);
            setCurrentEditingMathId(null);
            setOriginalLatexBeingEdited('');
            mathFieldRef.current = null;
            
            // Focus back to textarea
            setTimeout(() => {
              const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
              if (textarea) {
                textarea.focus();
                setTimeout(() => renderMathExpressions(), 10);
              }
            }, 50);
          }
        }
      }
    };

    if (showMathInput) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMathInput]);

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest("/api/conversations", {
        method: "POST",
        body: { userId, title },
      }),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", userId] });
      setCurrentConversationId(newConversation.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { problem: string; mode: string; images?: any[]; conversationId: number }) =>
      apiRequest("/api/solve", {
        method: "POST",
        body: {
          problem: messageData.problem,
          conversationId: messageData.conversationId,
          inputMethod: "text",
          mode: messageData.mode,
          images: messageData.images,
          // Don't send userId - the solve endpoint doesn't need it
        },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", currentConversationId, "messages"],
      });
      // Trigger streaming for the most recent assistant message only if not already streaming
      if (streamingMessageId === null) {
        setTimeout(() => {
          setStreamingMessageId(-1); // Use -1 to indicate latest message should stream
          // Scroll to bottom after a short delay to ensure new messages are rendered
          setTimeout(() => {
            if (isAtBottom) scrollToBottom();
          }, 100);
        }, 100);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = () => {
    const title = `Chat ${new Date().toLocaleDateString()}`;
    createConversationMutation.mutate(title);
  };

  const handleSpeechToText = () => {
    if (!recognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setUploadedImages(prev => [...prev, { url, file }]);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "" && uploadedImages.length === 0) return;

    let finalMessage = message.trim() || "";
    let imageData = [];

    // Process any uploaded images and store them with the message
    if (uploadedImages.length > 0) {
      setIsUploading(true);
      try {
        for (const imageItem of uploadedImages) {
          // Convert image to base64 for storage
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result); // Keep full data URL
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageItem.file);
          });

          // Store image data for display and processing
          imageData.push({
            url: base64,
            name: imageItem.file.name,
            size: imageItem.file.size
          });
        }
      } catch (error) {
        console.error('Error processing images:', error);
        toast({
          title: "Image Processing Error",
          description: "Some images couldn't be processed, but message will be sent anyway.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }

    // Determine the message content
    const messageContent = finalMessage || (imageData.length > 0 ? "Please solve the math problem in the attached image" : "");
    
    if (!currentConversationId) {
      // Create new conversation and send message in sequence
      const title = messageContent.length > 50 ? messageContent.substring(0, 50) + "..." : messageContent || "Math Problem";
      
      try {
        // Create conversation first
        const newConversation = await createConversationMutation.mutateAsync(title);
        
        // Then send the message with the new conversation ID
        sendMessageMutation.mutate({ 
          problem: messageContent, 
          mode: selectedMode,
          images: imageData.length > 0 ? imageData : undefined,
          conversationId: newConversation.id
        });
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast({
          title: "Error",
          description: "Failed to create conversation. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Send message to existing conversation
      sendMessageMutation.mutate({ 
        problem: messageContent, 
        mode: selectedMode,
        images: imageData.length > 0 ? imageData : undefined,
        conversationId: currentConversationId
      });
    }

    // Clear input and images after sending
    setMessage("");
    uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    
    // Only scroll if user is at bottom
    if (isAtBottom) {
      setTimeout(scrollToBottom, 50);
    }
  };

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${isSidebarHidden ? 'w-0 overflow-hidden' : 'w-80'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNewChat}
              className="flex-1 justify-start gap-2 bg-omegalab-blue hover:bg-blue-700 text-white"
              disabled={createConversationMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarHidden(true)}
              className="p-2 text-gray-600 hover:bg-gray-100"
              title="Hide sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-4 pt-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {conversationsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No chats yet</div>
            ) : (
              <>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Today (Jul 18, 2025)
                </div>
                {conversations.map((conversation: Conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conversation.id
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                    onClick={() => setCurrentConversationId(conversation.id)}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Site settings
                    </DialogTitle>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Theme Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Theme</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className={theme === "light" ? "bg-gray-900 text-white" : ""}
                      >
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className={theme === "dark" ? "bg-gray-900 text-white" : ""}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("system")}
                        className={theme === "system" ? "bg-gray-900 text-white" : ""}
                      >
                        System
                      </Button>
                    </div>
                  </div>

                  {/* Response Mode Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Response mode</h3>
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Choose how OmegaLab responds to your questions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          defaultMode === "answer" 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setDefaultMode("answer")}
                      >
                        <div className="bg-gray-900 text-white px-3 py-2 rounded-t-lg mb-2">
                          <h4 className="font-semibold">Give me the answer</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Answers directly unless asked otherwise.
                        </p>
                      </div>
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          defaultMode === "tutor" 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setDefaultMode("tutor")}
                      >
                        <div className="bg-gray-900 text-white px-3 py-2 rounded-t-lg mb-2">
                          <h4 className="font-semibold">Tutor me</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Asks leading questions instead of giving you the answer. Better for practicing and learning. Only available through our Pro model.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveSettings} className="bg-omegalab-blue hover:bg-blue-700">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-1 text-xs text-omegalab-blue">
            <button 
              onClick={() => setShowProUpgrade(true)}
              className="hover:underline cursor-pointer"
            >
              📈 Try Pro for free →
            </button>
          </div>
        </div>

        {/* User Profile Button */}
        <div className="py-2 px-4 border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-white">
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700">
                <User className="h-4 w-4 mr-3" />
                <span className="truncate">{userEmail}</span>
                <MoreHorizontal className="h-4 w-4 ml-auto" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <DialogTitle className="text-2xl font-bold">My Profile</DialogTitle>
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Site settings
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Log out button */}
                <div className="flex justify-start">
                  <Button variant="outline" className="bg-gray-900 text-white border-gray-900 hover:bg-gray-800" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Info</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">{userEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900">{subscription}</p>
                        <Button variant="link" className="text-omegalab-blue p-0 h-auto text-sm" onClick={() => setShowProUpgrade(true)}>
                          🚀 Try Pro for free →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manage Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Manage</h3>
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start text-omegalab-blue hover:bg-blue-50">
                      <Shield className="h-4 w-4 mr-3" />
                      Privacy Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-3" />
                      Delete account
                    </Button>
                    <div className="pt-2">
                      <p className="text-sm text-gray-600 mb-2">Problems with your account?</p>
                      <Button variant="link" className="text-omegalab-blue p-0 h-auto text-sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat with us directly →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Show Sidebar Button - appears when sidebar is hidden */}
      {isSidebarHidden && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarHidden(false)}
            className="bg-white shadow-lg border-gray-300 hover:bg-gray-50"
            title="Show sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="max-w-2xl mx-auto space-y-4">
            {messagesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start a new conversation
                </h3>
                <p className="text-gray-500">Ask me any math question to get started!</p>
              </div>
            ) : (
              messages.map((msg: Message) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                  <div className="flex items-start space-x-3 max-w-3xl">
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Θ</span>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white ml-auto"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">You</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">OmegaLab</span>
                        </div>
                      )}
                      {msg.role === "assistant" ? (
                        <StreamingMessage 
                          content={msg.content} 
                          isStreaming={streamingMessageId === -1 && msg.id === Math.max(...messages.filter((m: Message) => m.role === "assistant").map((m: Message) => m.id))}
                          onContentChange={() => {
                            if (isAtBottom) {
                              scrollToBottom();
                            }
                          }}
                        />
                      ) : (
                        <div className="text-gray-900 dark:text-white">
                          {/* Show images if they exist */}
                          {msg.metadata?.images && Array.isArray(msg.metadata.images) && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {msg.metadata.images.map((img: any, imgIndex: number) => (
                                <img 
                                  key={imgIndex}
                                  src={img.url}
                                  alt="Uploaded image" 
                                  className="max-w-xs max-h-48 object-contain rounded border"
                                />
                              ))}
                            </div>
                          )}
                          <div 
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: renderMathContent(msg.content) }}
                          />
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">You</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
            {/* Top toolbar */}
            <div className="flex items-center justify-between mb-4">
              {/* Left: Answer and Tutor buttons (replacing undo/redo) */}
              <div className="flex items-center space-x-2">
                <Button 
                  type="button"
                  variant={selectedMode === "answer" ? "default" : "outline"}
                  size="sm" 
                  className={selectedMode === "answer" 
                    ? "bg-gray-900 text-white hover:bg-gray-800" 
                    : "text-gray-600 border-gray-300"
                  }
                  onClick={() => setSelectedMode("answer")}
                >
                  Answer
                </Button>
                <Button
                  type="button"
                  variant={selectedMode === "tutor" ? "default" : "outline"}
                  size="sm"
                  className={selectedMode === "tutor" 
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "text-gray-600 border-gray-300"
                  }
                  onClick={() => setSelectedMode("tutor")}
                >
                  Tutor
                </Button>
              </div>
              
              {/* Right: Input tools */}
              <div className="flex items-center space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-gray-600 hover:bg-gray-100 ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}`}
                  onClick={handleSpeechToText}
                  disabled={!recognition}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-gray-600 hover:bg-gray-100 ${isUploading ? 'opacity-50' : ''}`}
                  disabled={isUploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="h-6 w-px bg-gray-300"></div>
                <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100" onClick={() => setShowDrawing(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-gray-600 hover:bg-gray-100 ${showMathInput ? 'bg-blue-100 text-blue-600' : ''}`}
                  title="Math equations" 
                  onClick={() => setShowMathInput(!showMathInput)}
                >
                  <span className="text-sm font-mono font-bold">fx</span>
                </Button>
              </div>
            </div>
            
            {/* Image previews */}
            {uploadedImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img.url} 
                      alt="Upload preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(img.url);
                        setUploadedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input area */}
            <div className="relative">
              <div className="relative border border-gray-300 rounded-lg bg-white">
                <textarea
                  value={message}
                  onChange={(e) => updateMessageHistory(e.target.value)}
                  onPaste={handlePaste}
                  onClick={handleTextareaClick}
                  placeholder={isUploading ? "Processing images..." : "Enter a message... (\\ for math) or paste an image"}
                  className="w-full bg-transparent px-4 py-3 focus-visible:ring-0 focus-visible:outline-none resize-none min-h-[48px] max-h-32 border-0 relative z-0"
                  disabled={sendMessageMutation.isPending || isUploading}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                    // Activate math input if user types backward slash
                    if (e.nativeEvent instanceof InputEvent && e.nativeEvent.data === '\\') {
                      // Prevent the backslash from appearing and activate math input
                      e.preventDefault();
                      const currentValue = target.value;
                      const cursorPos = target.selectionStart || 0;
                      // Remove the backslash that was just typed
                      const newValue = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
                      setTimeout(() => {
                        updateMessageHistory(newValue);
                        setShowMathInput(true);
                      }, 0);
                    }
                    // Update visual cursor position when content changes
                    setTimeout(() => renderMathExpressions(), 10);
                  }}
                  onKeyUp={() => {
                    // Update visual cursor on key release
                    setTimeout(() => renderMathExpressions(), 10);
                  }}
                  onMouseUp={() => {
                    // Update visual cursor on mouse click
                    setTimeout(() => renderMathExpressions(), 10);
                  }}
                  style={{ 
                    fontFamily: 'monospace',
                    color: (message.includes('class="math-expression"') && !showMathInput) ? 'transparent' : 'black',
                    caretColor: 'transparent',
                    textDecoration: 'none',
                    WebkitTextDecorationLine: 'none',
                    textDecorationLine: 'none',
                    outline: 'none',
                    border: 'none'
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                
                {/* Math input overlay - styled like the design */}
                {showMathInput && (
                  <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded-lg flex items-center px-3 py-2" style={{ width: 120 }}>
                    <div className="flex-1 flex items-center min-h-[40px]">
                      <div 
                        ref={mathInputRef}
                        className="flex-1 min-h-[32px] bg-gray-50 border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', textDecoration: 'none' }}
                        spellCheck={false}
                      />
                    </div>
                    
                    {/* Expansion button for symbols */}
                    <button 
                      type="button"
                      onClick={() => setShowMathSymbols(!showMathSymbols)}
                      className={`ml-3 p-2 rounded-md border transition-colors ${
                        showMathSymbols 
                          ? 'bg-blue-100 border-blue-300 text-blue-700' 
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Show math symbols"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={showMathSymbols ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                        />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Math notation selector - positioned above the input */}
                {showMathInput && showMathSymbols && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-4 py-3">
                      <h3 className="font-semibold text-gray-900">Common</h3>
                    </div>

                    {/* Math Symbols Grid */}
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-2">
                        {filteredMathSymbols.map((symbol, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              // Convert symbol to LaTeX format
                              let latexSymbol = symbol.symbol;
                              if (symbol.symbol === "×") latexSymbol = "\\times";
                              else if (symbol.symbol === "÷") latexSymbol = "\\div";
                              else if (symbol.symbol === "±") latexSymbol = "\\pm";
                              else if (symbol.symbol === "□/□") latexSymbol = "\\frac{}{}";
                              else if (symbol.symbol === "√□") latexSymbol = "\\sqrt{}";
                              else if (symbol.symbol === "□²") latexSymbol = "^{2}";
                              else if (symbol.symbol === "□³") latexSymbol = "^{3}";
                              else if (symbol.symbol === "□^□") latexSymbol = "^{}";
                              else if (symbol.symbol === "≠") latexSymbol = "\\neq";
                              else if (symbol.symbol === "≈") latexSymbol = "\\approx";
                              else if (symbol.symbol === "≤") latexSymbol = "\\leq";
                              else if (symbol.symbol === "≥") latexSymbol = "\\geq";
                              else if (symbol.symbol === "·") latexSymbol = "\\cdot";
                              else if (symbol.symbol === "ln □") latexSymbol = "\\ln";
                              else if (symbol.symbol === "log₁₀(□)") latexSymbol = "\\log_{10}";
                              else if (symbol.symbol === "log□ □") latexSymbol = "\\log_{}";
                              else if (symbol.symbol === "e^□") latexSymbol = "e^{}";
                              else if (symbol.symbol === "π") latexSymbol = "\\pi";
                              else if (symbol.symbol === "∞") latexSymbol = "\\infty";
                              else if (symbol.symbol === "°") latexSymbol = "^{\\circ}";
                              else if (symbol.symbol === "θ") latexSymbol = "\\theta";
                              else if (symbol.symbol === "(□)") latexSymbol = "()";
                              else if (symbol.symbol === "[□]") latexSymbol = "[]";
                              else if (symbol.symbol === "|□|") latexSymbol = "||";
                              else if (symbol.symbol === "||□||") latexSymbol = "|||";
                              else if (symbol.symbol === "⊢") latexSymbol = "\\vdash";
                              else if (symbol.symbol === "∑") latexSymbol = "\\sum";
                              else if (symbol.symbol === "gcd(□, □)") latexSymbol = "\\gcd(,)";
                              else if (symbol.symbol === "lcm(□, □)") latexSymbol = "\\lcm(,)";
                              else if (symbol.symbol === "sin(□)") latexSymbol = "\\sin";
                              else if (symbol.symbol === "cos(□)") latexSymbol = "\\cos";
                              else if (symbol.symbol === "tan(□)") latexSymbol = "\\tan";
                              else if (symbol.symbol === "lim□→□") latexSymbol = "\\lim_{}";
                              else if (symbol.symbol === "d/dx") latexSymbol = "\\frac{d}{dx}";
                              else if (symbol.symbol === "∫ d□") latexSymbol = "\\int d";
                              else if (symbol.symbol === "∫□^□ d□") latexSymbol = "\\int_{}^{} d";
                              
                              insertMathSymbol(latexSymbol);
                            }}
                            className="min-h-[32px] h-auto px-1 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded transition-colors flex items-center justify-center text-center"
                            title={symbol.name}
                          >
                            <span className="font-mono leading-tight break-words max-w-full text-center">{symbol.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer with Search and Filter */}
                    <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search"
                          value={mathSymbolSearch}
                          onChange={(e) => setMathSymbolSearch(e.target.value)}
                          className="flex-1 text-sm border-none outline-none bg-transparent"
                        />
                      </div>
                      
                      <div className="flex items-center ml-4">
                        <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <select
                          value={selectedMathCategory}
                          onChange={(e) => setSelectedMathCategory(e.target.value)}
                          className="text-sm border-none outline-none bg-transparent cursor-pointer"
                        >
                          {mathCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons row */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                Shift + Enter for new line
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-omegalab-blue hover:bg-blue-700 text-white"
                  disabled={(message.trim() === "" && uploadedImages.length === 0) || sendMessageMutation.isPending || isUploading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showDrawing && (
        <TldrawPad
          onComplete={handleDrawingComplete}
          onCancel={() => setShowDrawing(false)}
        />
      )}

      {/* Pro Upgrade Modal */}
      {showProUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🚀</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upgrade to OmegaLab Pro</h2>
                  <p className="text-sm text-gray-600">Eligible for a free 7-day trial.</p>
                </div>
              </div>
              <button
                onClick={() => setShowProUpgrade(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Billing Options */}
            <div className="p-6 border-b">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">$20</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="p-6 border-b">
              <button 
                onClick={handleProUpgrade}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <span>🚀</span>
                Try Pro for free
                <span>↗</span>
              </button>
            </div>

            {/* Features */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-lg mr-2">🚀</span>
                <h3 className="text-lg font-semibold text-gray-900">Included in OmegaLab Pro</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs">💬</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Unlimited questions</div>
                    <div className="text-sm text-gray-600">Ask as many questions as you want</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs">⚙️</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Access to Advanced Solver</div>
                    <div className="text-sm text-gray-600">Get detailed step-by-step solutions</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs">📄</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">PDF Uploads</div>
                    <div className="text-sm text-gray-600">Upload and chat about PDF documents</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs">🎯</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Priority support</div>
                    <div className="text-sm text-gray-600">Get help when you need it most</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs">✨</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">...and everything in Free</div>
                    <div className="text-sm text-gray-600">All the features you already love</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}