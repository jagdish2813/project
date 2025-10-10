import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Sparkles, Settings, HelpCircle, RefreshCw } from 'lucide-react';
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
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced quick replies with more relevant options
  const quickReplies: QuickReply[] = [
    { text: "What interior design services do you offer?", action: "services" },
    { text: "How do I find the right designer?", action: "find_designer" }
  ];

  // Additional suggested questions based on context
  const suggestedFollowUps: Record<string, QuickReply[]> = {
    services: [
      { text: "Do you offer 3D visualization?", action: "3d_visualization" },
      { text: "Can I get partial room design?", action: "partial_design" },
    ],
    pricing: [
      { text: "Are there any ongoing offers?", action: "offers" },
      { text: "What payment methods do you accept?", action: "payment" },
    ],
    find_designer: [
      { text: "How are designers verified?", action: "verification" },
      { text: "Can I see designer reviews?", action: "reviews" },
    ],
    process: [
      { text: "How long does a project take?", action: "timeline" },
      { text: "What if I'm not satisfied?", action: "satisfaction" },
    ]
  };

  // Track the last action to show relevant follow-ups
  const [lastAction, setLastAction] = useState<string | null>(null);

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
        message: "👋 Hi! I'm your AI design assistant for TheHomeDesigners. I can help you with finding the perfect designer, understanding our services, pricing information, or answering any questions about interior design. How can I assist you today?",
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

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || !conversationId) return;
    
    // Extract action from quick replies if this is a predefined message
    const matchingQuickReply = quickReplies.find(qr => qr.text === textToSend);
    const action = matchingQuickReply?.action || null;
    if (action) {
      setLastAction(action);
    }

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
          sender: 'user',
          message_type: 'text'
        });

      let botResponse;
      
      if (isAIEnabled) {
        try {
          // Call the AI edge function
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              message: textToSend,
              conversation_id: conversationId,
              user_id: user?.id
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            if (data.response) {
              botResponse = data.response;
            } else {
              throw new Error('No response received from AI service');
            }
          } else {
            throw new Error(data.error || `AI service error: ${response.status} ${response.statusText}`);
          }
        } catch (aiError) {
          console.error('Error calling AI service:', aiError);
          // Fallback to basic response if AI fails
          botResponse = "I'm sorry, I'm having trouble connecting to our AI service right now. Please try again in a moment, or contact our support team directly at info@thehomedesigners.com for immediate assistance.";
        }
      } else {
        // Basic response when AI is disabled
        botResponse = "Thank you for your message. Our team will review it and get back to you soon. For immediate assistance, please contact our support team at info@thehomedesigners.com or +91 98765 43210.";
      }

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
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          aria-label="Open chat support"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 overflow-hidden ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bot className="w-5 h-5 absolute" style={{ opacity: isAIEnabled ? 1 : 0, transition: 'opacity 0.3s' }} />
            <User className="w-5 h-5 absolute" style={{ opacity: isAIEnabled ? 0 : 1, transition: 'opacity 0.3s' }} />
            {isAIEnabled && <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />}
          </div>
          <div>
            <h3 className="font-semibold">{isAIEnabled ? 'AI Design Assistant' : 'Support Chat'}</h3>
            <p className="text-xs text-primary-100 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
              Online now
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAIEnabled(!isAIEnabled)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isAIEnabled ? "Switch to basic support" : "Enable AI assistant"}
          >
            <Settings className="w-4 h-4" />
          </button>
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
    {/* Chat body: messages + quick replies */}
    <div className="flex flex-col flex-grow h-[calc(24rem-112px)] overflow-hidden">
      {/* Scrollable messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
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
              <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested replies */}
      {(messages.length <= 1 || (lastAction && suggestedFollowUps[lastAction])) && (
        <div className="px-4 py-2 bg-white border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            {messages.length <= 1 && (
              <>
                <p className="text-xs text-gray-500 mb-1 flex items-center">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Suggested questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors flex items-center"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </>
            )}

            {lastAction && suggestedFollowUps[lastAction] && (
              <>
                <p className="text-xs text-gray-500 mt-2 mb-1 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  People also ask:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedFollowUps[lastAction].map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-accent-50 text-accent-700 px-3 py-1 rounded-full hover:bg-accent-100 transition-colors"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Input Field (always visible) */}
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex space-x-2 items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isAIEnabled ? "Ask me anything about interior design..." : "Type your message..."}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
          aria-label="Chat message"
          autoComplete="off"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors shadow-sm flex-shrink-0"
          aria-label="Send message"
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