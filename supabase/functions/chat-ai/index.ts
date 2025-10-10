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
    } 
  /*  else if (userMessage.includes('designer') || userMessage.includes('find')) {
      response = "I can help you find the perfect interior designer! We have verified designers specializing in residential, commercial, and luxury projects. What type of space are you looking to design?"
    }*/
    else if (userMessage.includes('material') || userMessage.includes('furniture')) {
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