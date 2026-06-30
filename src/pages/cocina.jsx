import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import {
  FiClock, FiCheckCircle, FiLogOut, FiMenu, FiX,
  FiTruck
} from 'react-icons/fi'
import { MdOutlineRestaurantMenu } from 'react-icons/md'
import { GiCook } from 'react-icons/gi'
import lesq from '../assets/lesq.png'

function Cocina() {
  const { usuario, datosUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos]         = useState([])
  const [autorizado, setAutorizado]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filtro, setFiltro]           = useState('pendiente')
  const [horaActual, setHoraActual]   = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    if (datosUsuario === undefined || datosUsuario === null) return
    if (['admin', 'empleado', 'cocina'].includes(datosUsuario.rol)) {
      setAutorizado(true)
    } else {
      navigate('/')
    }
  }, [usuario, datosUsuario])

  useEffect(() => {
    if (!autorizado) return
    const unsub = onSnapshot(collection(db, 'pedidos'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setPedidos(data.sort((a, b) => a.creadoEn?.seconds - b.creadoEn?.seconds))
    })
    return unsub
  }, [autorizado])

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    await updateDoc(doc(db, 'pedidos', pedidoId), { estado: nuevoEstado })
  }

  const pedidosFiltrados = pedidos.filter((p) =>
    filtro === 'todos'
      ? p.estado !== 'entregado' && p.estado !== 'cancelado'
      : p.estado === filtro
  )

  const tiempoTranscurrido = (fecha) => {
    if (!fecha) return '—'
    const diff = Math.floor((new Date() - fecha.toDate()) / 60000)
    if (diff < 1) return 'Ahora'
    if (diff === 1) return '1 min'
    return `${diff} min`
  }

  const colorTiempo = (fecha) => {
    if (!fecha) return 'text-gray-400'
    const diff = Math.floor((new Date() - fecha.toDate()) / 60000)
    if (diff < 5) return 'text-green-400'
    if (diff < 10) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-950 min-h-screen flex flex-col transition-all duration-300 flex-shrink-0 border-r border-gray-800`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          {sidebarOpen && <img src={lesq} alt="L'ESQ" className="h-8 object-contain" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-xs text-gray-500">Panel de</p>
            <p className="text-white font-bold text-sm">Cocina</p>
            <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">Chef</span>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {[
            { id: 'pendiente',  label: 'Pendientes', icon: <FiClock />,                  count: pedidos.filter(p => p.estado === 'pendiente').length,  color: 'text-yellow-400' },
            { id: 'preparando', label: 'Preparando', icon: <MdOutlineRestaurantMenu />,   count: pedidos.filter(p => p.estado === 'preparando').length, color: 'text-blue-400'   },
            { id: 'listo',      label: 'Listos',     icon: <FiCheckCircle />,             count: pedidos.filter(p => p.estado === 'listo').length,      color: 'text-green-400' },
            { id: 'todos',      label: 'Todos activos', icon: <GiCook />,                 count: pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado').length, color: 'text-gray-400' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltro(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-semibold w-full ${
                filtro === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className={`text-lg flex-shrink-0 ${filtro === item.id ? 'text-white' : item.color}`}>{item.icon}</span>
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    filtro === item.id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-300'
                  }`}>
                    {item.count}
                  </span>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-gray-800">
          <button
            onClick={() => { cerrarSesion(); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm font-semibold w-full"
          >
            <FiLogOut className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto">

        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Cocina</h1>
            <p className="text-xs text-gray-500">Gestion de pedidos en tiempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-bold text-lg">
                {horaActual.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-gray-500 text-xs">
                {horaActual.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">En linea</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {[
            { label: 'Pendientes',     count: pedidos.filter(p => p.estado === 'pendiente').length,  color: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Preparando',     count: pedidos.filter(p => p.estado === 'preparando').length, color: 'border-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-500/10'   },
            { label: 'Listos',         count: pedidos.filter(p => p.estado === 'listo').length,      color: 'border-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10'  },
            { label: 'Entregados hoy', count: pedidos.filter(p => p.estado === 'entregado').length,  color: 'border-gray-500',   text: 'text-gray-400',   bg: 'bg-gray-500/10'   },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.color} rounded-2xl p-4 text-center`}>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.text}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Lista de pedidos */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white capitalize">
              {filtro === 'todos' ? 'Todos los pedidos activos' : `Pedidos ${filtro}`}
            </h2>
            <span className="text-sm text-gray-500">{pedidosFiltrados.length} pedidos</span>
          </div>

          {pedidosFiltrados.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-10 text-center border border-gray-700">
              <GiCook className="text-gray-600 text-5xl mx-auto mb-3" />
              <p className="text-gray-500">No hay pedidos en esta categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido.id}
                  className={`rounded-2xl overflow-hidden border ${
                    pedido.estado === 'pendiente'  ? 'border-yellow-500/50 bg-yellow-500/5' :
                    pedido.estado === 'preparando' ? 'border-blue-500/50 bg-blue-500/5'    :
                    'border-green-500/50 bg-green-500/5'
                  }`}
                >
                  {/* Cabecera pedido */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">#{pedido.id.slice(0, 8)}</p>
                      <p className="text-white font-bold text-sm">{pedido.mesa || 'Pedido online'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${colorTiempo(pedido.creadoEn)}`}>
                        {tiempoTranscurrido(pedido.creadoEn)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pedido.creadoEn?.toDate().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    {pedido.productos?.map((prod, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {prod.cantidad}
                          </span>
                          <span className="text-white text-sm font-medium">{prod.nombre}</span>
                        </div>
                        {prod.opcion && (
                          <span className="text-xs text-gray-500">({prod.opcion})</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="px-4 py-3 flex gap-2">
                    {pedido.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'preparando')}
                        className="flex-1 bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 transition"
                      >
                        Iniciar preparacion
                      </button>
                    )}

                    {pedido.estado === 'preparando' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'listo')}
                        className="flex-1 bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <FiTruck size={15} />
                        Listo para entregar
                      </button>
                    )}

                    {pedido.estado === 'listo' && (
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="bg-green-500/20 text-green-400 text-sm font-bold py-2 rounded-xl text-center border border-green-500/30">
                          Esperando confirmacion del cliente
                        </div>
                        {/* El admin también puede marcar como entregado manualmente */}
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'entregado')}
                          className="flex-1 bg-gray-700 text-gray-300 text-xs font-bold py-2 rounded-xl hover:bg-gray-600 transition"
                        >
                          Marcar entregado manualmente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Cocina