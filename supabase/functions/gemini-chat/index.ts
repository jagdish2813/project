import { createClient } from 'npm:@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.15.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  prompt: {
    message: string
    conversationId?: string
    sessionId?: string
  }
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
    const requestBody: ChatRequest = await req.json()
    console.log('Received request:', requestBody)

    const { message, conversationId, sessionId } = requestBody.prompt || {}

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required in prompt object' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Gemini API Key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('API Key available:', !!apiKey)

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get conversation history for context
    let conversationHistory = ''
    if (conversationId) {
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('message, sender')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(10) // Last 10 messages for context

        if (!messagesError && messages) {
          conversationHistory = messages
            .map(msg => `${msg.sender}: ${msg.message}`)
            .join('\n')
        }
      } catch (error) {
        console.log('Could not fetch conversation history:', error)
      }
    }

    // Get knowledge base for context
    let knowledgeContext = ''
    try {
      const { data: knowledgeBase, error: kbError } = await supabase
        .from('chatbot_knowledge')
        .select('question, answer, category')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(20)

      if (!kbError && knowledgeBase) {
        knowledgeContext = knowledgeBase
          .map(item => `Q: ${item.question}\nA: ${item.answer}\nCategory: ${item.category}`)
          .join('\n\n')
      }
    } catch (error) {
      console.log('Could not fetch knowledge base:', error)
    }

    // Create comprehensive prompt with context
    const systemPrompt = `You are an AI assistant for TheHomeDesigners, a premium interior design platform in India. You help customers find designers, understand services, and answer questions about interior design.

IMPORTANT GUIDELINES:
- Be helpful, friendly, and professional
- Focus on interior design, home decoration, and our platform services
- Provide specific information about Indian interior design trends and materials
- If asked about pricing, mention that costs vary by location, materials, and scope
- Encourage users to connect with our verified designers for personalized quotes
- Keep responses concise but informative
- Use Indian context (₹ for currency, Indian cities, local materials)

KNOWLEDGE BASE:
${knowledgeContext}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n` : ''}

Current user message: ${message}

Please provide a helpful response about interior design or our platform services.`

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    })

    console.log('Calling Gemini API...')

    // Generate response
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const generatedText = response.text()

    console.log('Gemini response received:', !!generatedText)

    if (!generatedText) {
      throw new Error('No response generated from Gemini')
    }

    // Store conversation if sessionId provided
    let conversationRecord = null
    if (sessionId) {
      try {
        // Check if conversation exists
        const { data: existingConv } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle()

        if (existingConv) {
          conversationRecord = existingConv
        } else {
          // Create new conversation
          const { data: newConv, error: convError } = await supabase
            .from('chat_conversations')
            .insert({
              session_id: sessionId,
              title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
              status: 'active'
            })
            .select()
            .single()
          
          if (convError) {
            console.error('Error creating conversation:', convError)
          } else {
            conversationRecord = newConv
          }
        }

        // Store user message
        if (conversationRecord) {
          await supabase
            .from('chat_messages')
            .insert({
              conversation_id: conversationRecord.id,
              message: message,
              sender: 'user',
              message_type: 'text'
            })

          // Store assistant response
          await supabase
            .from('chat_messages')
            .insert({
              conversation_id: conversationRecord.id,
              message: generatedText,
              sender: 'bot',
              message_type: 'text'
            })
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue even if database operations fail
      }
    }

    return new Response(
      JSON.stringify({
        response: generatedText,
        conversationId: conversationRecord?.id,
        sessionId: sessionId || crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in gemini-chat function:', error)
    
    // Provide a fallback response instead of just an error
    const fallbackResponse = "I'm sorry, I'm having trouble connecting to our AI service right now. However, I can still help you! Here are some quick answers:\n\n• Our designers specialize in residential, commercial, and luxury projects\n• Project costs typically range from ₹1,200 to ₹3,000 per sq ft\n• We serve major cities across India\n• You can browse our designer profiles and completed projects\n\nFor immediate assistance, please contact our support team or browse our designer profiles."
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        error: `AI service temporarily unavailable: ${error.message}`,
        fallback: true
      }),
      { 
        status: 200, // Return 200 with fallback instead of 500 error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})