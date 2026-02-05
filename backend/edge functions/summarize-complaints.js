import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const groqKey = Deno.env.get("ARSENAL_API_KEY");

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { complaints, forceRefresh } = await req.json();

    // Group by Category
    const grouped = {};
    complaints.forEach((c: any) => {
      const cat = c.category || "Other";
      if (!grouped[cat]) grouped[cat] = { ids: [], descs: [] };
      grouped[cat].ids.push(c.id);
      grouped[cat].descs.push(c.description);
    });

    const summaryPromises = Object.entries(grouped).map(async ([category, data]: any) => {
      
      // 1. CHECK CACHE (If not forced)
      if (!forceRefresh) {
        const { data: cached } = await supabase
          .from('category_summaries')
          .select('summary')
          .eq('category', category)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (cached) {
          return { category, summary: cached.summary, ids: data.ids };
        }
      }

      // 2. GENERATE NEW SUMMARY
      const textBlock = data.descs.join("\n- ");
      
      const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              // ✅ UPDATED PROMPT: Multi-line, Point-wise, Filtered
              content: `You are a strict backend analyzer. Analyze a list of user complaints and group them by specific root causes.

Rules:
1. FILTER: Ignore any individual lines that are spam, gibberish, or meaningless.
2. CLUSTER: Identify distinct problems. If there are multiple different issues (e.g., "Fan not working" AND "Leaking Tap"), treat them as separate points.
3. FORMAT: For each distinct issue, output exactly one line in this format:
   [Short Title]: [Clean, easy understanding, concise summary]
4. OUTPUT: Do NOT use bullet points. Do NOT add introductory text. Just the lines.
5. EXCEPTION: If ALL inputs are spam/gibberish, return exactly: "No actionable issues detected."

Example Output:
Fan Issue: Multiple reports of ceiling fans not working in 2nd-floor rooms.
Leaking Tap: Persistent water leakage reported in the common washroom.` 
            },
            { role: "user", content: textBlock }
          ],
          temperature: 0.1, // Keep strict
          max_tokens: 300   // Increased tokens to allow for multiple lines
        }),
      });

      const json = await aiResponse.json();
      const summary = json.choices?.[0]?.message?.content || "Analysis unavailable.";

      // 3. WRITE TO CACHE
      await supabase.from('category_summaries').upsert({
        category,
        summary,
        generated_at: new Date().toISOString()
      }, { onConflict: 'category' });

      return { category, summary, ids: data.ids };
    });

    const summaries = await Promise.all(summaryPromises);

    return new Response(JSON.stringify({ summaries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});