"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquareIcon, 
  SendIcon, 
  XIcon, 
  BotIcon, 
  UserIcon, 
  SparklesIcon,
  Loader2Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatAssistantBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy **ClaimsAI**, tu asistente de auditoría. ¿En qué puedo ayudarte hoy? Puedo darte resúmenes de reclamos, detalles de reclamos específicos, o listar tus sedes y categorías."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to history
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error en el servidor");
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: `⚠️ **Error:** ${error.message || "No pude procesar tu solicitud en este momento. Por favor inténtalo de nuevo."}` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render text containing simple markdown (bold, lists, code blocks)
  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      // Bold text formatting
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      // We will parse bold markdown recursively or in parts
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Check if it's a list item
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-sm mt-1 leading-relaxed">
            {parts.length > 0 ? parts : line.substring(2)}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-sm min-h-4 leading-relaxed mt-1 first:mt-0">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Chat Window Panel */}
      <div 
        className={`mb-4 w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl border border-border/40 bg-card shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SparklesIcon className="size-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">ClaimsAI</h3>
              <p className="text-[10px] text-muted-foreground">Asistente Virtual de Auditoría</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 rounded-lg hover:bg-muted cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar chat"
          >
            <XIcon className="size-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
          {messages.map((msg, index) => {
            const isAI = msg.role === "assistant";
            return (
              <div 
                key={index} 
                className={`flex gap-2 max-w-[85%] ${
                  isAI ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                {/* Avatar Icon */}
                <div 
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    isAI 
                      ? "bg-primary/15 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isAI ? <BotIcon className="size-4" /> : <UserIcon className="size-4" />}
                </div>

                {/* Message Bubble */}
                <div 
                  className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                    isAI 
                      ? "bg-muted/40 text-foreground rounded-tl-sm border border-border/20" 
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                >
                  <div className="space-y-1">
                    {isAI ? renderMessageContent(msg.content) : msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-2 max-w-[85%] self-start">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <BotIcon className="size-4" />
              </div>
              <div className="flex items-center gap-1 bg-muted/40 text-muted-foreground px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-border/20">
                <Loader2Icon className="size-3.5 animate-spin" />
                <span className="text-xs">Buscando datos...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-border/40 bg-card rounded-b-2xl flex gap-2">
          <input
            type="text"
            placeholder="Pregúntame algo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-muted/50 border border-border/50 text-foreground px-3 py-1.5 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="size-8 rounded-xl shrink-0 cursor-pointer"
            aria-label="Enviar mensaje"
          >
            <SendIcon className="size-3.5" />
          </Button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <Button 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className={`size-12 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen ? "rotate-90 bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
        }`}
        aria-label="Asistente de IA"
      >
        {isOpen ? <XIcon className="size-6" /> : <MessageSquareIcon className="size-6" />}
      </Button>
    </div>
  );
}
