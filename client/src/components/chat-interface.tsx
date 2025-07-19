import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mic, Image, Pencil, Send, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import MathSymbols from "./math-symbols";
import DrawingPad from "./drawing-pad";
import useSpeechRecognition from "@/hooks/use-speech-recognition";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  isHomePage?: boolean;
  messages: Message[];
  onSendMessage: (message: string, inputMethod: "text" | "voice" | "image" | "drawing") => void;
  onSendImage: (file: File) => void;
  isLoading: boolean;
  messagesLoading: boolean;
}

export default function ChatInterface({
  isHomePage = false,
  messages,
  onSendMessage,
  onSendImage,
  isLoading,
  messagesLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [showDrawing, setShowDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported
  } = useSpeechRecognition();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update input with voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    if (isHomePage) {
      // Navigate to chat page
      setLocation("/chat");
      return;
    }

    onSendMessage(input, "text");
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isHomePage) {
        setLocation("/chat");
        return;
      }
      onSendImage(file);
    }
  };

  const handleDrawingComplete = (drawingData: string) => {
    if (isHomePage) {
      setLocation("/chat");
      return;
    }
    onSendMessage(`[Drawing: ${drawingData}]`, "drawing");
    setShowDrawing(false);
  };

  const insertSymbol = (symbol: string) => {
    setInput(prev => prev + symbol);
  };

  if (showDrawing) {
    return (
      <DrawingPad
        onComplete={handleDrawingComplete}
        onCancel={() => setShowDrawing(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!isHomePage && (
        <Card className="mb-4 h-96">
          <CardContent className="p-4 h-full">
            <ScrollArea className="h-full">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Start a conversation by typing a math problem below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-thetawise-blue text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-xl border border-gray-200 overflow-hidden">
        {isHomePage && (
          <div className="bg-thetawise-dark text-white p-4 text-sm">
            How can I help you today?
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a message... ('\' for math)"
              className="w-full pr-32 text-lg h-12"
              disabled={isLoading}
            />
            
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceToggle}
                className={`p-2 ${isListening ? "text-red-500" : "text-gray-500 hover:text-thetawise-blue"}`}
                title="Voice Input"
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="p-2 text-gray-500 hover:text-thetawise-blue"
                title="Upload Image"
                disabled={isLoading}
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDrawing(true)}
                className="p-2 text-gray-500 hover:text-thetawise-blue"
                title="Draw"
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleSend}
                size="sm"
                className="p-2 bg-thetawise-blue hover:bg-blue-700"
                disabled={isLoading || !input.trim()}
                title="Send"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <MathSymbols onSymbolClick={insertSymbol} />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {isListening && (
            <div className="mt-4 text-center text-sm text-red-500">
              Listening... Click the microphone again to stop
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
