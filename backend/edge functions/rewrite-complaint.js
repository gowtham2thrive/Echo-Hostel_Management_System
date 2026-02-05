import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const jarvisKey = Deno.env.get("JARVIS_API_KEY")!;
    if (!jarvisKey) throw new Error("JARVIS_API_KEY is not set.");

    const { text } = await req.json();
    if (!text) throw new Error("No text provided.");

    // ✅ USING THE BEST MODEL FROM YOUR LIST
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jarvisKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            // ✅ UPDATED PROMPT: Strict "No Talk, Just Work" instructions
            content: "You are a text processing engine. Your ONLY task is to rewrite the user's input to be professional, neutral, and concise (max 3 sentences). Do NOT carry out a conversation. Do NOT ask for more details. Do NOT judge the input (e.g., 'it seems wrong'). Do NOT use introductory phrases like 'Here is the rewrite'. Output ONLY the rewritten text. If the input is meaningless, output 'Input unclear, please describe the issue details.'"
          },
          { role: "user", content: text },
        ],
        temperature: 0.3, // Reduced temperature for more deterministic/focused output
      }),
    });

    const aiJson = await aiRes.json();

    // 🔍 Log specific errors if Groq fails
    if (aiJson.error) {
      console.error("Groq Error:", JSON.stringify(aiJson.error));
      throw new Error(`Groq API Error: ${aiJson.error.message}`);
    }

    const suggestion = aiJson?.choices?.[0]?.message?.content || "No suggestion generated.";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Server Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});