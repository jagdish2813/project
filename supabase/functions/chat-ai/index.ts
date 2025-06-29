import { createClient } from "npm:@supabase/supabase-js@2.39.0";

// Define CORS headers for cross-origin requests
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

// Sample design-specific responses for common queries
const designResponses = {
  styles: "We offer a wide range of interior design styles including Modern, Contemporary, Traditional Indian, Minimalist, Industrial, Scandinavian, and more. Our designers specialize in different aesthetics to match your preferences.",
  process: "Our design process typically includes: 1) Initial consultation, 2) Requirement gathering, 3) Concept development, 4) Design presentation, 5) Revisions, 6) Final design approval, 7) Execution and installation, and 8) Final handover.",
  timeline: "Project timelines vary based on scope. Typically, a single room design takes 2-4 weeks, while a full home interior can take 2-6 months from concept to completion.",
  materials: "We work with premium materials including Italian marble, engineered wood, teak, oak, quartz countertops, and more. Our designers can help you select materials that fit your budget and lifestyle needs.",
  budget: "Our design services start from ₹50,000 for a single room. Full home interiors typically range from ₹5-50 lakhs depending on size, materials, and complexity. We can work with you to create a design that fits your budget.",
};

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
    
    // Check for design-specific keywords to provide more accurate responses
    const messageLower = message.toLowerCase();
    let specializedResponse = null;
    
    if (messageLower.includes("style") || messageLower.includes("design style") || messageLower.includes("aesthetic")) {
      specializedResponse = designResponses.styles;
    } else if (messageLower.includes("process") || messageLower.includes("how does it work") || messageLower.includes("steps")) {
      specializedResponse = designResponses.process;
    } else if (messageLower.includes("how long") || messageLower.includes("timeline") || messageLower.includes("duration")) {
      specializedResponse = designResponses.timeline;
    } else if (messageLower.includes("material") || messageLower.includes("quality") || messageLower.includes("wood") || messageLower.includes("marble")) {
      specializedResponse = designResponses.materials;
    } else if (messageLower.includes("cost") || messageLower.includes("price") || messageLower.includes("budget") || messageLower.includes("expensive")) {
      specializedResponse = designResponses.budget;
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
    
    // Use specialized response if available
    if (specializedResponse) {
      botResponse = specializedResponse;
    } else if (bestMatch && highestScore > 5) {
      botResponse = bestMatch.answer;
    } else {
      // Default response if no good match found
      botResponse = "I'd be happy to help you with that! For specific questions about our interior design services, pricing, or to connect with our team, you can:\n\n• Browse our designer profiles\n• Register your project to get matched with designers\n• Contact our support team at info@thehomedesigners.com or +91 98765 43210\n\nIs there anything specific about our services you'd like to know more about?";
    }
    
    // Add personalization if user_id is provided
    if (user_id) {
      try {
        // Get user details
        const { data: userData } = await supabase
          .from('users')
          .select('user_metadata')
          .eq('id', user_id)
          .single();
          
        if (userData?.user_metadata?.name) {
          // Add personalized greeting if this is one of the first messages
          const { data: messageCount } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conversation_id);
            
          if (messageCount && messageCount.length < 4) {
            botResponse = `Hi ${userData.user_metadata.name}, ${botResponse.charAt(0).toLowerCase()}${botResponse.slice(1)}`;
          }
        }
      } catch (error) {
        // Silently continue if personalization fails
        console.log("Personalization failed:", error);
      }
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
        success: true,
        isAI: true
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
        success: false,
        isAI: false
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