import { useEffect, useState, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import {
  FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiClock,
  FiCheckCircle, FiTruck, FiXCircle, FiShoppingBag,
  FiPackage, FiUser, FiEdit2, FiCheck, FiX, FiLogOut,
  FiMail, FiShield, FiBell, FiBellOff, FiStar, FiMessageSquare
} from 'react-icons/fi'

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

// ── Notificaciones ─────────────────────────────────────────
const NOTIF_MSG = {
  preparando: { titulo: 'Tu pedido esta en preparacion', cuerpo: 'La cocina ya esta trabajando en tu pedido.' },
  listo:      { titulo: 'Tu pedido esta listo',          cuerpo: 'Tu pedido esta listo para ser entregado.' },
  entregado:  { titulo: 'Pedido entregado',              cuerpo: 'Gracias por elegirnos. Esperamos verte pronto.' },
  cancelado:  { titulo: 'Pedido cancelado',              cuerpo: 'Tu pedido fue cancelado. Contactanos si tienes dudas.' },
}

const TOAST_CFG = {
  preparando: { bg: 'bg-blue-50',  border: 'border-blue-200',  titulo: 'En preparacion', cuerpo: 'La cocina ya esta cocinando tu pedido.' },
  listo:      { bg: 'bg-green-50', border: 'border-green-200', titulo: 'Pedido listo',    cuerpo: 'Tu pedido esta listo para ser entregado.' },
  entregado:  { bg: 'bg-gray-50',  border: 'border-gray-200',  titulo: 'Pedido entregado',cuerpo: 'Buen provecho. Gracias por elegirnos.' },
  cancelado:  { bg: 'bg-red-50',   border: 'border-red-200',   titulo: 'Pedido cancelado',cuerpo: 'Tu pedido fue cancelado. Contactanos.' },
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ toasts, onClose }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`${t.bg} ${t.border} border rounded-2xl shadow-2xl p-4 flex items-start gap-3 pointer-events-auto`}
          style={{ animation: 'toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60">
            <FiCheckCircle className="text-gray-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{t.titulo}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.cuerpo}</p>
          </div>
          <button onClick={() => onClose(t.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition">
            <FiX size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Componente de estrellas ────────────────────────────────
function Estrellas({ valor, onChange, readonly = false, size = 20 }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(estrella)}
          onMouseEnter={() => !readonly && setHover(estrella)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-all duration-100 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <FiStar
            size={size}
            className={`transition-colors duration-100 ${
              (hover || valor) >= estrella
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            style={{ fill: (hover || valor) >= estrella ? '#facc15' : 'none' }}
          />
        </button>
      ))}
    </div>
  )
}

// ── Formulario de reseña ───────────────────────────────────
function FormularioResena({ pedido, usuarioId, onGuardado }) {
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario]     = useState('')
  const [guardando, setGuardando]       = useState(false)
  const [error, setError]               = useState('')

  const handleEnviar = async () => {
    if (calificacion === 0) { setError('Por favor selecciona una calificacion'); return }
    setGuardando(true)
    setError('')
    try {
      const { error: insError } = await supabase
        .from('resenas')
        .insert({
          pedido_id:    pedido.id,
          usuario_id:   usuarioId,
          calificacion,
          comentario:  comentario.trim(),
          productos:   pedido.productos?.map(p => p.nombre).join(', ') || '',
          total:       pedido.total,
          creado_en:    new Date().toISOString(),
        })
      if (insError) throw insError

      const { error: updError } = await supabase
        .from('pedidos')
        .update({ resena: true })
        .eq('id', pedido.id)
      if (updError) throw updError

      onGuardado()
    } catch (err) {
      console.error(err)
      setError('Error al guardar la reseña. Intenta de nuevo.')
    }
    setGuardando(false)
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiMessageSquare className="text-yellow-500 flex-shrink-0" size={16} />
          <p className="text-sm font-bold text-yellow-400">Como fue tu experiencia?</p>
        </div>

        {/* Estrellas */}
        <div className="flex flex-col gap-1 mb-3">
          <p className="text-xs text-gray-400 font-semibold">Calificacion</p>
          <Estrellas valor={calificacion} onChange={setCalificacion} size={28} />
          {calificacion > 0 && (
            <p className="text-xs text-yellow-400 font-semibold mt-0.5">
              {calificacion === 1 ? 'Muy malo' :
               calificacion === 2 ? 'Malo' :
               calificacion === 3 ? 'Regular' :
               calificacion === 4 ? 'Bueno' : 'Excelente'}
            </p>
          )}
        </div>

        {/* Comentario */}
        <div className="flex flex-col gap-1 mb-3">
          <p className="text-xs text-gray-400 font-semibold">Comentario (opcional)</p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuentanos como estuvo tu pedido..."
            rows={2}
            maxLength={200}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-yellow-500 transition resize-none"
          />
          <p className="text-xs text-gray-500 text-right">{comentario.length}/200</p>
        </div>

        {error && <p className="text-xs text-red-400 font-semibold mb-2">{error}</p>}

        <button
          onClick={handleEnviar}
          disabled={guardando}
          className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {guardando
            ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            : <><FiStar size={14} /> Enviar resena</>}
        </button>
      </div>
    </div>
  )
}

// ── Reseña guardada ────────────────────────────────────────
function ResenaGuardada({ resena }) {
  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tu resena</p>
          <Estrellas valor={resena.calificacion} readonly size={14} />
        </div>
        {resena.comentario && (
          <p className="text-xs text-gray-300 leading-relaxed">{resena.comentario}</p>
        )}
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────
function Orders() {
  const { carrito, actualizarCantidad, eliminarProducto, vaciarCarrito, total } = useCart()
  const { usuario, datosUsuario, cerrarSesion, recargarDatosUsuario, actualizarPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [vistaActiva, setVistaActiva] = useState(location.state?.tab || 'carrito')
  const [pagoMensaje, setPagoMensaje] = useState(null)

  useEffect(() => {
    if (location.state?.tab) {
      setVistaActiva(location.state.tab)
    }
  }, [location.state?.tab])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const pagoStatus = params.get('pago')
    const pedidoId = params.get('pedido_id')
    const pedidoConfirmado = params.get('pedido_confirmado')

    if (pagoStatus && pedidoId) {
      if (pagoStatus === 'exitoso') {
        const actualizarPago = async () => {
          try {
            await supabase
              .from('pedidos')
              .update({ pago_estado: 'aprobado' })
              .eq('id', pedidoId)
          } catch (err) {
            console.error('Error al actualizar pago:', err)
          }
        }
        actualizarPago()
        setPagoMensaje({
          tipo: 'success',
          titulo: '¡Pago Realizado con Éxito!',
          cuerpo: 'Tu pago en línea por Mercado Pago fue procesado correctamente. ¡Gracias por tu compra!'
        })
      } else if (pagoStatus === 'fallido') {
        setPagoMensaje({
          tipo: 'error',
          titulo: 'Pago no completado',
          cuerpo: 'El pago en línea fue cancelado o falló. Tu pedido se registró con pago pendiente contra entrega.'
        })
      } else if (pagoStatus === 'pendiente') {
        setPagoMensaje({
          tipo: 'warning',
          titulo: 'Pago en Verificación',
          cuerpo: 'El pago se encuentra pendiente de acreditación por Mercado Pago.'
        })
      }
      navigate('/orders', { replace: true, state: { tab: 'historial' } })
    } else if (pedidoConfirmado) {
      setPagoMensaje({
        tipo: 'success',
        titulo: '¡Pedido Recibido!',
        cuerpo: 'Tu pedido ha sido registrado con éxito. Te avisaremos cuando esté listo.'
      })
      navigate('/orders', { replace: true, state: { tab: 'historial' } })
    }
  }, [location.search])

  const [historial, setHistorial]     = useState([])
  const [cargando, setCargando]       = useState(true)
  const [resenas, setResenas]         = useState({}) // { pedidoId: resena }
  const [resenasEnviadas, setResenasEnviadas] = useState({}) // { pedidoId: true } local

  // Notificaciones
  const [permiso, setPermiso] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) return Notification.permission
    return 'default'
  })
  const [toasts, setToasts]       = useState([])
  const estadosAnteriores         = useRef({})
  const primeraCarga              = useRef(true)

  // Perfil
  const [editando, setEditando]   = useState(false)
  const [nombreEdit, setNombreEdit] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  // Cambiar contraseña
  const [editandoPassword, setEditandoPassword] = useState(false)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('')
  const [cargandoPassword, setCargandoPassword] = useState(false)
  const [errorPassword, setErrorPassword] = useState('')
  const [okPassword, setOkPassword] = useState(false)
  const [showNuevaPassword, setShowNuevaPassword] = useState(false)
  const [showConfirmNuevaPassword, setShowConfirmNuevaPassword] = useState(false)

  // ── Listener pedidos ──
  useEffect(() => {
    if (!usuario) return

    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('usuario_id', usuario.id)
      
      if (data) {
        const ordenado = data.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
        
        if (primeraCarga.current) {
          primeraCarga.current = false
          ordenado.forEach(p => { estadosAnteriores.current[p.id] = p.estado })
          setHistorial(ordenado)
          setCargando(false)
          return
        }

        ordenado.forEach(pedido => {
          const anterior = estadosAnteriores.current[pedido.id]
          if (anterior && anterior !== pedido.estado) {
            agregarToast(pedido.estado)
            notifNativa(pedido.estado)
          }
          estadosAnteriores.current[pedido.id] = pedido.estado
        })

        setHistorial(ordenado)
        setCargando(false)
      }
    };

    fetchPedidos()

    const channel = supabase
      .channel(`pedidos-user-${usuario.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `usuario_id=eq.${usuario.id}`
        },
        () => {
          fetchPedidos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [usuario])

  // ── Listener reseñas del usuario ──
  useEffect(() => {
    if (!usuario) return

    const fetchResenas = async () => {
      const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .eq('usuario_id', usuario.id)

      if (data) {
        const mapa = {}
        data.forEach(d => { mapa[d.pedido_id] = { id: d.id, ...d } })
        setResenas(mapa)
      }
    };

    fetchResenas()

    const channel = supabase
      .channel(`resenas-user-${usuario.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resenas',
          filter: `usuario_id=eq.${usuario.id}`
        },
        () => {
          fetchResenas()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [usuario])

  const pedirPermiso = async () => {
    if (!('Notification' in window)) return
    const res = await Notification.requestPermission()
    setPermiso(res)
  }

  const agregarToast = (estado) => {
    const cfg = TOAST_CFG[estado]
    if (!cfg) return
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...cfg }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const cerrarToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const notifNativa = (estado) => {
    const msg = NOTIF_MSG[estado]
    if (!msg || Notification?.permission !== 'granted') return
    try { new Notification(msg.titulo, { body: msg.cuerpo, icon: '/favicon.ico' }) } catch {}
  }

  const handleConfirmar = async () => {
    if (!usuario) { navigate('/login'); return }
    if (carrito.length === 0) return
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

      // 2. Proceder con el pedido
      const { error } = await supabase
        .from('pedidos')
        .insert({
          id:            generateUUID(),
          usuario_id:    usuario.id,
          usuario_email: usuario.email,
          productos: carrito.map((item) => ({
            id: item.id, nombre: item.nombre, precio: item.precio,
            cantidad: item.cantidad, opcion: item.opcion,
            complemento: item.complemento?.nombre || null, extra: item.extra,
          })),
          total:    parseFloat(total.toFixed(2)),
          estado:   'pendiente',
          resena:   false,
          creado_en: new Date().toISOString(),
        })
      if (error) throw error
      vaciarCarrito()
      setVistaActiva('historial')
    } catch (err) {
      console.error(err)
      alert('Error al confirmar el pedido: ' + (err.message || err))
    }
  }

  const iniciarEdicion = () => {
    setNombreEdit(datosUsuario?.nombre || usuario?.user_metadata?.full_name || usuario?.user_metadata?.name || '')
    setEditando(true)
    setGuardadoOk(false)
  }

  const guardarNombre = async () => {
    if (!nombreEdit.trim()) return
    setGuardando(true)
    try {
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ nombre: nombreEdit.trim() })
        .eq('id', usuario.id)
      if (dbError) throw dbError

      // También actualizar en Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: nombreEdit.trim() }
      })
      if (authError) throw authError

      await recargarDatosUsuario()
      setGuardadoOk(true)
      setEditando(false)
      setTimeout(() => setGuardadoOk(false), 2500)
    } catch (err) {
      console.error(err)
      alert('Error al guardar.')
    }
    setGuardando(false)
  }

  const validacionesPassword = {
    longitud: nuevaPassword.length >= 8,
    mayuscula: /[A-Z]/.test(nuevaPassword),
    numero: /[0-9]/.test(nuevaPassword),
    especial: /[!@#$%^&*(),.?":{}|<>]/.test(nuevaPassword),
  }

  const passwordSegura = Object.values(validacionesPassword).every(Boolean)

  const cambiarPassword = async (e) => {
    e.preventDefault()
    if (!nuevaPassword || !confirmarNuevaPassword) {
      setErrorPassword('Por favor completa todos los campos')
      return
    }
    if (nuevaPassword !== confirmarNuevaPassword) {
      setErrorPassword('Las contraseñas no coinciden')
      return
    }
    if (!passwordSegura) {
      setErrorPassword('La contraseña no cumple los requisitos de seguridad')
      return
    }
    setCargandoPassword(true)
    setErrorPassword('')
    try {
      const { error } = await actualizarPassword(nuevaPassword)
      if (error) throw error
      setOkPassword(true)
      setNuevaPassword('')
      setConfirmarNuevaPassword('')
      setEditandoPassword(false)
      setTimeout(() => setOkPassword(false), 3000)
    } catch (err) {
      console.error(err)
      setErrorPassword(err.message || 'Error al cambiar la contraseña')
    } finally {
      setCargandoPassword(false)
    }
  }

  const handleCerrarSesion = async () => { await cerrarSesion(); navigate('/') }

  const estadoColor = {
    pendiente: 'bg-yellow-100 text-yellow-700', preparando: 'bg-blue-100 text-blue-700',
    listo: 'bg-green-100 text-green-700', entregado: 'bg-gray-100 text-gray-600',
    cancelado: 'bg-red-100 text-red-600',
  }
  const estadoIcono = {
    pendiente:  <FiClock className="text-yellow-500" />,
    preparando: <FiShoppingBag className="text-blue-500" />,
    listo:      <FiCheckCircle className="text-green-500" />,
    entregado:  <FiTruck className="text-gray-500" />,
    cancelado:  <FiXCircle className="text-red-500" />,
  }
  const estadoPasos = ['pendiente', 'preparando', 'listo', 'entregado']
  const tabs = [
    { id: 'carrito',   label: `Carrito (${carrito.length})` },
    { id: 'historial', label: 'Historial' },
    { id: 'perfil',    label: 'Mi perfil' },
  ]
  const rolLabel = { admin: 'Administrador', empleado: 'Mesero', cocina: 'Cocina', usuario: 'Cliente' }
  const rolColor = { admin: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', empleado: 'bg-blue-500/10 text-blue-400 border-blue-500/20', cocina: 'bg-orange-500/10 text-orange-400 border-orange-500/20', usuario: 'bg-green-500/10 text-green-400 border-green-500/20' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .orders-page, .orders-page * { font-family: 'Montserrat', sans-serif !important; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(48px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      <Toast toasts={toasts} onClose={cerrarToast} />

      <div className="min-h-screen bg-[#0a0a0a] text-white pb-32 orders-page">

        {/* Header */}
        <div className="bg-[#111] border-b border-white/5 px-4 py-4 text-white flex items-center justify-between">
          <div className="w-8" />
          <h1 className="text-xl font-bold">Mis Pedidos</h1>
          <button onClick={pedirPermiso}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${permiso === 'granted' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}>
            {permiso === 'granted' ? <FiBell size={16} /> : <FiBellOff size={16} />}
          </button>
        </div>

        {/* Banner notificaciones */}
        {permiso === 'default' && usuario && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiBell className="text-red-400 flex-shrink-0" size={15} />
              <p className="text-xs font-semibold text-red-300">Activa las notificaciones para saber cuando tu pedido esta listo</p>
            </div>
            <button onClick={pedirPermiso}
              className="flex-shrink-0 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-700 transition">
              Activar
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-3 bg-[#0d0d0d] border-b border-white/5 sticky top-0 z-10 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setVistaActiva(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap flex-shrink-0 ${
                vistaActiva === tab.id ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {pagoMensaje && (
          <div className="max-w-2xl mx-auto px-4 pt-5">
            <div className={`border rounded-2xl p-4 flex gap-3 relative ${
              pagoMensaje.tipo === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              pagoMensaje.tipo === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}>
              <div className="flex-1">
                <p className="text-sm font-bold">{pagoMensaje.titulo}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{pagoMensaje.cuerpo}</p>
              </div>
              <button onClick={() => setPagoMensaje(null)} className="text-gray-500 hover:text-white transition flex-shrink-0 self-start">
                <FiX size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ══ CARRITO ══ */}
        {vistaActiva === 'carrito' && (
          <>
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20">
                <div className="bg-[#111] rounded-2xl border border-white/5 p-10 flex flex-col items-center max-w-sm w-full">
                  <FiShoppingCart className="text-gray-600 text-6xl mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Tu carrito esta vacio</h2>
                  <p className="text-gray-400 text-sm text-center mb-6">Agrega productos desde nuestro menu</p>
                  <button onClick={() => navigate('/menu')}
                    className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-500 transition shadow-md">
                    Ver menu
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
                {carrito.map((item, index) => (
                  <div key={index} className="bg-[#111] rounded-2xl border border-white/5 p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{item.nombre}</p>
                      {item.opcion && <p className="text-xs text-gray-400 mt-0.5">{item.opcion}</p>}
                      {item.complemento && <p className="text-xs text-gray-400">{item.complemento.nombre}</p>}
                      <p className="text-red-400 font-bold text-sm mt-1">
                        S/ {((item.precio + item.extra) * item.cantidad).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-white/10 rounded-full px-2.5 py-1">
                          <button onClick={() => actualizarCantidad(item.id, item.opcion, item.complemento, item.cantidad - 1)}
                            className="text-gray-400 hover:text-red-400 transition"><FiMinus size={12} /></button>
                          <span className="text-xs font-bold text-white w-4 text-center">{item.cantidad}</span>
                          <button onClick={() => actualizarCantidad(item.id, item.opcion, item.complemento, item.cantidad + 1)}
                            className="text-gray-400 hover:text-red-400 transition"><FiPlus size={12} /></button>
                        </div>
                        <button onClick={() => eliminarProducto(item.id, item.opcion, item.complemento)}
                          className="text-gray-500 hover:text-red-400 transition"><FiTrash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-[#111] rounded-2xl border border-white/5 p-4 mt-2">
                  <h3 className="text-sm font-bold text-white mb-3">Resumen del pedido</h3>
                  <div className="flex flex-col gap-2">
                    {carrito.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-400">
                        <span>{item.nombre} x{item.cantidad}</span>
                        <span>S/ {((item.precio + item.extra) * item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/5 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-white text-sm">Total</span>
                      <span className="font-bold text-red-400 text-sm">S/ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {carrito.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-white/8 px-4 py-3.5 shadow-lg">
                <button onClick={handleConfirmar}
                  className="w-full bg-red-600 text-white font-black py-3.5 rounded-full hover:bg-red-500 transition shadow-md active:scale-95">
                  Confirmar pedido — S/ {total.toFixed(2)}
                </button>
              </div>
            )}
          </>
        )}

        {/* ══ HISTORIAL ══ */}
        {vistaActiva === 'historial' && (
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
            {!usuario ? (
              <div className="bg-[#111] rounded-2xl border border-white/5 p-10 flex flex-col items-center">
                <FiPackage className="text-gray-600 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Inicia sesion</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Para ver tu historial de pedidos</p>
                <button onClick={() => navigate('/login')}
                  className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-500 transition">
                  Iniciar sesion
                </button>
              </div>
            ) : cargando ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : historial.length === 0 ? (
              <div className="bg-[#111] rounded-2xl border border-white/5 p-10 flex flex-col items-center">
                <FiPackage className="text-gray-600 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sin pedidos aun</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Haz tu primer pedido ahora</p>
                <button onClick={() => navigate('/menu')}
                  className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-500 transition">
                  Ver menu
                </button>
              </div>
            ) : (
              historial.map((pedido) => {
                const resenaExistente = resenas[pedido.id]
                const resenaLocal    = resenasEnviadas[pedido.id]
                const puedeResena    = pedido.estado === 'entregado' && !resenaExistente && !resenaLocal

                return (
                  <div key={pedido.id} className="bg-[#111] rounded-2xl border border-white/5 p-4">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Pedido #{pedido.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{pedido.creado_en ? new Date(pedido.creado_en).toLocaleString('es-PE') : '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold">S/ {pedido.total?.toFixed(2)}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 ${estadoColor[pedido.estado]}`}>
                          {estadoIcono[pedido.estado]} {pedido.estado}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          {estadoPasos.map((paso, i) => (
                            <div key={paso} className="flex items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                estadoPasos.indexOf(pedido.estado) >= i ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500'
                              }`}>{i + 1}</div>
                              {i < estadoPasos.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 rounded ${
                                  estadoPasos.indexOf(pedido.estado) > i ? 'bg-red-600' : 'bg-white/5'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          {estadoPasos.map((paso) => <span key={paso} className="capitalize">{paso}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Productos */}
                    <div className="border-t border-white/5 pt-3">
                      {(pedido.productos?.filter(p => p.id !== '_metadata') || []).map((prod, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-400 py-0.5">
                          <span>{prod.nombre} x{prod.cantidad} {prod.opcion ? `(${prod.opcion})` : ''}</span>
                          <span>S/ {((prod.precio + (prod.extra || 0)) * prod.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Detalles de entrega y pago */}
                    {(() => {
                      const tipoEntrega = pedido.tipo_entrega || pedido.productos?.find(p => p.id === '_metadata')?.tipo_entrega || 'recojo'
                      const direccion = pedido.direccion_entrega || pedido.productos?.find(p => p.id === '_metadata')?.direccion || null
                      const telefono = pedido.telefono_contacto || pedido.productos?.find(p => p.id === '_metadata')?.telefono || null
                      const costoDelivery = pedido.costo_delivery !== undefined ? parseFloat(pedido.costo_delivery) : (pedido.productos?.find(p => p.id === '_metadata')?.costo_delivery || 0)
                      const metodoPago = pedido.metodo_pago || pedido.productos?.find(p => p.id === '_metadata')?.metodo_pago || 'efectivo'
                      const pagoEstado = pedido.pago_estado || pedido.productos?.find(p => p.id === '_metadata')?.pago_estado || 'pendiente'

                      return (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/10 text-[11px] text-gray-400 space-y-1 bg-white/5 p-2 rounded-xl border border-white/5">
                          <p><span className="font-bold text-gray-300">Entrega:</span> <span className="capitalize font-semibold">{tipoEntrega === 'recojo' ? 'Recojo en local' : 'Envío a domicilio'}</span>{tipoEntrega === 'delivery' && ` (Envío: S/ ${costoDelivery.toFixed(2)})`}</p>
                          {tipoEntrega === 'delivery' && direccion && <p><span className="font-bold text-gray-300">Dirección:</span> {direccion}</p>}
                          {telefono && <p><span className="font-bold text-gray-300">Teléfono:</span> {telefono}</p>}
                          <p>
                            <span className="font-bold text-gray-300">Pago:</span> <span className="capitalize font-semibold">{metodoPago === 'efectivo' ? 'Efectivo / Yape' : 'Mercado Pago (Online)'}</span> 
                            <span className={`ml-2 px-2 py-0.5 rounded-full font-bold text-[9px] ${pagoEstado === 'aprobado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                              {pagoEstado === 'aprobado' ? 'Pagado' : 'Pendiente'}
                            </span>
                          </p>
                        </div>
                      )
                    })()}

                    {/* Confirmar recepcion */}
                    {pedido.estado === 'listo' && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-green-400 text-center">
                            Tu pedido esta listo. Confirma cuando lo hayas recibido.
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', pedido.id)
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
                        >
                          <FiCheckCircle size={15} />
                          Confirmar recepcion del pedido
                        </button>
                      </div>
                    )}

                    {/* Resena — solo si fue entregado */}
                    {puedeResena && (
                      <FormularioResena
                        pedido={pedido}
                        usuarioId={usuario.id}
                        onGuardado={() => setResenasEnviadas(prev => ({ ...prev, [pedido.id]: true }))}
                      />
                    )}

                    {/* Reseña ya enviada */}
                    {(resenaExistente || resenaLocal) && pedido.estado === 'entregado' && (
                      resenaExistente
                        ? <ResenaGuardada resena={resenaExistente} />
                        : (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 flex items-center gap-2">
                              <FiCheckCircle className="text-green-400 flex-shrink-0" size={15} />
                              <p className="text-xs font-bold text-green-300">Resena enviada. Gracias por tu opinion.</p>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ══ PERFIL ══ */}
        {vistaActiva === 'perfil' && (
          <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
            {!usuario ? (
              <div className="bg-[#111] rounded-2xl border border-white/5 p-10 flex flex-col items-center">
                <FiUser className="text-gray-600 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Inicia sesion</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Para ver tu perfil</p>
                <button onClick={() => navigate('/login')}
                  className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-500 transition">
                  Iniciar sesion
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#111] rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center overflow-hidden mb-4">
                    {usuario.photoURL || usuario.user_metadata?.avatar_url
                      ? <img src={usuario.photoURL || usuario.user_metadata?.avatar_url} alt="foto" className="w-full h-full object-cover" />
                      : <FiUser className="text-red-400 text-3xl" />}
                  </div>
                  <p className="text-lg font-black text-white">
                    {datosUsuario?.nombre || usuario?.user_metadata?.full_name || usuario?.user_metadata?.name || 'Usuario'}
                  </p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border mt-2 ${rolColor[datosUsuario?.rol] || 'bg-white/5 text-gray-400 border-white/5'}`}>
                    {rolLabel[datosUsuario?.rol] || 'Cliente'}
                  </span>

                  <button onClick={permiso !== 'granted' ? pedirPermiso : undefined}
                    className={`mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                      permiso === 'granted' ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default' :
                      permiso === 'denied'  ? 'bg-red-500/10 text-red-400 border-red-500/20 cursor-default' :
                      'bg-white/5 text-gray-400 border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 cursor-pointer'
                    }`}>
                    {permiso === 'granted' ? <FiBell size={12} /> : <FiBellOff size={12} />}
                    {permiso === 'granted' ? 'Notificaciones activas' :
                     permiso === 'denied'  ? 'Notificaciones bloqueadas' :
                     'Toca para activar notificaciones'}
                  </button>

                  <div className="flex gap-4 mt-5 w-full">
                    {[
                      { valor: historial.length,                                                                                     label: 'Pedidos'     },
                      { valor: historial.filter(p => p.estado === 'entregado').length,                                               label: 'Completados' },
                      { valor: `S/${historial.filter(p => p.estado === 'entregado').reduce((a, p) => a + (p.total || 0), 0).toFixed(0)}`, label: 'Gastado' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/5">
                        <p className="text-red-400 font-black text-xl">{stat.valor}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <p className="font-bold text-white text-sm">Datos de la cuenta</p>
                    {guardadoOk && (
                      <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                        <FiCheck size={12} /> Guardado
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4 border-b border-white/5">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Nombre</p>
                    {editando ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={nombreEdit}
                          onChange={(e) => setNombreEdit(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && guardarNombre()}
                          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-500 transition"
                          autoFocus />
                        <button onClick={guardarNombre} disabled={guardando}
                          className="w-9 h-9 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition active:scale-95">
                          {guardando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheck size={15} />}
                        </button>
                        <button onClick={() => setEditando(false)}
                          className="w-9 h-9 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl flex items-center justify-center transition">
                          <FiX size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">
                          {datosUsuario?.nombre || usuario?.displayName || '—'}
                        </p>
                        <button onClick={iniciarEdicion}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition">
                          <FiEdit2 size={12} /> Editar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-4 border-b border-white/5">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Correo electronico</p>
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                      <p className="text-sm font-semibold text-white">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Tipo de cuenta</p>
                    <div className="flex items-center gap-2">
                      <FiShield className="text-gray-400 flex-shrink-0" size={14} />
                      <p className="text-sm font-semibold text-white">{rolLabel[datosUsuario?.rol] || 'Cliente'}</p>
                    </div>
                  </div>
                </div>

                {/* ══ SEGURIDAD ══ */}
                <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <p className="font-bold text-white text-sm">Seguridad de la cuenta</p>
                    {okPassword && (
                      <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                        <FiCheck size={12} /> Contraseña actualizada
                      </span>
                    )}
                  </div>
                  
                  <div className="px-5 py-4">
                    {usuario?.app_metadata?.provider && usuario?.app_metadata?.provider !== 'email' ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">Contraseña</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Tu cuenta está vinculada a {usuario.app_metadata.provider === 'google' ? 'Google' : usuario.app_metadata.provider}. No requieres contraseña aquí.
                          </p>
                        </div>
                      </div>
                    ) : !editandoPassword ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">Contraseña</p>
                          <p className="text-xs text-gray-500 mt-0.5">Actualiza tu contraseña de acceso</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditandoPassword(true)
                            setErrorPassword('')
                            setNuevaPassword('')
                            setConfirmarNuevaPassword('')
                          }}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition"
                        >
                          Cambiar contraseña
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={cambiarPassword} className="flex flex-col gap-3.5">
                        <p className="text-xs font-bold text-red-400">Actualizar contraseña</p>
                        
                        {errorPassword && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                            {errorPassword}
                          </div>
                        )}

                        {/* Nueva Contraseña */}
                        <div className="relative">
                          <input
                            type={showNuevaPassword ? 'text' : 'password'}
                            placeholder="Nueva contraseña"
                            value={nuevaPassword}
                            onChange={(e) => setNuevaPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-white outline-none focus:border-red-500 transition"
                            required
                          />
                          <span className="absolute left-3 top-3.5 text-gray-500">
                            <FiLock size={14} />
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                          >
                            {showNuevaPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                          </button>
                        </div>

                        {/* Confirmar Nueva Contraseña */}
                        <div className="relative">
                          <input
                            type={showConfirmNuevaPassword ? 'text' : 'password'}
                            placeholder="Confirmar nueva contraseña"
                            value={confirmarNuevaPassword}
                            onChange={(e) => setConfirmarNuevaPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-white outline-none focus:border-red-500 transition"
                            required
                          />
                          <span className="absolute left-3 top-3.5 text-gray-500">
                            <FiLock size={14} />
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowConfirmNuevaPassword(!showConfirmNuevaPassword)}
                            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                          >
                            {showConfirmNuevaPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                          </button>
                        </div>

                        {/* Validaciones de contraseña */}
                        {nuevaPassword.length > 0 && (
                          <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5 flex flex-col gap-1.5">
                            <p className="text-[11px] font-bold text-gray-400">Requisitos de seguridad:</p>
                            {[
                              { key: 'longitud', texto: 'Mínimo 8 caracteres' },
                              { key: 'mayuscula', texto: 'Al menos una mayúscula' },
                              { key: 'numero', texto: 'Al menos un número' },
                              { key: 'especial', texto: 'Al menos un carácter especial (!@#$...)' },
                            ].map((req) => (
                              <div key={req.key} className="flex items-center gap-2">
                                {validacionesPassword[req.key]
                                  ? <FiCheck className="text-green-500 text-xs flex-shrink-0" />
                                  : <FiX className="text-red-400 text-xs flex-shrink-0" />
                                }
                                <span className={`text-xs ${validacionesPassword[req.key] ? 'text-green-500' : 'text-gray-500'}`}>
                                  {req.texto}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={cargandoPassword}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 disabled:opacity-50"
                          >
                            {cargandoPassword ? 'Guardando...' : 'Guardar contraseña'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoPassword(false)}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-xs transition font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                <button onClick={handleCerrarSesion}
                  className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-bold py-3.5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-200 text-sm active:scale-95 shadow-lg">
                  <FiLogOut size={16} />
                  Cerrar sesion
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </>
  )
}

export default Orders
