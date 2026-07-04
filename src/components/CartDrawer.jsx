import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiCreditCard, FiArrowLeft } from 'react-icons/fi'

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

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

  // Estados de Checkout y Pagos
  const [paso, setPaso] = useState('carrito') // 'carrito' | 'checkout'
  const [tipoEntrega, setTipoEntrega] = useState('recojo') // 'recojo' | 'delivery'
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo') // 'efectivo' | 'online'
  const [ajustes, setAjustes] = useState({
    delivery_gratis_desde: 50,
    delivery_costo: 5,
    delivery_coordinar: false,
    mercado_pago_public_key: '',
    mercado_pago_access_token: '',
    mercado_pago_activo: false
  })

  // Cargar Ajustes desde Supabase
  useEffect(() => {
    if (!cartOpen) return
    setPaso('carrito') // Resetear paso al abrir
    const fetchAjustes = async () => {
      try {
        const { data } = await supabase
          .from('configuracion')
          .select('*')
          .maybeSingle()
        if (data) {
          setAjustes({
            delivery_gratis_desde: data.delivery_gratis_desde !== undefined && data.delivery_gratis_desde !== null ? parseFloat(data.delivery_gratis_desde) : 50,
            delivery_costo: data.delivery_costo !== undefined && data.delivery_costo !== null ? parseFloat(data.delivery_costo) : 5,
            delivery_coordinar: !!data.delivery_coordinar,
            mercado_pago_public_key: data.mercado_pago_public_key || '',
            mercado_pago_access_token: data.mercado_pago_access_token || '',
            mercado_pago_activo: !!data.mercado_pago_activo
          })
        }
      } catch (err) {
        console.error('Error fetching settings in CartDrawer:', err)
      }
    }
    fetchAjustes()
  }, [cartOpen])

  // Resetear estados al cambiar tipo de entrega o abrir
  useEffect(() => {
    if (tipoEntrega === 'recojo') {
      setMetodoPago('efectivo')
    }
  }, [tipoEntrega])

  if (!cartOpen) return null

  // Costo de delivery dinámico
  const costoEnvio = tipoEntrega === 'recojo' ? 0 
                     : ajustes.delivery_coordinar ? 0 
                     : total >= ajustes.delivery_gratis_desde ? 0 
                     : ajustes.delivery_costo

  const totalPagar = total + costoEnvio

  const handleCheckout = async () => {
    if (!usuario) {
      setCartOpen(false)
      navigate('/login')
      return
    }
    if (carrito.length === 0) return

    // Si estamos en el paso inicial, pasar a los detalles de envío/pago
    if (paso === 'carrito') {
      setPaso('checkout')
      return
    }

    // Validar datos de envío obligatorios
    if (tipoEntrega === 'delivery') {
      if (!direccion.trim()) {
        alert('Por favor ingresa tu dirección de entrega.')
        return
      }
      if (!telefono.trim()) {
        alert('Por favor ingresa un teléfono de contacto.')
        return
      }
    }

    setConfirmando(true)
    try {
      // 1. Asegurar que el usuario existe en la tabla de perfiles 'usuarios' para evitar errores de FK
      const { data: perfilExistente, error: perfilError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', usuario.id)
        .maybeSingle()

      if (perfilError) throw perfilError

      if (!perfilExistente) {
        const { error: insertPerfilErr } = await supabase
          .from('usuarios')
          .insert({
            id: usuario.id,
            nombre: usuario.user_metadata?.full_name || usuario.user_metadata?.name || usuario.email?.split('@')[0] || 'Cliente',
            email: usuario.email,
            foto: usuario.user_metadata?.avatar_url || null,
            rol: 'usuario',
            creado_en: new Date().toISOString()
          })
        if (insertPerfilErr) throw insertPerfilErr
      }

      const generatedId = generateUUID()

      // 2. Armar e insertar el pedido en Supabase
      const nuevoPedido = {
        id:            generatedId,
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
        total:    parseFloat(totalPagar.toFixed(2)),
        estado:   'pendiente',
        resena:   false,
        creado_en: new Date().toISOString(),
        tipo_entrega: tipoEntrega,
        direccion_entrega: tipoEntrega === 'delivery' ? direccion : null,
        telefono_contacto: telefono || null,
        metodo_pago: metodoPago,
        costo_delivery: costoEnvio,
        pago_estado: 'pendiente'
      }

      let orderId = ''
      try {
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('pedidos')
          .insert(nuevoPedido)
          .select('id')
          .single()

        if (orderErr) throw orderErr
        orderId = insertedOrder.id
      } catch (dbErr) {
        console.warn('Fallo al insertar con columnas nuevas, usando fallback en JSON de productos:', dbErr)
        // Fallback: Almacenar metadata en el array de productos por si no han corrido la migración SQL
        const productosConMetadata = [
          ...carrito.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            opcion: item.opcion,
            complemento: item.complemento?.nombre || null,
            extra: item.extra,
          })),
          {
            id: '_metadata',
            nombre: 'Detalles de Entrega',
            precio: 0,
            cantidad: 1,
            tipo_entrega: tipoEntrega,
            direccion: tipoEntrega === 'delivery' ? direccion : null,
            telefono: telefono || null,
            metodo_pago: metodoPago,
            costo_delivery: costoEnvio,
            pago_estado: 'pendiente'
          }
        ]

        const { data: insertedOrderFallback, error: orderErrFallback } = await supabase
          .from('pedidos')
          .insert({
            id:            generatedId,
            usuario_id:    usuario.id,
            usuario_email: usuario.email,
            productos: productosConMetadata,
            total:    parseFloat(totalPagar.toFixed(2)),
            estado:   'pendiente',
            resena:   false,
            creado_en: new Date().toISOString()
          })
          .select('id')
          .single()

        if (orderErrFallback) throw orderErrFallback
        orderId = insertedOrderFallback.id
      }

      // Si el método de pago es Mercado Pago online, crear la preferencia de redirección
      if (metodoPago === 'online' && ajustes.mercado_pago_activo) {
        const items = carrito.map(item => ({
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: parseFloat((item.precio + item.extra).toFixed(2)),
          currency_id: 'PEN'
        }))

        if (tipoEntrega === 'delivery' && costoEnvio > 0) {
          items.push({
            title: 'Envío a Domicilio',
            quantity: 1,
            unit_price: parseFloat(costoEnvio.toFixed(2)),
            currency_id: 'PEN'
          })
        }

        const mpRes = await fetch('https://api.mercadopago.com/v1/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ajustes.mercado_pago_access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items,
            back_urls: {
              success: `${window.location.origin}/orders?pago=exitoso&pedido_id=${orderId}`,
              failure: `${window.location.origin}/orders?pago=fallido&pedido_id=${orderId}`,
              pending: `${window.location.origin}/orders?pago=pendiente&pedido_id=${orderId}`
            },
            auto_return: 'approved'
          })
        })

        if (!mpRes.ok) {
          const errData = await mpRes.json()
          throw new Error(errData.message || 'Error al conectar con Mercado Pago')
        }

        const preference = await mpRes.json()
        
        vaciarCarrito()
        setCartOpen(false)
        window.location.href = preference.init_point
      } else {
        // Efectivo o Contra entrega
        vaciarCarrito()
        setCartOpen(false)
        navigate('/orders?pedido_confirmado=true')
      }
    } catch (err) {
      console.error(err)
      alert('Error al confirmar el pedido: ' + (err.message || err))
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
            {paso === 'checkout' && (
              <button onClick={() => setPaso('carrito')} className="mr-1 text-gray-400 hover:text-white transition">
                <FiArrowLeft size={18} />
              </button>
            )}
            <FiShoppingCart className="text-red-500" size={18} />
            <h2 className="font-black text-base uppercase tracking-wider">
              {paso === 'carrito' ? 'Tu Pedido' : 'Detalles de Envío'}
            </h2>
            {paso === 'carrito' && (
              <span className="text-[10px] bg-red-600/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                {carrito.reduce((acc, item) => acc + item.cantidad, 0)} items
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {paso === 'carrito' ? (
            carrito.length === 0 ? (
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
            )
          ) : (
            // paso === 'checkout'
            <div className="space-y-4">
              {/* Tipo de Entrega */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Tipo de Entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTipoEntrega('recojo')}
                    className={`py-3 px-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      tipoEntrega === 'recojo' ? 'bg-red-600/10 border-red-500 text-white font-bold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}>
                    <span className="text-xs">Recojo en Local</span>
                    <span className="text-[10px] text-green-400 font-bold">Gratis</span>
                  </button>
                  <button onClick={() => setTipoEntrega('delivery')}
                    className={`py-3 px-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      tipoEntrega === 'delivery' ? 'bg-red-600/10 border-red-500 text-white font-bold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}>
                    <span className="text-xs">Envío a Domicilio</span>
                    <span className="text-[10px] text-red-400 font-bold">
                      {ajustes.delivery_coordinar ? 'Por coordinar' : `S/ ${ajustes.delivery_costo.toFixed(2)}`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Formulario de Delivery */}
              {tipoEntrega === 'delivery' && (
                <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Dirección de entrega *</label>
                    <input type="text" placeholder="Calle, número, depto o referencia..."
                      value={direccion} onChange={(e) => setDireccion(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-red-500 text-white transition placeholder:text-gray-600" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Teléfono de contacto *</label>
                    <input type="tel" placeholder="Ej. 987654321"
                      value={telefono} onChange={(e) => setTelefono(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-red-500 text-white transition placeholder:text-gray-600" />
                  </div>
                </div>
              )}

              {/* Método de Pago */}
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Método de Pago</label>
                <div className="space-y-2">
                  <button onClick={() => setMetodoPago('efectivo')}
                    className={`w-full py-3 px-4 rounded-xl border text-left transition flex items-center justify-between ${
                      metodoPago === 'efectivo' ? 'bg-red-600/10 border-red-500 text-white font-bold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}>
                    <div className="flex flex-col">
                      <span className="text-xs">Pago Contra Entrega</span>
                      <span className="text-[10px] text-gray-400 font-normal">Paga en efectivo, tarjeta o Yape al recibir/recoger</span>
                    </div>
                    <span className="text-xs">💵</span>
                  </button>

                  {/* Mostrar Mercado Pago si está activo y no es recojo */}
                  {ajustes.mercado_pago_activo && tipoEntrega === 'delivery' && (
                    <button onClick={() => setMetodoPago('online')}
                      className={`w-full py-3 px-4 rounded-xl border text-left transition flex items-center justify-between ${
                        metodoPago === 'online' ? 'bg-red-600/10 border-red-500 text-white font-bold' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}>
                      <div className="flex flex-col">
                        <span className="text-xs">Pago en Línea (Mercado Pago)</span>
                        <span className="text-[10px] text-gray-400 font-normal">Paga seguro con tarjeta o saldo de Mercado Pago</span>
                      </div>
                      <span className="text-xs">💳</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
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
              
              {paso === 'checkout' && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Envío / Delivery</span>
                  {tipoEntrega === 'recojo' ? (
                    <span className="text-green-400 font-bold">Gratis (Recojo)</span>
                  ) : ajustes.delivery_coordinar ? (
                    <span className="text-yellow-400 font-bold">Por coordinar</span>
                  ) : total >= ajustes.delivery_gratis_desde ? (
                    <span className="text-green-400 font-bold">Gratis (Envío)</span>
                  ) : (
                    <span>S/ {ajustes.delivery_costo.toFixed(2)}</span>
                  )}
                </div>
              )}

              <div className="border-t border-white/5 my-2 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-black uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-red-500">
                  S/ {paso === 'checkout' ? totalPagar.toFixed(2) : total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={confirmando}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-sm uppercase tracking-wider shadow-md"
            >
              {confirmando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiCreditCard size={16} />
                  {!usuario ? 'Iniciar Sesión para Pedir'
                    : paso === 'carrito' ? 'Continuar al Pago'
                    : metodoPago === 'online' ? 'Ir a pagar con Mercado Pago'
                    : 'Confirmar Pedido'}
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
