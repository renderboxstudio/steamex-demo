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
  roofType?: string;
  sqft?: number;
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 1v4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 1v4"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              AI Roofing Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            Plug and play instant, accurate roofing estimate, and booking agent.
          </p>
        </div>

        {/* Chat Interface */}
        <ChatBot
          className="h-[70vh] min-h-[600px]"
          onSendMessage={handleSendMessage}
          initialMessage={`👋 Hello! I'm your AI roofing specialist. I can provide instant, accurate quotes for roofing projects.

To get started, tell me about:
• Type of roofing work needed (repair, replacement, new installation)
• Your home's size and roof type
• Any specific materials or concerns

Let's get you a quote in seconds!`}
        />
      </div>
    </div>
  );
}
