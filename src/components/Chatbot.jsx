import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi'

const SYSTEM_PROMPT = `Eres el asistente virtual del Restaurante La Esquina, un restaurante peruano especializado en hamburguesas, combos, bebidas y postres. Tu nombre es "Esquinita".

Menú disponible:
HAMBURGUESAS: Hamburguesa Clásica S/18.90, Hamburguesa Clásica 2 S/18.90, Hamburguesa Royal S/22.90, Hamburguesa a la Peruana S/24.90
COMBOS: Combo Anticuchos S/35.90, Combo Alitas de Pollo S/32.90, Combo Nuggets de Pollo S/28.90, Combo Pollo BBQ S/34.90
BEBIDAS: Coca Cola S/5.90, Fanta S/5.90, Inca Kola S/5.90, Sprint S/4.90, Maracuyá S/6.50, Chicha Morada S/6.50
POSTRES: Arroz con Leche S/8.90, Brownie con Helado S/12.90, Cheesecake de Fresa S/11.90, Torta de Chocolate S/10.90

Responde siempre en español, de forma amable, corta y profesional. Si el cliente pregunta por precios, muéstralos claramente. Si quiere hacer un pedido, dile que vaya al menú de la página. No inventes productos que no están en el menú.`

function Chatbot() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([
    { rol: 'assistant', texto: '¡Hola! Soy Esquinita, el asistente de La Esquina. ¿En qué te puedo ayudar?' }
  ])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviarMensaje = async () => {
    if (!input.trim() || cargando) return

    const nuevoMensaje = { rol: 'user', texto: input }
    setMensajes((prev) => [...prev, nuevoMensaje])
    setInput('')
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
          system: SYSTEM_PROMPT,
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
              <p className="text-white font-bold text-sm">Esquinita</p>
              <p className="text-red-200 text-xs">Asistente de La Esquina</p>
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
              onClick={enviarMensaje}
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