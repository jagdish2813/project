import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  message_type?: string;
}

interface QuickReply {
  text: string;
  action: string;
}

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies: QuickReply[] = [
    { text: "What services do you offer?", action: "services" },
    { text: "How much does it cost?", action: "pricing" },
    { text: "How do I find a designer?", action: "find_designer" },
    { text: "Which cities do you serve?", action: "locations" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user?.id || null,
          session_id: sessionId,
          title: 'Support Chat',
          status: 'active'
        })
        .select()
        .single();

      if (convError) throw convError;
      setConversationId(conversation.id);

      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        message: "Hi! I'm your AI assistant for TheHomeDesigners. I'm here to help you with any questions about our interior design services, finding designers, pricing, or anything else you'd like to know. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        message_type: 'welcome'
      };

      setMessages([welcomeMessage]);

      // Save welcome message to database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          message: welcomeMessage.message,
          sender: 'bot',
          message_type: 'welcome'
        });

    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const findBestAnswer = async (userMessage: string): Promise<string> => {
    try {
      const { data: knowledge, error } = await supabase
        .from('chatbot_knowledge')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      const userMessageLower = userMessage.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;

      for (const item of knowledge) {
        let score = 0;
        
        // Check if question matches
        if (item.question.toLowerCase().includes(userMessageLower) || 
            userMessageLower.includes(item.question.toLowerCase())) {
          score += 10;
        }

        // Check keywords
        for (const keyword of item.keywords) {
          if (userMessageLower.includes(keyword.toLowerCase())) {
            score += 5;
          }
        }

        // Check category match
        if (userMessageLower.includes(item.category.toLowerCase())) {
          score += 3;
        }

        // Add priority bonus
        score += item.priority;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }

      if (bestMatch && highestScore > 5) {
        return bestMatch.answer;
      }

      // Default response if no good match found
      return "I'd be happy to help you with that! For specific questions about our interior design services, pricing, or to connect with our team, you can:\n\n• Browse our designer profiles\n• Register your project to get matched with designers\n• Contact our support team at info@thehomedesigners.com or +91 98765 43210\n\nIs there anything specific about our services you'd like to know more about?";

    } catch (error) {
      console.error('Error finding answer:', error);
      return "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again in a moment, or contact our support team directly at info@thehomedesigners.com for immediate assistance.";
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || !conversationId) return;

    setIsLoading(true);
    setInputMessage('');

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      message: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          message: textToSend,
          sender: 'user'
        });

      // Get AI response
      const botResponse = await findBestAnswer(textToSend);

      // Add bot message
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        message: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message to database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          message: botResponse,
          sender: 'bot'
        });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        message: "I'm sorry, I encountered an error. Please try again or contact our support team.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    handleSendMessage(reply.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
        aria-label="Open chat support"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI Support</h3>
            <p className="text-xs text-primary-100">Online now</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;