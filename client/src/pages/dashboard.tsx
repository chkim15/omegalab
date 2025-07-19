import { useState, useEffect } from "react";
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
import DrawingPad from "@/components/drawing-pad";
import { useAuth } from "@/contexts/AuthContext";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser, logout } = useAuth();

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

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMessage(messageHistory[newIndex]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < messageHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMessage(messageHistory[newIndex]);
    }
  };

  // Drawing completion handler
  const handleDrawingComplete = (mathNotation: string) => {
    // Add the extracted math notation to the current message
    const currentText = message.trim();
    const newText = currentText ? `${currentText} ${mathNotation}` : mathNotation;
    updateMessageHistory(newText);
    
    setShowDrawing(false);
    
    toast({
      title: "Drawing Converted",
      description: "Math notation extracted from your drawing!",
    });
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

  const saveSettings = () => {
    localStorage.setItem('defaultResponseMode', defaultMode);
    localStorage.setItem('theme', theme);
    setSelectedMode(defaultMode);
    setIsSettingsOpen(false);
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
    mutationFn: (messageData: { problem: string; mode: string; images?: any[] }) =>
      apiRequest("/api/solve", {
        method: "POST",
        body: {
          problem: messageData.problem,
          conversationId: currentConversationId,
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
      const title = messageContent.length > 50 ? messageContent.substring(0, 50) + "..." : messageContent || "Math Problem";
      createConversationMutation.mutate(title);
      setTimeout(() => {
        if (currentConversationId) {
          sendMessageMutation.mutate({ 
            problem: messageContent, 
            mode: selectedMode,
            images: imageData.length > 0 ? imageData : undefined
          });
        }
      }, 100);
    } else {
      sendMessageMutation.mutate({ 
        problem: messageContent, 
        mode: selectedMode,
        images: imageData.length > 0 ? imageData : undefined
      });
    }

    // Clear input and images after sending
    setMessage("");
    uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
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
        <ScrollArea className="flex-1 px-4 pt-4">
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
            📈 Try Pro for free →
          </div>
        </div>

        {/* User Profile Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-white">
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
                        <Button variant="link" className="text-omegalab-blue p-0 h-auto text-sm">
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
        <ScrollArea className="flex-1 p-4">
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
                          isStreaming={streamingMessageId === -1 && msg.id === Math.max(...messages.filter(m => m.role === "assistant").map(m => m.id))}
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
                          <div className="whitespace-pre-wrap">
                            {msg.content}
                          </div>
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
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
            {/* Top toolbar */}
            <div className="flex items-center justify-between mb-4">
              {/* Left: Undo/Redo */}
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-gray-600 hover:bg-gray-100 ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`text-gray-600 hover:bg-gray-100 ${historyIndex >= messageHistory.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleRedo}
                  disabled={historyIndex >= messageHistory.length - 1}
                  title="Redo"
                >
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
                <div className="h-6 w-px bg-gray-300"></div>
                <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100" onClick={() => setShowDrawing(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
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
                onChange={(e) => updateMessageHistory(e.target.value)}
                onPaste={handlePaste}
                placeholder={isUploading ? "Processing images..." : "Enter a message... (\\ for math) or paste an image"}
                className="w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-3 pr-48 focus-visible:ring-2 focus-visible:ring-omegalab-blue focus-visible:ring-offset-0"
                disabled={sendMessageMutation.isPending || isUploading}
              />
              {isUploading && (
                <div className="absolute right-48 top-1/2 transform -translate-y-1/2">
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
                  className="bg-omegalab-blue hover:bg-blue-700 text-white"
                  disabled={(message.trim() === "" && uploadedImages.length === 0) || sendMessageMutation.isPending || isUploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
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
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Shift + Enter for new line
            </div>
          </form>
        </div>
      </div>
      {showDrawing && (
        <DrawingPad onComplete={handleDrawingComplete} onCancel={() => setShowDrawing(false)} />
      )}
    </div>
  );
}