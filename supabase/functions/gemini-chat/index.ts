// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI } from 'npm:@google/genai';

// --- Configuration ---

// CORS headers to allow requests from any origin (adjust as needed for production)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the GoogleGenAI client
// It automatically looks for the GEMINI_API_KEY in Deno.env (Supabase Secrets)
const ai = new GoogleGenAI({});

// The Gemini model to use
const MODEL_NAME = 'gemini-2.5-flash';

// --- Function Handler ---

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Enforce POST method for the main logic
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: `Method ${req.method} not allowed. Use POST.` }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Set the default response headers for streaming
  const headers = new Headers({
    ...corsHeaders,
    'Content-Type': 'text/plain; charset=utf-8', // Plain text for basic streaming
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  try {
    // 1. Get the prompt from the request body
    const { prompt } = await req.json();

    // 2. Robust Prompt Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid or missing prompt. Request body must be JSON with a non-empty "prompt" key.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Call the Gemini API for a streaming response
    const streamResponse = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: prompt,
    });

    // 4. Create a Deno ReadableStream from the Gemini stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Iterate over the chunks from the Gemini API
          for await (const chunk of streamResponse) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          // Instead of crashing, close the stream with an error signal
          controller.enqueue(encoder.encode(`\n[STREAM ERROR: ${error.message}]`));
        } finally {
          controller.close(); // Close the stream when done
        }
      },
    });

    // 5. Return the stream as a response
    return new Response(stream, { headers });

  } catch (error) {
    // Catch JSON parsing errors or other unexpected issues
    console.error('Function execution error:', error);
    return new Response(JSON.stringify({ 
      error: `An unexpected error occurred: ${error.message}. Check your request formatting.` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});