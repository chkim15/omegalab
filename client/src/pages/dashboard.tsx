import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
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
  Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StreamingMessage from "@/components/StreamingMessage";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
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
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<"answer" | "tutor">("tutor");
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{url: string, file: File}[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
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

  // Mock user for now - we'll replace this with real auth later
  const userId = 1;

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", userId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
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

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest("/api/conversations", {
        method: "POST",
        body: { userId, title },
      }),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversationId(newConversation.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      apiRequest("/api/solve", {
        method: "POST",
        body: {
          problem: messageText,
          conversationId: currentConversationId,
          inputMethod: "text",
          mode: selectedMode,
        },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", currentConversationId, "messages"],
      });
      setMessage("");
      // Trigger streaming for the most recent assistant message
      setTimeout(() => {
        setStreamingMessageId(-1); // Use -1 to indicate latest message should stream
      }, 100);
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
    
    toast({
      title: "Image Added",
      description: "Image will be analyzed when you send the message.",
    });
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
    if (!message.trim() && uploadedImages.length === 0) return;

    let finalMessage = message;

    // Process any uploaded images
    if (uploadedImages.length > 0) {
      setIsUploading(true);
      try {
        for (const imageData of uploadedImages) {
          // Convert image to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageData.file);
          });

          // Analyze the image
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          });

          if (response.ok) {
            const data = await response.json();
            finalMessage += (finalMessage ? '\n\n' : '') + `[Image content: ${data.extractedText}]`;
          }
        }

        // Clean up image URLs
        uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
        setUploadedImages([]);
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

    if (!currentConversationId) {
      const title = finalMessage.length > 50 ? finalMessage.substring(0, 50) + "..." : finalMessage;
      createConversationMutation.mutate(title);
      setTimeout(() => {
        if (currentConversationId) {
          sendMessageMutation.mutate(finalMessage);
        }
      }, 100);
    } else {
      sendMessageMutation.mutate(finalMessage);
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
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-omegalab-blue hover:bg-blue-700 text-white"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-4">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button variant="ghost" size="sm" className="flex-1 bg-white dark:bg-gray-600 shadow-sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chats
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              PDFs
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-4">
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
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings & Tutorials
              <Badge variant="secondary" className="ml-2 bg-omegalab-blue text-white">
                1
              </Badge>
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            More free messages in 22 hrs, 28 mins
          </div>
          <div className="mt-1 text-xs text-omegalab-blue">
            📈 Try Pro for free →
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose how you'd like OmegaLab to respond:
            </h1>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">(optional)</div>
          <div className="mt-4 flex space-x-2">
            <Button 
              variant={selectedMode === "answer" ? "default" : "outline"}
              size="sm" 
              className={selectedMode === "answer" 
                ? "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800" 
                : "text-gray-600"
              }
              onClick={() => setSelectedMode("answer")}
            >
              Give me the answer
            </Button>
            <Button
              variant={selectedMode === "tutor" ? "default" : "outline"}
              size="sm"
              className={selectedMode === "tutor" 
                ? "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800"
                : "text-gray-600"
              }
              onClick={() => setSelectedMode("tutor")}
            >
              Tutor me
            </Button>
            <Button variant="ghost" size="sm">
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
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
                          isStreaming={streamingMessageId === -1 && msg.id === Math.max(...messages.filter(m => m.role === "assistant").map(m => m.id))}
                        />
                      ) : (
                        <div className="text-gray-900 dark:text-white">{msg.content}</div>
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
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-black text-white p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            {/* Top toolbar */}
            <div className="flex items-center justify-between mb-4">
              {/* Left: Undo/Redo */}
              <div className="flex items-center space-x-2">
                <Button type="button" variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                  </svg>
                </Button>
              </div>
              
              {/* Right: Input tools */}
              <div className="flex items-center space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-white hover:bg-gray-700 ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={handleSpeechToText}
                  disabled={!recognition}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
                <div className="h-6 w-px bg-gray-600"></div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-white hover:bg-gray-700 ${isUploading ? 'opacity-50' : ''}`}
                  disabled={isUploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="h-6 w-px bg-gray-600"></div>
                <Button type="button" variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-600"></div>
                <Button type="button" variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </Button>
                <div className="h-6 w-px bg-gray-600"></div>
                <Button type="button" variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <MoreHorizontal className="h-4 w-4" />
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
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPaste={handlePaste}
                placeholder={isUploading ? "Processing images..." : "Enter a message... (\\ for math) or paste an image"}
                className="w-full bg-white text-black border-0 rounded-lg px-4 py-3 pr-20 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={sendMessageMutation.isPending || isUploading}
              />
              {isUploading && (
                <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={(!message.trim() && uploadedImages.length === 0) || sendMessageMutation.isPending || isUploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mt-2">
              Shift + Enter for new line
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}