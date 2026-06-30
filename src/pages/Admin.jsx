import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/supabaseClient'
import {
  FiShoppingBag, FiUsers, FiClock, FiCheckCircle,
  FiXCircle, FiTruck, FiDollarSign, FiList,
  FiLogOut, FiHome, FiMenu, FiX, FiBarChart2,
  FiTrendingUp, FiAward, FiStar
} from 'react-icons/fi'
import lesq from '../assets/lesq.png'

// ── Barra de gráfico simple ────────────────────────────────
function Barra({ label, valor, max, color = '#e63946', prefix = '', suffix = '' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-gray-500 w-24 flex-shrink-0 truncate">{label}</p>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-xs font-bold text-gray-900 w-20 text-right flex-shrink-0">
        {prefix}{typeof valor === 'number' ? valor.toFixed(valor % 1 !== 0 ? 2 : 0) : valor}{suffix}
      </p>
    </div>
  )
}

function Admin() {
  const { usuario, datosUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos]         = useState([])
  const [usuarios, setUsuarios]       = useState([])
  const [resenas, setResenas]         = useState([])
  const [vistaActiva, setVistaActiva] = useState('dashboard')
  const [cargando, setCargando]       = useState(true)
  const [autorizado, setAutorizado]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [periodoReporte, setPeriodoReporte] = useState('7') // días

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    if (datosUsuario === undefined || datosUsuario === null) return
    if (datosUsuario.rol === 'admin') setAutorizado(true)
    else navigate('/')
  }, [usuario, datosUsuario])

  useEffect(() => {
    if (!autorizado) return

    const fetchPedidos = async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
      if (data) {
        setPedidos(data.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en)))
        setCargando(false)
      }
    }

    const fetchUsuarios = async () => {
      const { data } = await supabase.from('usuarios').select('*')
      if (data) setUsuarios(data)
    }

    const fetchResenas = async () => {
      const { data } = await supabase.from('resenas').select('*')
      if (data) setResenas(data)
    }

    fetchPedidos()
    fetchUsuarios()
    fetchResenas()

    const subPedidos = supabase
      .channel('admin-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchPedidos()
      })
      .subscribe()

    const subUsuarios = supabase
      .channel('admin-usuarios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => {
        fetchUsuarios()
      })
      .subscribe()

    const subResenas = supabase
      .channel('admin-resenas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resenas' }, () => {
        fetchResenas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subPedidos)
      supabase.removeChannel(subUsuarios)
      supabase.removeChannel(subResenas)
    }
  }, [autorizado])

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', pedidoId)
  }

  // ── Stats base ──
  const pedidosHoy = pedidos.filter((p) => {
    const f = p.creado_en ? new Date(p.creado_en) : null
    return f && f.toDateString() === new Date().toDateString()
  })
  const totalHoy        = pedidosHoy.reduce((acc, p) => acc + (p.total || 0), 0)
  const totalGeneral    = pedidos.reduce((acc, p) => acc + (p.total || 0), 0)
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const pedidosPreparando = pedidos.filter(p => p.estado === 'preparando').length

  // ── Datos para reportes ──
  const ahora    = new Date()
  const diasAtras = parseInt(periodoReporte)

  const pedidosEnPeriodo = pedidos.filter(p => {
    const f = p.creado_en ? new Date(p.creado_en) : null
    if (!f) return false
    const diff = (ahora - f) / (1000 * 60 * 60 * 24)
    return diff <= diasAtras
  })

  // Ventas por día (últimos N días)
  const ventasPorDia = (() => {
    const mapa = {}
    for (let i = diasAtras - 1; i >= 0; i--) {
      const d = new Date(ahora)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
      mapa[key] = 0
    }
    pedidosEnPeriodo.filter(p => p.estado !== 'cancelado').forEach(p => {
      const key = p.creado_en ? new Date(p.creado_en).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) : null
      if (key && mapa[key] !== undefined) mapa[key] += p.total || 0
    })
    return Object.entries(mapa).map(([dia, total]) => ({ dia, total }))
  })()

  const maxVentaDia = Math.max(...ventasPorDia.map(v => v.total), 1)

  // Productos más vendidos
  const productosMasVendidos = (() => {
    const mapa = {}
    pedidosEnPeriodo.forEach(p => {
      p.productos?.forEach(prod => {
        if (!mapa[prod.nombre]) mapa[prod.nombre] = { cantidad: 0, total: 0 }
        mapa[prod.nombre].cantidad += prod.cantidad || 1
        mapa[prod.nombre].total   += (prod.precio || 0) * (prod.cantidad || 1)
      })
    })
    return Object.entries(mapa)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8)
  })()

  const maxProducto = Math.max(...productosMasVendidos.map(p => p.cantidad), 1)

  // Pedidos por hora del día
  const pedidosPorHora = (() => {
    const mapa = {}
    for (let h = 0; h < 24; h++) mapa[h] = 0
    pedidosEnPeriodo.forEach(p => {
      const h = p.creado_en ? new Date(p.creado_en).getHours() : undefined
      if (h !== undefined) mapa[h]++
    })
    // Solo horas con pedidos o entre 10am-11pm
    return Object.entries(mapa)
      .filter(([h]) => parseInt(h) >= 10 && parseInt(h) <= 23)
      .map(([hora, count]) => ({
        hora: `${hora.padStart(2, '0')}:00`,
        count
      }))
  })()

  const maxHora = Math.max(...pedidosPorHora.map(h => h.count), 1)

  // Tasa de completados
  const totalPeriodo     = pedidosEnPeriodo.length
  const completadosPeriodo = pedidosEnPeriodo.filter(p => p.estado === 'entregado').length
  const canceladosPeriodo  = pedidosEnPeriodo.filter(p => p.estado === 'cancelado').length
  const tasaCompletados    = totalPeriodo > 0 ? Math.round((completadosPeriodo / totalPeriodo) * 100) : 0

  // Ticket promedio
  const ticketPromedio = completadosPeriodo > 0
    ? pedidosEnPeriodo.filter(p => p.estado === 'entregado').reduce((a, p) => a + (p.total || 0), 0) / completadosPeriodo
    : 0

  // Reseñas
  const promedioResenas = resenas.length > 0
    ? resenas.reduce((a, r) => a + (r.calificacion || 0), 0) / resenas.length
    : 0

  // ── Colors ──
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: <FiHome />      },
    { id: 'reportes',  label: 'Reportes',   icon: <FiBarChart2 /> },
    { id: 'pedidos',   label: 'Pedidos',    icon: <FiList />      },
    { id: 'usuarios',  label: 'Usuarios',   icon: <FiUsers />     },
  ]

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 min-h-screen flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          {sidebarOpen && <img src={lesq} alt="L'ESQ" className="h-8 object-contain" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-xs text-gray-400">Bienvenido,</p>
            <p className="text-white font-bold text-sm truncate">{datosUsuario?.nombre || usuario?.email}</p>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Admin</span>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setVistaActiva(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-semibold w-full ${
                vistaActiva === item.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-gray-700">
          <button onClick={() => { cerrarSesion(); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm font-semibold w-full">
            <FiLogOut className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">{vistaActiva}</h1>
            <p className="text-xs text-gray-400">Panel de administracion — La Esquina</p>
          </div>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="p-6">

          {/* ══ DASHBOARD ══ */}
          {vistaActiva === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Ventas hoy',   valor: `S/ ${totalHoy.toFixed(2)}`, icon: <FiDollarSign />, light: 'bg-red-50 text-red-600'    },
                  { label: 'Pedidos hoy',  valor: pedidosHoy.length,            icon: <FiShoppingBag />,light: 'bg-blue-50 text-blue-600'   },
                  { label: 'Pendientes',   valor: pedidosPendientes,             icon: <FiClock />,      light: 'bg-yellow-50 text-yellow-600'},
                  { label: 'Preparando',   valor: pedidosPreparando,             icon: <FiList />,       light: 'bg-green-50 text-green-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div className={`${stat.light} p-3 rounded-xl text-xl`}>{stat.icon}</div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Resumen general</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Total de pedidos',    valor: pedidos.length },
                      { label: 'Total de ventas',     valor: `S/ ${totalGeneral.toFixed(2)}` },
                      { label: 'Usuarios registrados',valor: usuarios.length },
                      { label: 'Pedidos entregados',  valor: pedidos.filter(p => p.estado === 'entregado').length },
                      { label: 'Pedidos cancelados',  valor: pedidos.filter(p => p.estado === 'cancelado').length },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{item.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Ultimos pedidos</h3>
                  <div className="flex flex-col gap-2">
                    {pedidos.slice(0, 5).map((pedido) => (
                      <div key={pedido.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{pedido.usuarioEmail}</p>
                          <p className="text-xs text-gray-400">{pedido.creado_en ? new Date(pedido.creado_en).toLocaleString('es-PE') : '—'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-600">S/ {pedido.total?.toFixed(2)}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${estadoColor[pedido.estado]}`}>{pedido.estado}</span>
                        </div>
                      </div>
                    ))}
                    {pedidos.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No hay pedidos aun</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Estado de pedidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'].map((estado) => {
                    const count = pedidos.filter(p => p.estado === estado).length
                    return (
                      <div key={estado} className={`${estadoColor[estado]} rounded-xl p-4 text-center`}>
                        <div className="flex justify-center text-2xl mb-1">{estadoIcono[estado]}</div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs font-semibold capitalize">{estado}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ REPORTES ══ */}
          {vistaActiva === 'reportes' && (
            <div className="flex flex-col gap-6">

              {/* Selector de periodo */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Reportes y analiticas</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Datos calculados en tiempo real desde Firestore</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: '7 dias',  val: '7'  },
                    { label: '15 dias', val: '15' },
                    { label: '30 dias', val: '30' },
                  ].map((op) => (
                    <button key={op.val} onClick={() => setPeriodoReporte(op.val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        periodoReporte === op.val ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}>
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPIs del periodo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Pedidos en periodo', valor: totalPeriodo,
                    icon: <FiShoppingBag size={18} />, color: 'bg-blue-50 text-blue-600',
                  },
                  {
                    label: 'Ventas en periodo',
                    valor: `S/ ${pedidosEnPeriodo.filter(p => p.estado !== 'cancelado').reduce((a, p) => a + (p.total || 0), 0).toFixed(2)}`,
                    icon: <FiDollarSign size={18} />, color: 'bg-red-50 text-red-600',
                  },
                  {
                    label: 'Ticket promedio', valor: `S/ ${ticketPromedio.toFixed(2)}`,
                    icon: <FiTrendingUp size={18} />, color: 'bg-green-50 text-green-600',
                  },
                  {
                    label: 'Tasa de completados', valor: `${tasaCompletados}%`,
                    icon: <FiCheckCircle size={18} />, color: 'bg-purple-50 text-purple-600',
                  },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className={`${kpi.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                      {kpi.icon}
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-gray-900">{kpi.valor}</p>
                  </div>
                ))}
              </div>

              {/* Ventas por día */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Ventas por dia</h3>
                    <p className="text-xs text-gray-400">Ultimos {periodoReporte} dias — pedidos no cancelados</p>
                  </div>
                  <FiBarChart2 className="text-gray-300" size={20} />
                </div>
                <div className="flex flex-col gap-3">
                  {ventasPorDia.map((v) => (
                    <Barra key={v.dia} label={v.dia} valor={v.total} max={maxVentaDia} prefix="S/ " color="#e63946" />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Productos más vendidos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Productos mas vendidos</h3>
                      <p className="text-xs text-gray-400">Por unidades vendidas</p>
                    </div>
                    <FiAward className="text-gray-300" size={20} />
                  </div>
                  {productosMasVendidos.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">Sin datos en este periodo</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {productosMasVendidos.map((p, i) => (
                        <div key={p.nombre}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-black w-5 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                              #{i + 1}
                            </span>
                            <Barra label={p.nombre} valor={p.cantidad} max={maxProducto} suffix=" und" color={i === 0 ? '#f59e0b' : '#e63946'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Horas pico */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Horas pico</h3>
                      <p className="text-xs text-gray-400">Pedidos por hora del dia</p>
                    </div>
                    <FiClock className="text-gray-300" size={20} />
                  </div>
                  {pedidosPorHora.every(h => h.count === 0) ? (
                    <p className="text-xs text-gray-400 text-center py-6">Sin datos en este periodo</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {pedidosPorHora.map((h) => (
                        <Barra key={h.hora} label={h.hora} valor={h.count} max={maxHora} suffix=" ped" color="#3b82f6" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resenas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Resenas de clientes</h3>
                    <p className="text-xs text-gray-400">{resenas.length} resenas en total</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-400 fill-yellow-400" size={16} style={{ fill: '#facc15' }} />
                    <span className="text-sm font-bold text-gray-900">{promedioResenas.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">/ 5.0</span>
                  </div>
                </div>

                {/* Distribución de estrellas */}
                <div className="flex flex-col gap-2 mb-5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = resenas.filter(r => r.calificacion === stars).length
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                          {[...Array(stars)].map((_, i) => (
                            <FiStar key={i} size={10} className="text-yellow-400" style={{ fill: '#facc15' }} />
                          ))}
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: resenas.length > 0 ? `${(count / resenas.length) * 100}%` : '0%' }} />
                        </div>
                        <p className="text-xs font-bold text-gray-500 w-6 text-right">{count}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Últimas reseñas */}
                {resenas.length > 0 && (
                  <>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Ultimas resenas</p>
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                      {[...resenas]
                        .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
                        .slice(0, 10)
                        .map((r) => (
                          <div key={r.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <FiStar key={s} size={12}
                                    className={s <= r.calificacion ? 'text-yellow-400' : 'text-gray-300'}
                                    style={{ fill: s <= r.calificacion ? '#facc15' : 'none' }} />
                                ))}
                              </div>
                              <p className="text-xs text-gray-400">
                                {r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-PE') : '—'}
                              </p>
                            </div>
                            {r.comentario && (
                              <p className="text-xs text-gray-600 leading-relaxed">{r.comentario}</p>
                            )}
                            {r.productos && (
                              <p className="text-xs text-gray-400 mt-1 truncate">Pidio: {r.productos}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>

              {/* Resumen de estados en el periodo */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Estados en el periodo</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'].map((estado) => {
                    const count = pedidosEnPeriodo.filter(p => p.estado === estado).length
                    return (
                      <div key={estado} className={`${estadoColor[estado]} rounded-xl p-4 text-center`}>
                        <div className="flex justify-center text-xl mb-1">{estadoIcono[estado]}</div>
                        <p className="text-xl font-bold">{count}</p>
                        <p className="text-xs font-semibold capitalize">{estado}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ══ PEDIDOS ══ */}
          {vistaActiva === 'pedidos' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">Todos los pedidos</h2>
                <span className="text-sm text-gray-400">{pedidos.length} pedidos en total</span>
              </div>
              {cargando ? (
                <p className="text-center text-gray-400 py-10">Cargando...</p>
              ) : pedidos.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No hay pedidos aun</p>
              ) : (
                pedidos.map((pedido) => (
                  <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">#{pedido.id.slice(0, 8)}</p>
                        <p className="text-sm font-bold text-gray-900">{pedido.usuarioEmail}</p>
                        <p className="text-xs text-gray-400">{pedido.creado_en ? new Date(pedido.creado_en).toLocaleString('es-PE') : '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold">S/ {pedido.total?.toFixed(2)}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 ${estadoColor[pedido.estado]}`}>
                          {estadoIcono[pedido.estado]} {pedido.estado}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 mb-3">
                      {pedido.productos?.map((prod, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                          <span>{prod.nombre} x{prod.cantidad} {prod.opcion ? `(${prod.opcion})` : ''}</span>
                          <span>S/ {((prod.precio + (prod.extra || 0)) * prod.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'].map((estado) => (
                        <button key={estado} onClick={() => cambiarEstado(pedido.id, estado)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                            pedido.estado === estado ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {estado}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ══ USUARIOS ══ */}
          {vistaActiva === 'usuarios' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">Usuarios registrados</h2>
                <span className="text-sm text-gray-400">{usuarios.length} usuarios</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Usuario</th>
                      <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Correo</th>
                      <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Rol</th>
                      <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {usuarios.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                              {user.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{user.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            user.rol === 'admin' ? 'bg-red-100 text-red-600' :
                            user.rol === 'empleado' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>{user.rol}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {user.creado_en ? new Date(user.creado_en).toLocaleDateString('es-PE') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Admin