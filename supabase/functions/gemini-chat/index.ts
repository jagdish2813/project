// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
//import { GoogleGenerativeAI } from 'npm:@google/genai';
// Import the Deno serve function and the Google Generative AI SDK
//import { Deno } from "https://deno.land/deno.js";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";
// Define the Generative Model you want to use
const MODEL_NAME = "gemini-2.5-flash"; // Or gemini-2.5-pro
/**
 * Handles incoming HTTP requests for the Edge Function.
 * It expects a JSON body with a 'prompt' property.
 */ Deno.serve(async (req)=>{
  // 1. Handle Preflight/CORS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
  // Set up CORS headers for the response
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };
  try {
    // 2. Extract the prompt from the request body
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({
        error: 'Missing "prompt" in request body'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // 3. Get API Key from environment secrets
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'GEMINI_API_KEY not set in secrets'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    // 4. Initialize the Google Generative AI client
    const ai = new GoogleGenerativeAI(apiKey);
    // 5. Call the Gemini API
    const model = ai.getGenerativeModel({
      model: MODEL_NAME
    });
    const response = await model.generateContent(prompt);
    /*const response = await ai.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        // Optional: add configuration like temperature, etc.
        temperature: 0.7
      }
    });*/ // Extract the generated text
    const generatedText = response.text;
    // 6. Return the AI-generated text
    return new Response(JSON.stringify({
      generated_text: generatedText
    }), {
      headers: corsHeaders,
      status: 200
    });
  } catch (error) {
    // Log and return an error response
    console.error("Gemini Edge Function Error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
