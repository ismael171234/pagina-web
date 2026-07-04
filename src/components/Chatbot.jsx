import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi'
import { supabase } from '../supabase/supabaseClient'

const CHIPS = [
  { label: '🚀 ¿Cómo ordenar?', texto: 'Hola, soy nuevo. ¿Cómo puedo hacer un pedido?' },
  { label: '🕒 Horario y Dirección', texto: '¿Cuál es su dirección y horario de atención?' },
  { label: '🛵 Costo de envío', texto: '¿Cuál es el costo del delivery?' },
  { label: '💳 Medios de pago', texto: '¿Qué formas de pago aceptan?' }
]

const getSystemPrompt = (config, productosList) => {
  const infoRestaurante = `
Restaurante: ${config.nombre || 'La Esquina'}
Dirección: ${config.direccion || 'No especificada'}
Teléfono: ${config.telefono || 'No especificado'}
Horario: ${config.horario || 'No especificado'}
Descripción: ${config.descripcion || 'Especialidades peruanas'}
`;

  const costoFijo = config.delivery_coordinar ? 'Costo variable a registrar con el motorizado' : `S/ ${(config.delivery_costo || 5).toFixed(2)}`;
  const envioGratis = config.delivery_gratis_desde ? `Envío gratuito en compras mayores a S/ ${(config.delivery_gratis_desde).toFixed(2)}` : 'No aplica envío gratuito';

  const infoDelivery = `
Políticas de Delivery:
- Tipo de entrega: Recojo en local (Gratis) o Envío a domicilio.
- Tarifa: ${costoFijo}.
- Promoción: ${envioGratis}.
`;

  const menu = productosList.length > 0
    ? productosList.map(p => `- ${p.nombre} (${p.categoria}): S/ ${parseFloat(p.precio).toFixed(2)}${p.tag ? ` [Tag: ${p.tag}]` : ''}`).join('\n')
    : `HAMBURGUESAS: Hamburguesa Clásica S/18.90, Hamburguesa Clásica 2 S/18.90, Hamburguesa Royal S/22.90, Hamburguesa a la Peruana S/24.90\nCOMBOS: Combo Anticuchos S/35.90, Combo Alitas de Pollo S/32.90, Combo Nuggets de Pollo S/28.90, Combo Pollo BBQ S/34.90\nBEBIDAS: Coca Cola S/5.90, Fanta S/5.90, Inca Kola S/5.90, Sprint S/4.90, Maracuyá S/6.50, Chicha Morada S/6.50\nPOSTRES: Arroz con Leche S/8.90, Brownie con Helado S/12.90, Cheesecake de Fresa S/11.90, Torta de Chocolate S/10.90`;

  return `Eres "Esquinita", el asistente virtual del Restaurante "${config.nombre || 'La Esquina'}". Responde de forma amable, cercana, corta y profesional en español.

${infoRestaurante}

${infoDelivery}

MENÚ DE PLATOS DISPONIBLES:
${menu}

DIRECTIVAS CLAVE PARA AYUDAR A NUEVOS USUARIOS:
1. Si son nuevos y quieren saber cómo ordenar, explícales con un tono muy amable los siguientes pasos:
   - Paso A: Explora el menú en la sección "Menú" o selecciona platos desde la página de inicio.
   - Paso B: Agrega tus platos preferidos al carrito.
   - Paso C: Abre el carrito en la esquina inferior derecha, dale a "Confirmar pedido", completa tus datos (Dirección/Teléfono) y selecciona si deseas "Recojo en local" o "Delivery".
   - Paso D: Selecciona si pagarás en Efectivo/Yape al recibir, o Pago online seguro con Mercado Pago.
2. Responde preguntas frecuentes usando la información del restaurante arriba (Dirección, Teléfono, Horario, Políticas de Delivery).
3. No inventes productos. Si no están en la lista anterior, di amablemente que no contamos con ellos.
4. Mantén las respuestas breves, con buen formato y emojis amigables.`;
}

function Chatbot() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([
    { rol: 'assistant', texto: '¡Hola! Soy Esquinita, tu asistente de La Esquina. ¿Listo para probar lo mejor de nuestro menú? Si eres nuevo o tienes dudas de cómo pedir, ¡dímelo para guiarte paso a paso!' }
  ])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [ajustes, setAjustes] = useState({
    nombre: 'La Esquina',
    telefono: '',
    direccion: '',
    horario: '',
    descripcion: '',
    delivery_costo: 5,
    delivery_gratis_desde: 50,
    delivery_coordinar: false,
    mercado_pago_activo: false
  })
  const [productos, setProductos] = useState([])

  const messagesEndRef = useRef(null)

  // Cargar contexto dinámico (configuración y productos disponibles)
  useEffect(() => {
    const loadBotContext = async () => {
      try {
        const { data: configData } = await supabase.from('configuracion').select('*').maybeSingle()
        if (configData) {
          setAjustes(configData)
        }
        const { data: prodData } = await supabase.from('productos').select('*').eq('disponible', true)
        if (prodData) {
          setProductos(prodData)
        }
      } catch (err) {
        console.error('Error al cargar contexto para el chatbot:', err)
      }
    }
    loadBotContext()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviarMensaje = async (textoPersonalizado = null) => {
    const textoAEnviar = typeof textoPersonalizado === 'string' ? textoPersonalizado : input
    if (!textoAEnviar.trim() || cargando) return

    const nuevoMensaje = { rol: 'user', texto: textoAEnviar }
    setMensajes((prev) => [...prev, nuevoMensaje])
    if (!textoPersonalizado || typeof textoPersonalizado !== 'string') {
      setInput('')
    }
    setCargando(true)

    try {
      const historial = [...mensajes, nuevoMensaje].map((m) => ({
        role: m.rol,
        content: m.texto,
      }))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: getSystemPrompt(ajustes, productos),
          messages: historial,
        }),
      })

      const data = await response.json()
      const respuesta = data.content?.[0]?.text || 'Lo siento, no pude responder.'
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: respuesta }])
    } catch (err) {
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setCargando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-24 bg-red-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-red-700 transition flex items-center justify-center z-50"
      >
        {abierto ? <FiX className="text-2xl" /> : <FiMessageSquare className="text-2xl" />}
      </button>

      {abierto && (
        <div className="fixed bottom-24 right-24 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50" style={{ height: '450px' }}>

          <div className="bg-red-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FiMessageSquare className="text-white text-sm" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{ajustes.nombre || 'La Esquina'}</p>
              <p className="text-red-200 text-xs">Asistente Virtual</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-red-200 text-xs">En línea</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {mensajes.map((msg, i) => (
              <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.rol === 'user'
                    ? 'bg-red-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.texto}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 pt-2 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-none border-t border-gray-100 bg-gray-50/50">
            {CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => enviarMensaje(chip.texto)}
                disabled={cargando}
                className="text-[10px] bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-2.5 py-1 rounded-full whitespace-nowrap transition flex-shrink-0 font-medium active:scale-95 shadow-sm disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 px-3 py-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none border border-gray-200 focus:border-red-400 transition"
            />
            <button
              onClick={() => enviarMensaje()}
              disabled={cargando || !input.trim()}
              className="bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-700 transition disabled:opacity-50"
            >
              <FiSend size={14} />
            </button>
          </div>

        </div>
      )}
    </>
  )
}

export default Chatbot