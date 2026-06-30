import { useEffect, useState, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore'
import {
  FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiClock,
  FiCheckCircle, FiTruck, FiXCircle, FiShoppingBag,
  FiPackage, FiUser, FiEdit2, FiCheck, FiX, FiLogOut,
  FiMail, FiShield, FiBell, FiBellOff, FiStar, FiMessageSquare
} from 'react-icons/fi'

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
      await addDoc(collection(db, 'resenas'), {
        pedidoId:    pedido.id,
        usuarioId,
        calificacion,
        comentario:  comentario.trim(),
        productos:   pedido.productos?.map(p => p.nombre).join(', ') || '',
        total:       pedido.total,
        creadoEn:    serverTimestamp(),
      })
      await updateDoc(doc(db, 'pedidos', pedido.id), { resena: true })
      onGuardado()
    } catch {
      setError('Error al guardar la resena. Intenta de nuevo.')
    }
    setGuardando(false)
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiMessageSquare className="text-yellow-600 flex-shrink-0" size={16} />
          <p className="text-sm font-bold text-yellow-800">Como fue tu experiencia?</p>
        </div>

        {/* Estrellas */}
        <div className="flex flex-col gap-1 mb-3">
          <p className="text-xs text-gray-500 font-semibold">Calificacion</p>
          <Estrellas valor={calificacion} onChange={setCalificacion} size={28} />
          {calificacion > 0 && (
            <p className="text-xs text-yellow-700 font-semibold mt-0.5">
              {calificacion === 1 ? 'Muy malo' :
               calificacion === 2 ? 'Malo' :
               calificacion === 3 ? 'Regular' :
               calificacion === 4 ? 'Bueno' : 'Excelente'}
            </p>
          )}
        </div>

        {/* Comentario */}
        <div className="flex flex-col gap-1 mb-3">
          <p className="text-xs text-gray-500 font-semibold">Comentario (opcional)</p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuentanos como estuvo tu pedido..."
            rows={2}
            maxLength={200}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-yellow-400 transition resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{comentario.length}/200</p>
        </div>

        {error && <p className="text-xs text-red-500 font-semibold mb-2">{error}</p>}

        <button
          onClick={handleEnviar}
          disabled={guardando}
          className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {guardando
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><FiStar size={14} /> Enviar resena</>}
        </button>
      </div>
    </div>
  )
}

