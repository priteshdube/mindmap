"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Trash2, Brain, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!initialized && user) {
      setMessages([
        {
          role: "assistant",
          content: `Hi ${user.firstName || "there"}. I'm MindPath. This is a calm space to think things through together. How are you feeling today?`,
        },
      ]);
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.reply || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.reply) {
        throw new Error("No response from assistant");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Chat error:", errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage.includes("HTTP")
            ? "I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please call or text 988."
            : errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Fresh start. I'm here whenever you want to continue, ${user?.firstName || "friend"}.`,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] md:h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-text font-semibold">MindPath AI</h1>
            <p className="text-xs text-muted">Guided support chat</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-muted hover:text-text p-2 rounded-lg hover:bg-surface-2 transition-all duration-200"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Brain className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-surface border border-border text-text rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center mr-2 mt-1 shrink-0">
              <Brain className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted bg-surface rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <p>
            MindPath is not a substitute for professional mental health care. In
            crisis? Call or text{" "}
            <span className="text-accent-2 font-semibold">988</span>.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 bg-surface-2 border border-border rounded-xl p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-transparent border-none text-text placeholder:text-muted focus:outline-none resize-none text-sm px-2 py-1 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg p-2.5 text-white transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
