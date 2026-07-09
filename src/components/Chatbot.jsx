import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi'
import { supabase } from '../supabase/supabaseClient'

const CHIPS = [
  { label: '🚀 ¿Cómo ordenar?', texto: 'Hola, soy nuevo. ¿Cómo puedo hacer un pedido?' },
  { label: '🕒 Horario y Dirección', texto: '¿Cuál es su dirección y horario de atención?' },
  { label: '🛵 Costo de envío', texto: '¿Cuál es el costo del delivery?' },
  { label: '💳 Medios de pago', texto: '¿Qué formas de pago aceptan?' }
]

const obtenerRespuestaLocal = (mensaje, config, productosList) => {
  const msgLower = mensaje.toLowerCase()

  // 1. ¿Cómo ordenar / pedir?
  if (msgLower.includes('cómo ordenar') || msgLower.includes('como ordenar') || msgLower.includes('cómo pedir') || msgLower.includes('como pedir') || msgLower.includes('nuevo') || msgLower.includes('ayuda') || msgLower.includes('paso a paso') || msgLower.includes('hacer un pedido') || msgLower.includes('hacer pedido')) {
    const costo = config.delivery_coordinar ? 'coordinar costo variable con el motorizado.' : `S/ ${(config.delivery_costo || 5).toFixed(2)}.`;
    const gratis = config.delivery_gratis_desde ? `¡Delivery gratis por compras mayores a S/ ${config.delivery_gratis_desde}! 🛵` : '';
    return `¡Es súper fácil ordenar en **${config.nombre || 'La Esquina'}**! Sigue estos sencillos pasos:\n\n` +
      `1️⃣ Ve a la pestaña **Menú** 📋 o selecciona platos desde la página de inicio.\n` +
      `2️⃣ Elige las opciones del plato (opción, complemento si aplica) y haz clic en **Agregar al carrito** 🛒.\n` +
      `3️⃣ Abre tu carrito (botón en la esquina inferior derecha) y haz clic en **Confirmar pedido**.\n` +
      `4️⃣ Ingresa tu Dirección y Teléfono, elige si es para **Delivery** o **Recojo en Local**.\n` +
      `5️⃣ Elige tu método de pago: **Efectivo / Yape** (al recibir/recoger) o **Pago online** (tarjetas de crédito/débito vía Mercado Pago).\n\n` +
      `¡Listo! Tu pedido llegará en unos minutos. 🛵💨`;
  }

  // 2. Horarios y Dirección
  if (msgLower.includes('horario') || msgLower.includes('dirección') || msgLower.includes('direccion') || msgLower.includes('ubicación') || msgLower.includes('donde estan') || msgLower.includes('dónde están') || msgLower.includes('dónde queda') || msgLower.includes('donde queda') || msgLower.includes('lugar')) {
    return `📍 **Ubicación**: ${config.direccion || 'Av. Principal 123, Piura'}\n` +
      `🕒 **Horario de atención**: ${config.horario || 'Lunes a Domingo: 12:00 pm - 11:00 pm'}\n\n` +
      `¡Te esperamos con el mejor sabor! 🤤`;
  }

  // 3. Costo de envío / Delivery
  if (msgLower.includes('delivery') || msgLower.includes('envio') || msgLower.includes('envío') || msgLower.includes('costo') || msgLower.includes('cuanto cuesta') || msgLower.includes('cuánto cuesta')) {
    const costo = config.delivery_coordinar ? 'coordinar costo variable con el motorizado al recibir.' : `S/ ${(config.delivery_costo || 5).toFixed(2)}.`;
    const gratis = config.delivery_gratis_desde ? `¡Además, tu envío es **GRATIS** en compras mayores a S/ ${config.delivery_gratis_desde}! 🛵` : '';
    return `🛵 **Políticas de Delivery**:\n\n` +
      `- Contamos con **Recojo en Local** (Gratis) y **Envío a Domicilio**.\n` +
      `- Tarifa de envío: ${costo}\n` +
      `- ${gratis}`;
  }

  // 4. Medios de pago
  if (msgLower.includes('pago') || msgLower.includes('pagar') || msgLower.includes('tarjeta') || msgLower.includes('yape') || msgLower.includes('efectivo') || msgLower.includes('mercado pago')) {
    return `💳 **Métodos de Pago**:\n\n` +
      `1️⃣ **Efectivo / Yape / Plin**: Pagas de forma directa contra entrega al recibir tu delivery o recoger en local.\n` +
      `2️⃣ **Pago Online (Mercado Pago)**: Aceptamos tarjetas de débito/crédito (Visa, Mastercard, etc.) de forma segura directamente al checkout.\n\n` +
      `*(Nota: Mercado Pago se habilitará si el administrador ha activado el cobro online en los ajustes).*`;
  }

  // 5. Menú / Carta / Qué platos tienen
  if (msgLower.includes('menú') || msgLower.includes('menu') || msgLower.includes('carta') || msgLower.includes('platos') || msgLower.includes('comer') || msgLower.includes('hamburguesa') || msgLower.includes('alitas') || msgLower.includes('pollo')) {
    const platos = productosList.length > 0 
      ? productosList.slice(0, 5).map(p => `- ${p.nombre} (${p.categoria}): S/ ${parseFloat(p.precio).toFixed(2)}`).join('\n')
      : `- Hamburguesa Clásica: S/ 18.90\n- Combo Alitas de Pollo: S/ 32.90\n- Combo Anticuchos: S/ 35.90\n- Torta de Chocolate: S/ 10.90`;
    return `📋 **Nuestra Carta (Platos Destacados)**:\n\n${platos}\n\n...y mucho más en nuestra sección de **Menú**. ¡Échale un vistazo! 😋`;
  }

  // 6. Teléfono / Contacto
  if (msgLower.includes('telefono') || msgLower.includes('teléfono') || msgLower.includes('contacto') || msgLower.includes('whatsapp') || msgLower.includes('llamar')) {
    return `📞 Puedes comunicarte con nosotros llamando al: **${config.telefono || '+51 913 532 103'}** o escribiéndonos directamente al WhatsApp haciendo clic en el ícono verde abajo a la derecha. 💬`;
  }

  // 7. Saludos
  if (msgLower.includes('hola') || msgLower.includes('buenas') || msgLower.includes('saludos') || msgLower.includes('que tal') || msgLower.includes('qué tal')) {
    return `¡Hola! Soy Esquinita, el asistente virtual de **${config.nombre || 'La Esquina'}**. ¿En qué te puedo ayudar hoy? 😊\n\n` +
      `Pregúntame sobre:\n` +
      `- 🚀 ¿Cómo ordenar?\n` +
      `- 🕒 Horario y Dirección\n` +
      `- 🛵 Costo de envío\n` +
      `- 💳 Medios de pago`;
  }

  // Default fallback response
  return `Hola, soy Esquinita. No logré comprender tu pregunta exacta. Puedes utilizar los botones rápidos aquí abajo para saber cómo hacer un pedido, ver horarios/dirección, políticas de envío o formas de pago. ¡Estoy para ayudarte! 😊`;
}

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
      // 1. Si no hay API Key configurada, responder inmediatamente con la lógica local
      if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
        setTimeout(() => {
          const respuesta = obtenerRespuestaLocal(textoAEnviar, ajustes, productos)
          setMensajes((prev) => [...prev, { rol: 'assistant', texto: respuesta }])
          setCargando(false)
        }, 500)
        return
      }

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
      
      if (response.ok && data.content?.[0]?.text) {
        setMensajes((prev) => [...prev, { rol: 'assistant', texto: data.content[0].text }])
      } else {
        console.warn('Anthropic API error, using local fallback:', data)
        const respuesta = obtenerRespuestaLocal(textoAEnviar, ajustes, productos)
        setMensajes((prev) => [...prev, { rol: 'assistant', texto: respuesta }])
      }
    } catch (err) {
      console.warn('Network error, using local fallback:', err)
      const respuesta = obtenerRespuestaLocal(textoAEnviar, ajustes, productos)
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: respuesta }])
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