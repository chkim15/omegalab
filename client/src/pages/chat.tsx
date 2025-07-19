import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import ChatInterface from "@/components/chat-interface";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Conversation } from "@shared/schema";

export default function Chat() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(
    id ? parseInt(id) : null
  );

  // Mock user for now - in a real app this would come from auth
  const mockUserId = 1;

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${mockUserId}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    },
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const response = await fetch(`/api/conversations/${currentConversationId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<Message[]>;
    },
    enabled: !!currentConversationId,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", {
        userId: mockUserId,
        title,
      });
      return response.json() as Promise<Conversation>;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversationId(conversation.id);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      problem,
      inputMethod,
    }: {
      problem: string;
      inputMethod: "text" | "voice" | "image" | "drawing";
    }) => {
      let conversationId = currentConversationId;
      
      // Create new conversation if none exists
      if (!conversationId) {
        const newConversation = await createConversationMutation.mutateAsync(
          problem.substring(0, 50) + "..."
        );
        conversationId = newConversation.id;
      }

      const response = await apiRequest("POST", "/api/solve", {
        problem,
        conversationId,
        inputMethod,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", currentConversationId, "messages"],
      });
    },
  });

  // Send image
  const sendImageMutation = useMutation({
    mutationFn: async (file: File) => {
      let conversationId = currentConversationId;
      
      // Create new conversation if none exists
      if (!conversationId) {
        const newConversation = await createConversationMutation.mutateAsync(
          "Image math problem"
        );
        conversationId = newConversation.id;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("conversationId", conversationId.toString());

      const response = await fetch("/api/solve-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to solve image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", currentConversationId, "messages"],
      });
    },
  });

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0 && !currentConversationId) {
      // Don't create a conversation automatically - wait for user to send first message
    }
  }, [conversations, currentConversationId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 px-4">
        <ChatInterface
          messages={messages}
          onSendMessage={(problem, inputMethod) =>
            sendMessageMutation.mutate({ problem, inputMethod })
          }
          onSendImage={(file) => sendImageMutation.mutate(file)}
          isLoading={sendMessageMutation.isPending || sendImageMutation.isPending}
          messagesLoading={messagesLoading}
        />
      </div>
    </div>
  );
}
