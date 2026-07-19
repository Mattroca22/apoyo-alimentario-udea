import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { datosClinicos } = await req.json()
  
  // Lógica de IA (Ejemplo con OpenAI)
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Eres un nutricionista clínico experto..." },
                 { role: "user", content: `Analiza: ${JSON.stringify(datosClinicos)}` }]
    })
  })

  const aiResult = await response.json()
  return new Response(JSON.stringify(aiResult.choices[0].message.content), { headers: { "Content-Type": "application/json" } })
})