import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, 
  Sparkles, Settings, HelpCircle, Mic, Volume2
} from 'lucide-react';
// ASSUMPTION: You have a centralized supabase client import
import { supabase } from '../lib/supabase'; 
// ASSUMPTION: You have a simple hook for user authentication state
import { useAuth } from '../hooks/useAuth'; 

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  message: string
  sender: 'user' | 'assistant'
  timestamp: string
}

interface ChatRequest {
  message: string
  conversationId?: string
  sessionId?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { message, conversationId, sessionId }: ChatRequest = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get knowledge base for context
    const { data: knowledgeBase } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    // Simple keyword matching for responses
    const userMessage = message.toLowerCase()
    let response = "I'm here to help you with interior design questions! Could you please provide more details about what you're looking for?"

    // Check knowledge base for relevant responses
    if (knowledgeBase) {
      for (const item of knowledgeBase) {
        const keywords = item.keywords || []
        const hasKeyword = keywords.some((keyword: string) => 
          userMessage.includes(keyword.toLowerCase())
        )
        
        if (hasKeyword || userMessage.includes(item.question.toLowerCase())) {
          response = item.answer
          break
        }
      }
    }

    // Handle specific design-related queries
    if (userMessage.includes('cost') || userMessage.includes('price') || userMessage.includes('budget')) {
      response = "Interior design costs vary based on project scope, room size, and material choices. Typically, residential projects range from ₹1,200 to ₹3,000 per square foot. Would you like me to connect you with a designer for a detailed quote?"
    } else if (userMessage.includes('designer') || userMessage.includes('find')) {
      response = "I can help you find the perfect interior designer! We have verified designers specializing in residential, commercial, and luxury projects. What type of space are you looking to design?"
    } else if (userMessage.includes('material') || userMessage.includes('furniture')) {
      response = "We work with a wide range of materials and furniture options. Our designers can help you choose the best materials based on your budget, style preferences, and durability requirements. Would you like to explore our material catalog?"
    } else if (userMessage.includes('timeline') || userMessage.includes('time')) {
      response = "Project timelines depend on scope and complexity. Typically: Room design (2-4 weeks), Full home design (6-12 weeks), Commercial projects (8-16 weeks). This includes planning, procurement, and execution phases."
    }

