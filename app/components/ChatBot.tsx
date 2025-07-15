'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, RotateCcw, Calendar } from 'lucide-react'
import ConsultationBooking from './ConsultationBooking'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ConversationContext {
  location?: string
  serviceArea?: boolean
  roofType?: string
  sqft?: number
  timeline?: string
  budget?: string
  previousQuotes?: number[]
}

interface ChatBotProps {
  onSendMessage?: (message: string, messages: Message[], context?: ConversationContext) => Promise<{reply: string, context?: ConversationContext, showBooking?: boolean}>
  initialMessage?: string
  placeholder?: string
  className?: string
}

const STORAGE_KEY = 'roofing-chat-data'

export default function ChatBot({
  onSendMessage,
  initialMessage = "Hello! I'm your AI roofing assistant. I can help you get an instant quote for your roofing project. Tell me about your roof - what type of work do you need, the size of your home, and any specific concerns you have!",
  placeholder = "Describe your roofing project for an instant quote...",
  className = ""
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [context, setContext] = useState<ConversationContext>({})
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  
  // Debug: Log showBooking state changes
  useEffect(() => {
    console.log('ChatBot: showBooking state changed to:', showBooking);
  }, [showBooking])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { messages: storedMessages, context: storedContext } = JSON.parse(stored)
        if (storedMessages?.length > 0) {
          setMessages(storedMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
          setContext(storedContext || {})
          return
        }
      }
    } catch (error) {
      console.warn('Failed to load chat data from localStorage:', error)
    }
    
    // Default initial message if no stored data
    setMessages([{
      id: '1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    }])
  }, [initialMessage])

  // Save to localStorage whenever messages or context change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, context }))
      } catch (error) {
        console.warn('Failed to save chat data to localStorage:', error)
      }
    }
  }, [messages, context])

  const clearChat = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }])
      setContext({})
      setShowBooking(false)
    } catch (error) {
      console.warn('Failed to clear chat data:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      if (!onSendMessage) {
        throw new Error('No message handler provided')
      }
      
      const result = await onSendMessage(userMessage.content, newMessages, context)
      const response = typeof result === 'string' ? result : result.reply

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update context if provided
      if (typeof result === 'object' && result.context) {
        setContext(result.context)
      }

      // Show booking modal if triggered
      console.log('ChatBot: Checking showBooking flag:', {
        resultType: typeof result,
        showBooking: typeof result === 'object' ? result.showBooking : 'N/A',
        fullResult: result
      });
      
      if (typeof result === 'object' && result.showBooking) {
        console.log('ChatBot: Setting showBooking to true');
        setShowBooking(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : "An error occurred while processing your request.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`flex flex-col gap-4 transition-all duration-500 ${className}`}>
      {/* Chatbot */}
      <div className={`flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-500 w-full`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Roofing Assistant</h3>
              <p className="text-blue-100 text-sm">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBooking(true)}
              className="text-white hover:text-blue-100 transition-colors p-1 rounded"
              title="Test booking form"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={clearChat}
              className="text-white hover:text-blue-100 transition-colors p-1 rounded"
              title="Clear chat"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white min-h-[400px] max-h-[600px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {message.role === 'assistant' && (
                  <div className="bg-blue-100 p-2 rounded-xl flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {/* Show booking button if consultation is mentioned and form isn't already open */}
                  {message.role === 'assistant' && 
                   !showBooking && 
                   /\b(consultation|appointment|book|schedule|visit|meet)\b/i.test(message.content) && (
                    <button
                      onClick={() => setShowBooking(true)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Consultation
                    </button>
                  )}
                  
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Message */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm bg-white text-gray-900 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-xl flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Analyzing your request...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • AI-powered instant quotes
        </p>
      </div>
      </div>

      {/* Booking Form */}
      {showBooking && (
        <div className="w-full animate-in slide-in-from-top duration-500">
          <ConsultationBooking
            isOpen={true}
            onClose={() => setShowBooking(false)}
            customerContext={{
              location: context.location,
              roofType: context.roofType,
              sqft: context.sqft,
              quote: context.previousQuotes?.[context.previousQuotes.length - 1]
            }}
            standalone={true}
          />
        </div>
      )}
    </div>
  )
}