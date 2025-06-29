import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ChatRequest {
  message: string;
  conversation_id: string;
  user_id?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { message, conversation_id, user_id } = await req.json() as ChatRequest;

    if (!message || !conversation_id) {
      throw new Error("Missing required fields: message and conversation_id");
    }

    // Save user message to database
    await supabase
      .from('chat_messages')
      .insert({
        conversation_id,
        message,
        sender: 'user',
      });

    // Fetch relevant knowledge from the database
    const { data: knowledgeData } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // Find best matching knowledge entry
    let bestMatch = null;
    let highestScore = 0;
    const messageLower = message.toLowerCase();

    if (knowledgeData) {
      for (const item of knowledgeData) {
        let score = 0;
        
        // Check if question matches
        if (item.question.toLowerCase().includes(messageLower) || 
            messageLower.includes(item.question.toLowerCase())) {
          score += 10;
        }

        // Check keywords
        for (const keyword of item.keywords) {
          if (messageLower.includes(keyword.toLowerCase())) {
            score += 5;
          }
        }

        // Check category match
        if (messageLower.includes(item.category.toLowerCase())) {
          score += 3;
        }

        // Add priority bonus
        score += item.priority;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }
    }

    // Generate response
    let botResponse;
    if (bestMatch && highestScore > 5) {
      botResponse = bestMatch.answer;
    } else {
      // Default response if no good match found
      botResponse = "I'd be happy to help you with that! For specific questions about our interior design services, pricing, or to connect with our team, you can:\n\n• Browse our designer profiles\n• Register your project to get matched with designers\n• Contact our support team at info@thehomedesigners.com or +91 98765 43210\n\nIs there anything specific about our services you'd like to know more about?";
    }

    // Save bot response to database
    await supabase
      .from('chat_messages')
      .insert({
        conversation_id,
        message: botResponse,
        sender: 'bot'
      });

    // Return response
    return new Response(
      JSON.stringify({ 
        message: botResponse,
        success: true 
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing chat request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500,
      }
    );
  }
});