    // Store conversation if sessionId provided
    let conversationRecord = null
    if (sessionId) {
      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (existingConv) {
        conversationRecord = existingConv
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({
            session_id: sessionId,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            status: 'active'
          })
          .select()
          .single()
        
        conversationRecord = newConv
      }

      // Store user message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationRecord?.id,
          message: message,
          sender: 'user',
          message_type: 'text'
        })

      // Store assistant response
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationRecord?.id,
          message: response,
          sender: 'assistant',
          message_type: 'text'
        })
    }

    return new Response(
      JSON.stringify({
        response,
        conversationId: conversationRecord?.id,
        sessionId: sessionId || crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in chat-ai function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
  /**
   * Queries the static knowledge base (Supabase) for specific, reliable answers.
   */
  const getKnowledgeBaseResponse = async (text: string, action: string | null): Promise<string | null> => {
    const queryText = text.toLowerCase();
    
    try {
      // 1. Prioritize Quick Reply Action Match
      if (action) {
         const actionSearch = action.replace(/_/g, ' '); 
         
         const { data, error } = await supabase
           .from('chatbot_knowledge')
           .select('answer')
           .or(`category.eq.${action},question.ilike.%${actionSearch}%`) 
           .eq('is_active', true)
           .order('priority', { ascending: false }) 
           .limit(1);

         if (error) throw error;
         if (data && data.length > 0) {
           return data[0].answer;
         }
      }
      
      // 2. Fallback: General Keyword Search with Filtering
      const stopWords = new Set(['what', 'how', 'when', 'the', 'and', 'design', 'about', 'services', 'find', 'right', 'can', 'i', 'a', 'do', 'you', 'project', 'help', 'me', 'with', 'is', 'it']);
      
      const importantKeywords = queryText
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));
      
      if (importantKeywords.length > 0) {
        // Construct a partial text match condition
        const searchConditions = importantKeywords.map(kw => `question.ilike.%${kw}%`).join(',');

        const { data, error } = await supabase
          .from('chatbot_knowledge')
          .select('answer')
          .or(searchConditions) 
          .eq('is_active', true)
          .order('priority', { ascending: false }) 
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          return data[0].answer;
        }
      }

      return null; 
    } catch (error) {
      console.error('Error fetching knowledge base response:', error);
      return null;
    }
  };
  
  /**
   * VOICE: Handles the bot reading the message aloud (Text-to-Speech)
   */
  const textToSpeech = (text: string) => {
    if (!synthRef.current || !isOpen || isListening) return;
    synthRef.current.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synthRef.current.speak(utterance);
  };
  
  /**
   * VOICE: Handles starting/stopping voice input (Speech-to-Text)
   */
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setInputMessage('Listening...');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInputMessage('');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInputMessage('');
      };
    }
    
    recognitionRef.current.start();
  };

  /**
   * CORE: Main handler for sending messages.
   */
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || !conversationId) return;
    
    synthRef.current?.cancel();

    const allQuickReplies = [...quickReplies, ...Object.values(suggestedFollowUps).flat()];
    const matchingQuickReply = allQuickReplies.find(qr => qr.text === textToSend);
    const action = matchingQuickReply?.action || null;
    
    setLastAction(action || null);

    setIsLoading(true);
    setInputMessage('');

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

      let botResponse: string;
      
      // 1. Try Knowledge Base first (for specific, reliable answers)
      let knowledgeResponse = await getKnowledgeBaseResponse(textToSend, action);
      
      if (knowledgeResponse) {
        botResponse = knowledgeResponse;
      } 
      // 2. Fallback to AI Service (Supabase Edge Function)
      else if (isAIEnabled) {
        try {
          // --- AI SERVICE CALL (Supabase Edge Function) ---
          const apiUrl = 'https://aqcvftydzrsvahiuurts.supabase.co/functions/v1/chat-ai';

          // Get the current session token for Supabase Authorization
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;

          // The Edge Function provided appears to handle context/history based on IDs.
          const payload = {
              message: textToSend, // Current message text
              conversationId: conversationId, // Send existing conversation ID
              sessionId: sessionId, // Send current session ID
          };
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };

          // Add authorization header if a token exists
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // Use the resilient fetchWithRetry function
          const result = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
          });

          // The Edge Function is expected to return the generated text under the 'response' key.
          const text = result?.response;
          
          if (text) {
            botResponse = text;
          } else {
            // Handle case where API is reachable but returns no text content
            console.error("AI function returned an empty or malformed text response.", result);
            throw new Error('AI service returned an empty response.');
          }
          // --- END AI SERVICE CALL ---

        } catch (aiError) {
          // Specific fallback for AI service failure (due to custom function error)
          console.error('AI service failure:', aiError); 
          botResponse = "I'm sorry, there was a problem connecting to our AI service through the design function. Please try again or switch to basic support.";
        }
      } 
      // 3. Final Basic Fallback
      else {
        botResponse = "Thank you for your message. Our team will review it and get back to you soon.";
      }

      // Add bot message
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        message: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // VOICE: Read the response aloud
      textToSpeech(botResponse);

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
        message: "I'm sorry, I encountered a critical error. Please refresh or contact support.",
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
  
  const stopSpeech = () => {
      synthRef.current?.cancel();
  }

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
              Online
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
          <div 
            className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50"
            onClick={stopSpeech} 
          >
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
                    {/* VOICE: Button to replay the audio */}
                    {message.sender === 'bot' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); textToSpeech(message.message); }}
                            className="mt-2 text-primary-500 hover:text-primary-600 p-1 rounded-full bg-white/50"
                            title="Listen again"
                        >
                            <Volume2 className="w-3 h-3" />
                        </button>
                    )}
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

        {/* Input Field with Voice Option */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2 items-center">
             {/* VOICE: Microphone Button */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors shadow-sm flex-shrink-0 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop voice input" : "Start voice input"}
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : (isAIEnabled ? "Ask me anything about design..." : "Type your message...")}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
              aria-label="Chat message"
              autoComplete="off"
              disabled={isLoading || isListening}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading || isListening}
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
