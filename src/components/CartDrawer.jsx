import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiCreditCard } from 'react-icons/fi'

export default function CartDrawer() {
  const {
    carrito,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito,
    total,
    cartOpen,
    setCartOpen
  } = useCart()

  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [confirmando, setConfirmando] = useState(false)

  if (!cartOpen) return null

  const handleCheckout = async () => {
    if (!usuario) {
      setCartOpen(false)
      navigate('/login')
      return
    }
    if (carrito.length === 0) return
    setConfirmando(true)
    try {
      const { error } = await supabase
        .from('pedidos')
        .insert({
          usuario_id:    usuario.id,
          usuario_email: usuario.email,
          productos: carrito.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            opcion: item.opcion,
            complemento: item.complemento?.nombre || null,
            extra: item.extra,
          })),
          total:    parseFloat(total.toFixed(2)),
          estado:   'pendiente',
          resena:   false,
          creado_en: new Date().toISOString(),
        })

      if (error) throw error
      vaciarCarrito()
      setCartOpen(false)
      navigate('/orders') // Redirige al historial de pedidos
    } catch (err) {
      console.error(err)
      alert('Error al confirmar el pedido. Intenta de nuevo.')
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setCartOpen(false)}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md h-full bg-[#121212] shadow-2xl z-10 flex flex-col text-white"
        style={{
          animation: 'slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          borderLeft: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#161616]">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="text-red-500" size={18} />
            <h2 className="font-black text-base uppercase tracking-wider">Tu Pedido</h2>
            <span className="text-[10px] bg-red-600/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
              {carrito.reduce((acc, item) => acc + item.cantidad, 0)} items
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 mb-4">
                <FiShoppingCart size={24} />
              </div>
              <p className="text-sm font-bold text-gray-300">Tu carrito está vacío</p>
              <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
                Parece que aún no has agregado productos a tu orden. ¡Revisa nuestra variada carta!
              </p>
              <button
                onClick={() => {
                  setCartOpen(false)
                  navigate('/menu')
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition active:scale-95"
              >
                Ver Menú
              </button>
            </div>
          ) : (
            carrito.map((item, index) => {
              const itemTotal = (item.precio + item.extra) * item.cantidad
              return (
                <div
                  key={`${item.id}_${index}`}
                  className="bg-[#181818] border border-white/5 rounded-2xl p-3 flex gap-3 items-start"
                >
                  {/* Foto miniatura */}
                  {item.imagen && (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-black/40 flex-shrink-0"
                    />
                  )}
                  {/* Detalles */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate leading-tight uppercase">{item.nombre}</p>
                    {item.opcion && (
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">Tamaño: {item.opcion}</p>
                    )}
                    {item.complemento && (
                      <p className="text-[10px] text-red-400 font-bold mt-0.5 truncate">
                        + {item.complemento}
                      </p>
                    )}
                    <p className="text-xs font-black text-red-400 mt-1">S/ {itemTotal.toFixed(2)}</p>
                  </div>
                  {/* Acciones */}
                  <div className="flex flex-col items-end justify-between h-full gap-2">
                    <button
                      onClick={() => eliminarProducto(item.id, item.opcion, item.complemento)}
                      className="text-gray-500 hover:text-red-500 p-1 transition"
                    >
                      <FiTrash2 size={13} />
                    </button>
                    {/* Contador cantidad */}
                    <div className="flex items-center gap-1.5 border border-white/10 rounded-lg px-1.5 py-0.5 bg-black/30">
                      <button
                        onClick={() => actualizarCantidad(item.id, item.opcion, item.complemento, item.cantidad - 1)}
                        className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs"
                      >
                        −
                      </button>
                      <span className="text-[11px] font-black w-4 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(item.id, item.opcion, item.complemento, item.cantidad + 1)}
                        className="w-5 h-5 rounded bg-red-600 hover:bg-red-700 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {carrito.length > 0 && (
          <div className="p-4 bg-[#161616] border-t border-white/5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Envío / Delivery</span>
                <span className="text-green-400 font-bold">Gratis</span>
              </div>
              <div className="border-t border-white/5 my-2 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-red-500">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={confirmando}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
              {confirmando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiCreditCard size={16} />
                  {usuario ? 'Realizar Pedido' : 'Iniciar Sesión para Pedir'}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
