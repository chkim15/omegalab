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
  MoreHorizontal
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!currentConversationId) {
      // Create new conversation first
      const title = message.length > 50 ? message.substring(0, 50) + "..." : message;
      createConversationMutation.mutate(title);
      // The message will be sent after conversation is created
      setTimeout(() => {
        if (currentConversationId) {
          sendMessageMutation.mutate(message);
        }
      }, 100);
    } else {
      sendMessageMutation.mutate(message);
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
                          <span className="font-medium text-gray-700 dark:text-gray-300">Thetawise</span>
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
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
              <Button type="button" variant="ghost" size="sm" className="shrink-0">
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="shrink-0">
                <Image className="h-4 w-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message... (\\ for math)"
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 bg-omegalab-blue hover:bg-blue-700"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Shift + Enter for new line
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}