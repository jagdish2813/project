import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";

// Set CORS headers for the web client to call this function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // IMPORTANT: Restrict this to your website domain in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in secrets.");
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // **This is where you add your RAG context and System Prompt**
    const systemMessage = {
        role: "system",
        content: "You are a friendly, highly knowledgeable, and extremely accurate chatbot for [Your Website Name]. You answer questions concisely. Do not use any external knowledge; if the answer is not in your context, say 'I cannot find that information.'",
    };

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use gpt-4o or gpt-4-turbo for better quality
      messages: [systemMessage, ...messages],
      stream: true, // IMPORTANT: Stream the response for better UX
    });

    // Stream the response back to the client
    return new Response(chatCompletion.toWeb(), {
        headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
        },
    });

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});