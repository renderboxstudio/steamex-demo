'use client';

import ChatBot from './components/ChatBot';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  location?: string;
  serviceArea?: boolean;
  serviceType?: string;
  complexity?: 'basic' | 'standard' | 'complex';
  urgency?: 'emergency' | 'urgent' | 'standard';
  timeline?: string;
  budget?: string;
  previousQuotes?: number[];
}

export default function HomePage() {
  const handleSendMessage = async (message: string, messages: Message[], context?: ConversationContext) => {
    try {
      // Convert messages to API format
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log('Sending to API:', { message, history, context });

      const response = await axios.post('/api/chat', {
        history,
        context,
      });

      console.log('API Response:', response.data);

      return {
        reply: response.data.reply || 'Sorry, I had trouble processing that request.',
        context: response.data.context,
        showBooking: response.data.showBooking
      };
    } catch (error) {
      console.error('Chat API Error:', error);
      return {
        reply: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              AI Carpet Cleaning Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            Instant, accurate carpet cleaning quotes and booking — powered by AI.
          </p>
        </div>

        {/* Chat Interface */}
        <ChatBot
          className="h-[70vh] min-h-[600px]"
          onSendMessage={handleSendMessage}
          initialMessage={`👋 Hello! I'm your AI carpet cleaning specialist. I can provide instant, accurate quotes for all carpet cleaning services.

To get started, tell me about:
• How many rooms need cleaning
• Any pet odors, stains, or specific concerns
• Your carpet type or condition
• When you need the service (same-day available!)

Let's get you a quote in seconds!`}
        />
      </div>
    </div>
  );
}
