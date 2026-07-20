import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json();
    const { datosClinicos } = body;
    
    if (!datosClinicos) throw new Error("No se recibieron datos clínicos");

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API Key de OpenAI no configurada");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Eres un nutricionista clínico. Analiza: " + JSON.stringify(datosClinicos) + ". Responde solo en formato JSON con llaves 'diagnostico' y 'tratamiento'." },
        ],
        response_format: { type: "json_object" }
      })
    })

    const aiResult = await response.json();
    
    // Verificar si OpenAI devolvió error
    if (!aiResult.choices) throw new Error(JSON.stringify(aiResult.error || "Error desconocido en IA"));

    return new Response(aiResult.choices[0].message.content, { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})