// ── Reseña guardada ────────────────────────────────────────
function ResenaGuardada({ resena }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tu resena</p>
          <Estrellas valor={resena.calificacion} readonly size={14} />
        </div>
        {resena.comentario && (
          <p className="text-xs text-gray-600 leading-relaxed">{resena.comentario}</p>
        )}
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────
function Orders() {
  const { carrito, actualizarCantidad, eliminarProducto, vaciarCarrito, total } = useCart()
  const { usuario, datosUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const [vistaActiva, setVistaActiva] = useState('carrito')
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

  // ── Listener pedidos ──
  useEffect(() => {
    if (!usuario) return
    const q = query(collection(db, 'pedidos'), where('usuarioId', '==', usuario.uid))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const ordenado = data.sort((a, b) => b.creadoEn?.seconds - a.creadoEn?.seconds)

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
    })
    return unsub
  }, [usuario])

  // ── Listener reseñas del usuario ──
  useEffect(() => {
    if (!usuario) return
    const q = query(collection(db, 'resenas'), where('usuarioId', '==', usuario.uid))
    const unsub = onSnapshot(q, (snap) => {
      const mapa = {}
      snap.docs.forEach(d => { mapa[d.data().pedidoId] = { id: d.id, ...d.data() } })
      setResenas(mapa)
    })
    return unsub
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
      const { addDoc: addDocFb } = await import('firebase/firestore')
      await addDocFb(collection(db, 'pedidos'), {
        usuarioId:    usuario.uid,
        usuarioEmail: usuario.email,
        productos: carrito.map((item) => ({
          id: item.id, nombre: item.nombre, precio: item.precio,
          cantidad: item.cantidad, opcion: item.opcion,
          complemento: item.complemento?.nombre || null, extra: item.extra,
        })),
        total:    parseFloat(total.toFixed(2)),
        estado:   'pendiente',
        resena:   false,
        creadoEn: new Date(),
      })
      vaciarCarrito()
      setVistaActiva('historial')
    } catch {
      alert('Error al confirmar el pedido. Intenta de nuevo.')
    }
  }

  const iniciarEdicion = () => {
    setNombreEdit(datosUsuario?.nombre || usuario?.displayName || '')
    setEditando(true)
    setGuardadoOk(false)
  }

  const guardarNombre = async () => {
    if (!nombreEdit.trim()) return
    setGuardando(true)
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), { nombre: nombreEdit.trim() })
      setGuardadoOk(true)
      setEditando(false)
      setTimeout(() => setGuardadoOk(false), 2500)
    } catch { alert('Error al guardar.') }
    setGuardando(false)
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
  const rolColor = { admin: 'bg-yellow-100 text-yellow-700', empleado: 'bg-blue-100 text-blue-700', cocina: 'bg-orange-100 text-orange-700', usuario: 'bg-green-100 text-green-700' }

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

      <div className="min-h-screen bg-gray-50 pb-32 orders-page">

        {/* Header */}
        <div className="bg-red-700 px-4 py-4 text-white flex items-center justify-between">
          <div className="w-8" />
          <h1 className="text-xl font-bold">Mis Pedidos</h1>
          <button onClick={pedirPermiso}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${permiso === 'granted' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}>
            {permiso === 'granted' ? <FiBell size={16} /> : <FiBellOff size={16} />}
          </button>
        </div>

        {/* Banner notificaciones */}
        {permiso === 'default' && usuario && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiBell className="text-red-500 flex-shrink-0" size={15} />
              <p className="text-xs font-semibold text-red-700">Activa las notificaciones para saber cuando tu pedido esta listo</p>
            </div>
            <button onClick={pedirPermiso}
              className="flex-shrink-0 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-700 transition">
              Activar
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-3 bg-white shadow-sm sticky top-0 z-10 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setVistaActiva(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap flex-shrink-0 ${
                vistaActiva === tab.id ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ CARRITO ══ */}
        {vistaActiva === 'carrito' && (
          <>
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center max-w-sm w-full">
                  <FiShoppingCart className="text-gray-300 text-6xl mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Tu carrito esta vacio</h2>
                  <p className="text-gray-400 text-sm text-center mb-6">Agrega productos desde nuestro menu</p>
                  <button onClick={() => navigate('/menu')}
                    className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition shadow-md">
                    Ver menu
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
                {carrito.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.nombre}</p>
                      {item.opcion && <p className="text-xs text-gray-400 mt-0.5">{item.opcion}</p>}
                      {item.complemento && <p className="text-xs text-gray-400">{item.complemento.nombre}</p>}
                      <p className="text-red-600 font-bold text-sm mt-1">
                        S/ {((item.precio + item.extra) * item.cantidad).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1">
                          <button onClick={() => actualizarCantidad(item.id, item.opcion, item.complemento, item.cantidad - 1)}
                            className="text-gray-600 hover:text-red-600 transition"><FiMinus size={12} /></button>
                          <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.cantidad}</span>
                          <button onClick={() => actualizarCantidad(item.id, item.opcion, item.complemento, item.cantidad + 1)}
                            className="text-gray-600 hover:text-red-600 transition"><FiPlus size={12} /></button>
                        </div>
                        <button onClick={() => eliminarProducto(item.id, item.opcion, item.complemento)}
                          className="text-gray-400 hover:text-red-600 transition"><FiTrash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Resumen del pedido</h3>
                  <div className="flex flex-col gap-2">
                    {carrito.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-500">
                        <span>{item.nombre} x{item.cantidad}</span>
                        <span>S/ {((item.precio + item.extra) * item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900 text-sm">Total</span>
                      <span className="font-bold text-red-600 text-sm">S/ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {carrito.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
                <button onClick={handleConfirmar}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition shadow-md active:scale-95">
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center">
                <FiPackage className="text-gray-300 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Inicia sesion</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Para ver tu historial de pedidos</p>
                <button onClick={() => navigate('/login')}
                  className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition">
                  Iniciar sesion
                </button>
              </div>
            ) : cargando ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : historial.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center">
                <FiPackage className="text-gray-300 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Sin pedidos aun</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Haz tu primer pedido ahora</p>
                <button onClick={() => navigate('/menu')}
                  className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition">
                  Ver menu
                </button>
              </div>
            ) : (
              historial.map((pedido) => {
                const resenaExistente = resenas[pedido.id]
                const resenaLocal    = resenasEnviadas[pedido.id]
                const puedeResena    = pedido.estado === 'entregado' && !resenaExistente && !resenaLocal

                return (
                  <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Pedido #{pedido.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{pedido.creadoEn?.toDate().toLocaleString('es-PE')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold">S/ {pedido.total?.toFixed(2)}</p>
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
                                estadoPasos.indexOf(pedido.estado) >= i ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>{i + 1}</div>
                              {i < estadoPasos.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 rounded ${
                                  estadoPasos.indexOf(pedido.estado) > i ? 'bg-red-600' : 'bg-gray-200'
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
                    <div className="border-t border-gray-100 pt-3">
                      {pedido.productos?.map((prod, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                          <span>{prod.nombre} x{prod.cantidad} {prod.opcion ? `(${prod.opcion})` : ''}</span>
                          <span>S/ {((prod.precio + (prod.extra || 0)) * prod.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Confirmar recepcion */}
                    {pedido.estado === 'listo' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-green-700 text-center">
                            Tu pedido esta listo. Confirma cuando lo hayas recibido.
                          </p>
                        </div>
                        <button
                          onClick={() => updateDoc(doc(db, 'pedidos', pedido.id), { estado: 'entregado' })}
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
                        usuarioId={usuario.uid}
                        onGuardado={() => setResenasEnviadas(prev => ({ ...prev, [pedido.id]: true }))}
                      />
                    )}

                    {/* Reseña ya enviada */}
                    {(resenaExistente || resenaLocal) && pedido.estado === 'entregado' && (
                      resenaExistente
                        ? <ResenaGuardada resena={resenaExistente} />
                        : (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
                              <FiCheckCircle className="text-green-600 flex-shrink-0" size={15} />
                              <p className="text-xs font-bold text-green-700">Resena enviada. Gracias por tu opinion.</p>
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center">
                <FiUser className="text-gray-300 text-6xl mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Inicia sesion</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Para ver tu perfil</p>
                <button onClick={() => navigate('/login')}
                  className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition">
                  Iniciar sesion
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center overflow-hidden mb-4">
                    {usuario.photoURL
                      ? <img src={usuario.photoURL} alt="foto" className="w-full h-full object-cover" />
                      : <FiUser className="text-red-500 text-3xl" />}
                  </div>
                  <p className="text-lg font-black text-gray-900">
                    {datosUsuario?.nombre || usuario?.displayName || 'Usuario'}
                  </p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full mt-2 ${rolColor[datosUsuario?.rol] || 'bg-gray-100 text-gray-600'}`}>
                    {rolLabel[datosUsuario?.rol] || 'Cliente'}
                  </span>

                  <button onClick={permiso !== 'granted' ? pedirPermiso : undefined}
                    className={`mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                      permiso === 'granted' ? 'bg-green-50 text-green-600 cursor-default' :
                      permiso === 'denied'  ? 'bg-red-50 text-red-500 cursor-default' :
                      'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 cursor-pointer'
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
                      <div key={stat.label} className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-red-600 font-black text-xl">{stat.valor}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-sm">Datos de la cuenta</p>
                    {guardadoOk && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <FiCheck size={12} /> Guardado
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Nombre</p>
                    {editando ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={nombreEdit}
                          onChange={(e) => setNombreEdit(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && guardarNombre()}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-red-400 transition"
                          autoFocus />
                        <button onClick={guardarNombre} disabled={guardando}
                          className="w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition active:scale-95">
                          {guardando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheck size={15} />}
                        </button>
                        <button onClick={() => setEditando(false)}
                          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center transition">
                          <FiX size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          {datosUsuario?.nombre || usuario?.displayName || '—'}
                        </p>
                        <button onClick={iniciarEdicion}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold transition">
                          <FiEdit2 size={12} /> Editar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Correo electronico</p>
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                      <p className="text-sm font-semibold text-gray-900">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Tipo de cuenta</p>
                    <div className="flex items-center gap-2">
                      <FiShield className="text-gray-400 flex-shrink-0" size={14} />
                      <p className="text-sm font-semibold text-gray-900">{rolLabel[datosUsuario?.rol] || 'Cliente'}</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleCerrarSesion}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-700 hover:text-red-600 font-bold py-3.5 rounded-2xl transition-all duration-200 text-sm shadow-sm">
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
