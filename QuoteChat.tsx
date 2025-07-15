"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SendHorizonal, Home, User, Loader2 } from "lucide-react";
import BookingForm from "./app/components/BookingForm";

interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

// Helper function to determine if the booking form should be shown
const shouldShowForm = (msg: Message): boolean => {
  if (msg.role !== "assistant") return false;
  return !!(
    msg.quoted ||
    /estimated quote.*\$[\d,]+/i.test(msg.content)
  );
};


const QuoteChat: React.FC = () => {
  /* ──────────────────────────────── state */
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [roofingQuote, setRoofingQuote] = useState<number | null>(null);

  /* ──────────────────────────────── refs */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 1) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isLoading && !showBookingForm) {
      const isDesktop =
        typeof window !== 'undefined' && window.innerWidth >= 1024
      if (isDesktop) {
        try {
          inputRef.current.focus({ preventScroll: true })
        } catch {
          inputRef.current.focus() // fallback for browsers that don't support preventScroll
        }
      }
    }
  }, [isLoading, showBookingForm])

  /* initial greeting */
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hello! I'm your AI roofing specialist. I can provide instant, accurate quotes for roofing projects. \n\nTo get started, tell me about:\n• Type of roofing work needed (repair, replacement, new installation)\n• Your home's size and roof type\n• Any specific materials or concerns\n\nLet's get you a quote in seconds!",
      },
    ]);
  }, []);

  /* ─────────────────────────────── send handler */
  const handleSend = async () => {
    if (input.trim() === "") return;

    const newUserMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    setShowBookingForm(false);
    setRoofingQuote(null);

    try {
      const filtered = currentMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await axios.post<{
        reply: string;
        quoted?: boolean;
        quote?: number | null;
      }>("/api/chat", { history: filtered });

      const botMsg: Message = {
        role: "assistant",
        content: res.data.reply,
        quoted: res.data.quoted,
        quote: res.data.quote,
      };

      setMessages((m) => [...m, botMsg]);

      if (shouldShowForm(botMsg) && typeof botMsg.quote === "number") {
        setRoofingQuote(botMsg.quote);
        setShowBookingForm(true);
      }
    } catch (e) {
      console.error(e);
      const err =
        "Sorry, I'm having trouble connecting. Please try again later.";
      setError(err);
      setMessages((m) => [...m, { role: "assistant", content: err }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) handleSend();
  };

  const handleBookingSuccess = () => {
    /* Form hides automatically on next user message */
    console.log("Booking successful");
  };

  /* ─────────────────────────────── render */
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="bg-brand-600 p-3 rounded-2xl">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 tracking-tight">
            AI Roofing Assistant
          </h1>
        </div>
        <p className="text-xl text-primary-600 font-medium max-w-2xl mx-auto">
          Get instant, accurate roofing estimates powered by advanced AI technology
        </p>
      </div>

      {/* Chat Container */}
      <div
        className={`flex ${
          showBookingForm
            ? "flex-col xl:flex-row gap-8"
            : "justify-center"
        } transition-all duration-300`}
      >
        {/* Chat Window */}
        <div
          className={`flex flex-col ${
            showBookingForm ? 'xl:w-2/3' : 'max-w-4xl mx-auto'
          } card overflow-hidden transition-all duration-300`}
          style={{ height: '80vh', minHeight: '600px' }}
        >

          {/* Chat Header */}
          <header className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 border-b border-brand-700">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold">
                AI Assistant
              </h3>
              <div className="text-sm bg-brand-800 px-3 py-1 rounded-full">
                Online
              </div>
            </div>
          </header>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-grow p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-primary-50 to-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in duration-500`}
            >
              <div
                className={`message-bubble font-medium text-base leading-relaxed ${
                  msg.role === "user"
                    ? "message-user"
                    : "message-assistant"
                }`}
              >
                <div className="flex items-start gap-3">
                  {msg.role === "assistant" && (
                    <div className="bg-brand-100 p-2 rounded-xl flex-shrink-0">
                      <Home className="w-5 h-5 text-brand-600" />
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="leading-relaxed">{msg.content}</p>
                    {msg.quoted && msg.quote != null && (
                      <div className="mt-4 p-4 bg-accent-50 border border-accent-200 rounded-xl">
                        <p className="text-lg font-bold text-accent-800">
                          💰 Estimated Quote: ${msg.quote.toLocaleString()} USD
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

            {/* Loading Message */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start animate-in fade-in duration-500">
                <div className="message-bubble message-assistant">
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-100 p-2 rounded-xl flex-shrink-0">
                      <Home className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                      <span className="text-primary-600 font-medium">Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 text-center bg-brand-50 text-brand-700 border-t border-brand-200">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-primary-200">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your roofing project for an instant quote..."
                  className="input-field text-lg py-4 px-6 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={isLoading || input.trim() === ""}
                className="btn-primary px-8 py-4 min-h-[60px] text-lg font-semibold"
              >
                {isLoading &&
                messages[messages.length - 1]?.role === "user" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <SendHorizonal className="w-6 h-6" />
                )}
              </Button>
            </div>
            <p className="text-sm text-primary-500 mt-3 text-center">
              Press Enter to send • AI-powered instant quotes
            </p>
          </div>
      </div>

        {/* Booking Form */}
        {showBookingForm && roofingQuote !== null && (
          <div className="xl:w-1/3 xl:min-w-[450px] transition-all duration-500 animate-in slide-in-from-right">
            <BookingForm
              quote={roofingQuote}
              onBookingSuccess={handleBookingSuccess}
              chatHistory={messages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteChat;
