import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const SYSTEM_PROMPT = `Eres el asistente virtual del Restaurante La Esquina, un restaurante peruano especializado en hamburguesas, combos, bebidas y postres. Tu nombre es "Esquinita".

Menú disponible:
HAMBURGUESAS: Hamburguesa Clásica S/18.90, Hamburguesa Clásica 2 S/18.90, Hamburguesa Royal S/22.90, Hamburguesa a la Peruana S/24.90
COMBOS: Combo Anticuchos S/35.90, Combo Alitas de Pollo S/32.90, Combo Nuggets de Pollo S/28.90, Combo Pollo BBQ S/34.90
BEBIDAS: Coca Cola S/5.90, Fanta S/5.90, Inca Kola S/5.90, Sprint S/4.90, Maracuyá S/6.50, Chicha Morada S/6.50
POSTRES: Arroz con Leche S/8.90, Brownie con Helado S/12.90, Cheesecake de Fresa S/11.90, Torta de Chocolate S/10.90

Responde siempre en español, de forma amable, corta y profesional. Si el cliente pregunta por precios, muéstralos claramente. Si quiere hacer un pedido, dile que vaya al menú de la página. No inventes productos que no están en el menú.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error de Anthropic:', data)
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Error al contactar la IA' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error interno:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})