import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase/supabaseClient'
import {
  FiShoppingBag, FiUsers, FiClock, FiCheckCircle,
  FiXCircle, FiTruck, FiDollarSign, FiList,
  FiLogOut, FiHome, FiMenu, FiX, FiBarChart2,
  FiTrendingUp, FiAward, FiStar, FiPackage,
  FiSettings, FiEdit2, FiTrash2, FiPlus, FiToggleLeft,
  FiToggleRight, FiSave, FiAlertCircle
} from 'react-icons/fi'
import lesq from '../assets/lesq.png'

function Barra({ label, valor, max, color = '#e63946', prefix = '', suffix = '' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-gray-500 w-28 flex-shrink-0 truncate">{label}</p>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs font-bold text-gray-900 w-20 text-right flex-shrink-0">
        {prefix}{typeof valor === 'number' ? valor.toFixed(valor % 1 !== 0 ? 2 : 0) : valor}{suffix}
      </p>
    </div>
  )
}

const CATEGORIAS = ['Hamburguesas', 'Alitas', 'Pollo a la Brasa', 'Salchis Salchis', 'Especiales', 'Combos', 'Bebidas', 'Postres']

const FORM_VACIO = { nombre: '', precio: '', categoria: 'Hamburguesas', descripcion: '', imagen_url: '', tag: '', disponible: true }

function Admin() {
  const { usuario, datosUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const [pedidos, setPedidos]     = useState([])
  const [usuarios, setUsuarios]   = useState([])
  const [resenas, setResenas]     = useState([])
  const [productos, setProductos] = useState([])
  const [config, setConfig]       = useState({
    nombre: 'La Esquina',
    telefono: '',
    direccion: '',
    horario: '',
    descripcion: '',
    delivery_costo: 5,
    delivery_gratis_desde: 50,
    delivery_coordinar: false,
    mercado_pago_activo: false,
    mercado_pago_public_key: '',
    mercado_pago_access_token: ''
  })
  const [tablaExiste, setTablaExiste] = useState(true)

  const [vistaActiva, setVistaActiva]     = useState('dashboard')
  const [cargando, setCargando]           = useState(true)
  const [autorizado, setAutorizado]       = useState(false)
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [periodoReporte, setPeriodoReporte] = useState('7')

  const [modalProducto, setModalProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [form, setForm]                   = useState(FORM_VACIO)
  const [guardando, setGuardando]         = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [guardandoConfig, setGuardandoConfig] = useState(false)
  const [configGuardada, setConfigGuardada]   = useState(false)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    if (datosUsuario === undefined || datosUsuario === null) return
    if (datosUsuario.rol === 'admin') setAutorizado(true)
    else navigate('/')
  }, [usuario, datosUsuario])

  useEffect(() => {
    if (!autorizado) return
    fetchTodo()

    const subPedidos = supabase.channel('admin-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetchPedidos)
      .subscribe()
    const subUsuarios = supabase.channel('admin-usuarios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, fetchUsuarios)
      .subscribe()
    const subProductos = supabase.channel('admin-productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, fetchProductos)
      .subscribe()

    return () => {
      supabase.removeChannel(subPedidos)
      supabase.removeChannel(subUsuarios)
      supabase.removeChannel(subProductos)
    }
  }, [autorizado])

  const fetchTodo = () => { fetchPedidos(); fetchUsuarios(); fetchResenas(); fetchProductos(); fetchConfig() }

  const fetchPedidos = async () => {
    const { data } = await supabase.from('pedidos').select('*')
    if (data) { setPedidos(data.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))); setCargando(false) }
  }
  const fetchUsuarios  = async () => { const { data } = await supabase.from('usuarios').select('*'); if (data) setUsuarios(data) }
  const fetchResenas   = async () => { const { data } = await supabase.from('resenas').select('*'); if (data) setResenas(data) }
  const fetchProductos = async () => { const { data } = await supabase.from('productos').select('*').order('creado_en', { ascending: false }); if (data) setProductos(data) }
  const fetchConfig    = async () => {
    try {
      const { data, error } = await supabase.from('configuracion').select('*').maybeSingle()
      if (error) {
        if (error.code === '42P01' || error.message.includes('relation "public.configuracion" does not exist')) {
          setTablaExiste(false)
        }
        throw error
      }
      if (data) {
        setConfig({
          ...data,
          delivery_costo: data.delivery_costo !== undefined && data.delivery_costo !== null ? parseFloat(data.delivery_costo) : 5,
          delivery_gratis_desde: data.delivery_gratis_desde !== undefined && data.delivery_gratis_desde !== null ? parseFloat(data.delivery_gratis_desde) : 50,
          delivery_coordinar: !!data.delivery_coordinar,
          mercado_pago_activo: !!data.mercado_pago_activo,
          mercado_pago_public_key: data.mercado_pago_public_key || '',
          mercado_pago_access_token: data.mercado_pago_access_token || ''
        })
      }
      setTablaExiste(true)
    } catch (err) {
      console.error('Error fetching config:', err.message)
    }
  }

  const cambiarEstado = async (id, estado) => {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
  }

  const abrirModalNuevo = () => { setForm(FORM_VACIO); setProductoEditando(null); setModalProducto(true) }
  const abrirModalEditar = (p) => { setForm({ nombre: p.nombre, precio: p.precio, categoria: p.categoria, descripcion: p.descripcion || '', imagen_url: p.imagen_url || '', tag: p.tag || '', disponible: p.disponible }); setProductoEditando(p); setModalProducto(true) }

  const guardarProducto = async () => {
    if (!form.nombre || !form.precio) return
    setGuardando(true)
    const payload = { ...form, precio: parseFloat(form.precio) }
    if (productoEditando) {
      await supabase.from('productos').update(payload).eq('id', productoEditando.id)
    } else {
      await supabase.from('productos').insert([payload])
    }
    setGuardando(false)
    setModalProducto(false)
    fetchProductos()
  }

  const eliminarProducto = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    fetchProductos()
  }

  const toggleDisponible = async (p) => {
    await supabase.from('productos').update({ disponible: !p.disponible }).eq('id', p.id)
    fetchProductos()
  }

  const guardarConfig = async () => {
    setGuardandoConfig(true)
    try {
      const { data, error } = await supabase.from('configuracion').select('id').maybeSingle()
      if (error) throw error

      const payload = {
        nombre: config.nombre || '',
        telefono: config.telefono || '',
        direccion: config.direccion || '',
        horario: config.horario || '',
        descripcion: config.descripcion || '',
        delivery_costo: parseFloat(config.delivery_costo) || 0,
        delivery_gratis_desde: parseFloat(config.delivery_gratis_desde) || 0,
        delivery_coordinar: !!config.delivery_coordinar,
        mercado_pago_activo: !!config.mercado_pago_activo,
        mercado_pago_public_key: config.mercado_pago_public_key || '',
        mercado_pago_access_token: config.mercado_pago_access_token || '',
        actualizado_en: new Date().toISOString()
      }

      if (data) {
        const { error: updateErr } = await supabase.from('configuracion').update(payload).eq('id', data.id)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase.from('configuracion').insert([{ ...payload, id: 'la_esquina' }])
        if (insertErr) throw insertErr
      }
      setConfigGuardada(true)
      setTimeout(() => setConfigGuardada(false), 3000)
      setTablaExiste(true)
    } catch (err) {
      console.error(err)
      alert('Error al guardar configuracion: ' + (err.message || err))
    } finally {
      setGuardandoConfig(false)
    }
  }

  const pedidosHoy = pedidos.filter(p => { const f = p.creado_en ? new Date(p.creado_en) : null; return f && f.toDateString() === new Date().toDateString() })
  const totalHoy = pedidosHoy.reduce((a, p) => a + (p.total || 0), 0)
  const totalGeneral = pedidos.reduce((a, p) => a + (p.total || 0), 0)
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const pedidosPreparando = pedidos.filter(p => p.estado === 'preparando').length

  const ahora = new Date()
  const diasAtras = parseInt(periodoReporte)
  const pedidosEnPeriodo = pedidos.filter(p => { const f = p.creado_en ? new Date(p.creado_en) : null; if (!f) return false; return (ahora - f) / (1000 * 60 * 60 * 24) <= diasAtras })

  const ventasPorDia = (() => {
    const mapa = {}
    for (let i = diasAtras - 1; i >= 0; i--) { const d = new Date(ahora); d.setDate(d.getDate() - i); mapa[d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })] = 0 }
    pedidosEnPeriodo.filter(p => p.estado !== 'cancelado').forEach(p => { const key = p.creado_en ? new Date(p.creado_en).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) : null; if (key && mapa[key] !== undefined) mapa[key] += p.total || 0 })
    return Object.entries(mapa).map(([dia, total]) => ({ dia, total }))
  })()

  const productosMasVendidos = (() => {
    const mapa = {}
    pedidosEnPeriodo.forEach(p => { p.productos?.forEach(prod => { if (!mapa[prod.nombre]) mapa[prod.nombre] = { cantidad: 0, total: 0 }; mapa[prod.nombre].cantidad += prod.cantidad || 1; mapa[prod.nombre].total += (prod.precio || 0) * (prod.cantidad || 1) }) })
    return Object.entries(mapa).map(([nombre, data]) => ({ nombre, ...data })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 8)
  })()

  const completadosPeriodo = pedidosEnPeriodo.filter(p => p.estado === 'entregado').length
  const tasaCompletados = pedidosEnPeriodo.length > 0 ? Math.round((completadosPeriodo / pedidosEnPeriodo.length) * 100) : 0
  const ticketPromedio = completadosPeriodo > 0 ? pedidosEnPeriodo.filter(p => p.estado === 'entregado').reduce((a, p) => a + (p.total || 0), 0) / completadosPeriodo : 0
  const promedioResenas = resenas.length > 0 ? resenas.reduce((a, r) => a + (r.calificacion || 0), 0) / resenas.length : 0
  const maxVentaDia = Math.max(...ventasPorDia.map(v => v.total), 1)
  const maxProducto = Math.max(...productosMasVendidos.map(p => p.cantidad), 1)

  const estadoColor = { pendiente: 'bg-yellow-100 text-yellow-700', preparando: 'bg-blue-100 text-blue-700', listo: 'bg-green-100 text-green-700', entregado: 'bg-gray-100 text-gray-600', cancelado: 'bg-red-100 text-red-600' }
  const estadoIcono = { pendiente: <FiClock className="text-yellow-500" />, preparando: <FiShoppingBag className="text-blue-500" />, listo: <FiCheckCircle className="text-green-500" />, entregado: <FiTruck className="text-gray-500" />, cancelado: <FiXCircle className="text-red-500" /> }

  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',   icon: <FiHome />      },
    { id: 'reportes',   label: 'Reportes',    icon: <FiBarChart2 /> },
    { id: 'pedidos',    label: 'Pedidos',     icon: <FiList />      },
    { id: 'productos',  label: 'Productos',   icon: <FiPackage />   },
    { id: 'usuarios',   label: 'Usuarios',    icon: <FiUsers />     },
    { id: 'config',     label: 'Configuracion', icon: <FiSettings /> },
  ]

  const productosFiltrados = filtroCategoria === 'Todas' ? productos : productos.filter(p => p.categoria === filtroCategoria)

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
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

      {modalProducto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{productoEditando ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setModalProducto(false)} className="text-gray-400 hover:text-gray-600 transition"><FiX size={20} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nombre</label>
                  <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Hamburguesa Clásica" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Precio (S/)</label>
                  <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0.00" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-500 transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-500 transition bg-white">
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Tag</label>
                  <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="Ej: Popular, Nuevo" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-500 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del producto..." rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-500 transition resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Imagen del producto</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-red-400 transition cursor-pointer relative"
                  onClick={() => document.getElementById('input-imagen').click()}>
                  {form.imagen_url ? (
                    <div className="relative">
                      <img src={form.imagen_url} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setForm({ ...form, imagen_url: '' }) }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition"
                      >×</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      {subiendoImagen ? (
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiPackage className="text-gray-300 text-3xl" />
                          <p className="text-xs text-gray-400 font-medium">Haz clic para subir imagen</p>
                          <p className="text-xs text-gray-300">JPG, PNG, WEBP hasta 5MB</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    id="input-imagen"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      setSubiendoImagen(true)
                      try {
                        const ext = file.name.split('.').pop()
                        const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
                        const { error } = await supabase.storage.from('Productos').upload(nombre, file, { upsert: true })
                        if (error) throw error
                        const { data: urlData } = supabase.storage.from('Productos').getPublicUrl(nombre)
                        setForm({ ...form, imagen_url: urlData.publicUrl })
                      } catch (err) {
                        alert('Error al subir imagen: ' + err.message)
                      } finally {
                        setSubiendoImagen(false)
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm({ ...form, disponible: !form.disponible })} className={`text-2xl transition ${form.disponible ? 'text-green-500' : 'text-gray-300'}`}>
                  {form.disponible ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
                <span className="text-sm text-gray-600 font-medium">{form.disponible ? 'Disponible' : 'No disponible'}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setModalProducto(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancelar</button>
              <button onClick={guardarProducto} disabled={guardando || !form.nombre || !form.precio} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2">
                {guardando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={14} />}
                {productoEditando ? 'Guardar cambios' : 'Agregar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 min-h-screen flex flex-col transition-all duration-300 flex-shrink-0 shadow-xl`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
          {sidebarOpen && <img src={lesq} alt="L'ESQ" className="h-9 object-contain" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition p-1">
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(datosUsuario?.nombre || usuario?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{datosUsuario?.nombre || usuario?.email}</p>
                <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 rounded-full">Admin</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setVistaActiva(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-semibold w-full ${
                vistaActiva === item.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-gray-800">
          <button onClick={() => { cerrarSesion(); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm font-semibold w-full">
            <FiLogOut className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">{navItems.find(n => n.id === vistaActiva)?.label}</h1>
            <p className="text-xs text-gray-400">Panel de administracion — La Esquina</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-semibold">En linea</span>
            </div>
            <span className="text-xs text-gray-400 hidden md:block">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="p-6">

          {vistaActiva === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Ventas hoy',  valor: `S/ ${totalHoy.toFixed(2)}`, icon: <FiDollarSign size={20} />, light: 'bg-red-50 text-red-600',    border: 'border-red-100'    },
                  { label: 'Pedidos hoy', valor: pedidosHoy.length,            icon: <FiShoppingBag size={20} />,light: 'bg-blue-50 text-blue-600',   border: 'border-blue-100'   },
                  { label: 'Pendientes',  valor: pedidosPendientes,             icon: <FiClock size={20} />,      light: 'bg-yellow-50 text-yellow-600',border: 'border-yellow-100' },
                  { label: 'Preparando',  valor: pedidosPreparando,             icon: <FiList size={20} />,       light: 'bg-green-50 text-green-600',  border: 'border-green-100'  },
                ].map((stat) => (
                  <div key={stat.label} className={`bg-white rounded-2xl shadow-sm border ${stat.border} p-5 flex items-center gap-4 hover:shadow-md transition`}>
                    <div className={`${stat.light} p-3 rounded-xl`}>{stat.icon}</div>
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
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Total de pedidos',     valor: pedidos.length },
                      { label: 'Total de ventas',      valor: `S/ ${totalGeneral.toFixed(2)}` },
                      { label: 'Usuarios registrados', valor: usuarios.length },
                      { label: 'Productos en carta',   valor: productos.length },
                      { label: 'Pedidos entregados',   valor: pedidos.filter(p => p.estado === 'entregado').length },
                      { label: 'Pedidos cancelados',   valor: pedidos.filter(p => p.estado === 'cancelado').length },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{item.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Ultimos pedidos</h3>
                  <div className="flex flex-col gap-2">
                    {pedidos.slice(0, 6).map((pedido) => (
                      <div key={pedido.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{pedido.usuarioEmail}</p>
                          <p className="text-xs text-gray-400">{pedido.creado_en ? new Date(pedido.creado_en).toLocaleString('es-PE') : '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs font-bold text-red-600">S/ {pedido.total?.toFixed(2)}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${estadoColor[pedido.estado]}`}>{pedido.estado}</span>
                        </div>
                      </div>
                    ))}
                    {pedidos.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No hay pedidos aun</p>}
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
                        <div className="flex justify-center text-2xl mb-2">{estadoIcono[estado]}</div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs font-semibold capitalize mt-0.5">{estado}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {vistaActiva === 'reportes' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Reportes y analiticas</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Datos en tiempo real desde Supabase</p>
                </div>
                <div className="flex gap-2">
                  {[{ label: '7 dias', val: '7' }, { label: '15 dias', val: '15' }, { label: '30 dias', val: '30' }].map((op) => (
                    <button key={op.val} onClick={() => setPeriodoReporte(op.val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${periodoReporte === op.val ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pedidos en periodo', valor: pedidosEnPeriodo.length, icon: <FiShoppingBag size={18} />, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Ventas en periodo', valor: `S/ ${pedidosEnPeriodo.filter(p => p.estado !== 'cancelado').reduce((a, p) => a + (p.total || 0), 0).toFixed(2)}`, icon: <FiDollarSign size={18} />, color: 'bg-red-50 text-red-600' },
                  { label: 'Ticket promedio', valor: `S/ ${ticketPromedio.toFixed(2)}`, icon: <FiTrendingUp size={18} />, color: 'bg-green-50 text-green-600' },
                  { label: 'Tasa completados', valor: `${tasaCompletados}%`, icon: <FiCheckCircle size={18} />, color: 'bg-purple-50 text-purple-600' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                    <div className={`${kpi.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>{kpi.icon}</div>
                    <p className="text-xs text-gray-400 font-medium mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-gray-900">{kpi.valor}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Ventas por dia</h3>
                    <p className="text-xs text-gray-400">Ultimos {periodoReporte} dias</p>
                  </div>
                  <FiBarChart2 className="text-gray-300" size={20} />
                </div>
                <div className="flex flex-col gap-3">
                  {ventasPorDia.map((v) => <Barra key={v.dia} label={v.dia} valor={v.total} max={maxVentaDia} prefix="S/ " color="#e63946" />)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        <div key={p.nombre} className="flex items-center gap-2">
                          <span className={`text-xs font-black w-5 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>#{i + 1}</span>
                          <div className="flex-1"><Barra label={p.nombre} valor={p.cantidad} max={maxProducto} suffix=" und" color={i === 0 ? '#f59e0b' : '#e63946'} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Resenas de clientes</h3>
                      <p className="text-xs text-gray-400">{resenas.length} resenas en total</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-400" size={16} style={{ fill: '#facc15' }} />
                      <span className="text-sm font-bold text-gray-900">{promedioResenas.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">/ 5.0</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = resenas.filter(r => r.calificacion === stars).length
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5 w-16 flex-shrink-0">
                            {[...Array(stars)].map((_, i) => <FiStar key={i} size={10} className="text-yellow-400" style={{ fill: '#facc15' }} />)}
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all duration-700" style={{ width: resenas.length > 0 ? `${(count / resenas.length) * 100}%` : '0%' }} />
                          </div>
                          <p className="text-xs font-bold text-gray-500 w-5 text-right">{count}</p>
                        </div>
                      )
                    })}
                  </div>
                  {resenas.slice(0, 3).map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <FiStar key={s} size={11} className={s <= r.calificacion ? 'text-yellow-400' : 'text-gray-300'} style={{ fill: s <= r.calificacion ? '#facc15' : 'none' }} />)}
                        </div>
                        <p className="text-xs text-gray-400">{r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-PE') : '—'}</p>
                      </div>
                      {r.comentario && <p className="text-xs text-gray-600 leading-relaxed">{r.comentario}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {vistaActiva === 'pedidos' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">Todos los pedidos</h2>
                <span className="text-sm text-gray-400">{pedidos.length} pedidos en total</span>
              </div>
              {cargando ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : pedidos.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No hay pedidos aun</p>
              ) : (
                pedidos.map((pedido) => {
                  const tipoEntrega = pedido.tipo_entrega || pedido.productos?.find(p => p.id === '_metadata')?.tipo_entrega || 'recojo'
                  const direccion = pedido.direccion_entrega || pedido.productos?.find(p => p.id === '_metadata')?.direccion || null
                  const telefono = pedido.telefono_contacto || pedido.productos?.find(p => p.id === '_metadata')?.telefono || null
                  const costoDelivery = pedido.costo_delivery !== undefined ? parseFloat(pedido.costo_delivery) : (pedido.productos?.find(p => p.id === '_metadata')?.costo_delivery || 0)
                  const metodoPago = pedido.metodo_pago || pedido.productos?.find(p => p.id === '_metadata')?.metodo_pago || 'efectivo'
                  const pagoEstado = pedido.pago_estado || pedido.productos?.find(p => p.id === '_metadata')?.pago_estado || 'pendiente'

                  // Filtrar los productos para no listar el item especial de metadatos en la tabla visual
                  const productosVisibles = pedido.productos?.filter(p => p.id !== '_metadata') || []

                  return (
                    <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-400">#{pedido.id.slice(0, 8)}</p>
                          <p className="text-sm font-bold text-gray-900">{pedido.usuario_email || pedido.usuarioEmail}</p>
                          <p className="text-xs text-gray-400">{pedido.creado_en ? new Date(pedido.creado_en).toLocaleString('es-PE') : '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold text-lg">S/ {pedido.total?.toFixed(2)}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 justify-end ${estadoColor[pedido.estado]}`}>
                            {estadoIcono[pedido.estado]} {pedido.estado}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        {productosVisibles.map((prod, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                            <span>{prod.nombre} x{prod.cantidad} {prod.opcion ? `(${prod.opcion})` : ''}</span>
                            <span>S/ {((prod.precio + (prod.extra || 0)) * prod.cantidad).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Detalles de entrega y pago */}
                      <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-200 text-xs text-gray-500 space-y-1 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                        <p><span className="font-bold text-gray-700">Entrega:</span> <span className="capitalize font-semibold">{tipoEntrega}</span>{tipoEntrega === 'delivery' && ` (Envío: S/ ${costoDelivery.toFixed(2)})`}</p>
                        {tipoEntrega === 'delivery' && direccion && <p><span className="font-bold text-gray-700">Dirección:</span> {direccion}</p>}
                        {telefono && <p><span className="font-bold text-gray-700">Teléfono:</span> {telefono}</p>}
                        <p>
                          <span className="font-bold text-gray-700">Pago:</span> <span className="capitalize font-semibold">{metodoPago === 'efectivo' ? 'Efectivo / Yape' : 'Mercado Pago (Online)'}</span> 
                          <span className={`ml-2 px-2 py-0.5 rounded-full font-bold text-[10px] ${pagoEstado === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {pagoEstado === 'aprobado' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap mt-3">
                        {['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'].map((estado) => (
                          <button key={estado} onClick={() => cambiarEstado(pedido.id, estado)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${pedido.estado === estado ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {estado}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {vistaActiva === 'productos' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Gestión de productos</h2>
                  <p className="text-xs text-gray-400">{productos.length} productos en total</p>
                </div>
                <button onClick={abrirModalNuevo} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-sm">
                  <FiPlus size={16} /> Nuevo producto
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {['Todas', ...CATEGORIAS].map(cat => (
                  <button key={cat} onClick={() => setFiltroCategoria(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${filtroCategoria === cat ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              {productosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <FiPackage className="text-gray-300 text-5xl mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No hay productos en esta categoría</p>
                  <button onClick={abrirModalNuevo} className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition">
                    Agregar primero
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosFiltrados.map((p) => (
                    <div key={p.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition ${!p.disponible ? 'opacity-60 border-gray-200' : 'border-gray-100'}`}>
                      {p.imagen_url && (
                        <div className="w-full h-36 overflow-hidden">
                          <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {!p.imagen_url && (
                        <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                          <FiPackage className="text-gray-300 text-4xl" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-bold text-gray-900 leading-tight">{p.nombre}</p>
                          {p.tag && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{p.tag}</span>}
                        </div>
                        <p className="text-xs text-gray-400 leading-tight line-clamp-2 mb-2">{p.descripcion}</p>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-red-600 font-bold text-base">S/ {parseFloat(p.precio).toFixed(2)}</p>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{p.categoria}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleDisponible(p)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition flex-1 justify-center ${p.disponible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {p.disponible ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                            {p.disponible ? 'Disponible' : 'No disponible'}
                          </button>
                          <button onClick={() => abrirModalEditar(p)} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => eliminarProducto(p.id)} className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.rol === 'admin' ? 'bg-red-100 text-red-600' : user.rol === 'empleado' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {user.rol}
                          </span>
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

          {vistaActiva === 'config' && (
            <div className="flex flex-col gap-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Configuración del restaurante</h2>
                <p className="text-xs text-gray-400 mt-0.5">Controla la información de marca, tarifas de delivery y pasarela de pago</p>
              </div>

              {!tablaExiste ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                    ⚠️ Tabla de configuración no inicializada en Supabase
                  </h3>
                  <p className="text-xs text-red-600 mb-4 leading-relaxed font-medium">
                    Para poder guardar los datos generales, envío y pasarela de pago, debes crear e inicializar la tabla de configuración unificada en Supabase.
                    Copia el siguiente script SQL, ve al apartado <b>SQL Editor</b> en tu consola de Supabase, pégalo y presiona el botón <b>Run</b>:
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-[11px] overflow-x-auto mb-4 font-mono select-all">
{`-- Crear tabla de configuración unificada y habilitar RLS
CREATE TABLE IF NOT EXISTS public.configuracion (
    id text PRIMARY KEY DEFAULT 'la_esquina',
    nombre text,
    telefono text,
    direccion text,
    horario text,
    descripcion text,
    delivery_costo numeric DEFAULT 5.0,
    delivery_gratis_desde numeric DEFAULT 50.0,
    delivery_coordinar boolean DEFAULT false,
    mercado_pago_activo boolean DEFAULT false,
    mercado_pago_public_key text,
    mercado_pago_access_token text,
    actualizado_en timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de config" ON public.configuracion;
CREATE POLICY "Lectura pública de config" ON public.configuracion FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escritura solo para admins" ON public.configuracion;
CREATE POLICY "Escritura solo para admins" ON public.configuracion FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin')
);

-- Agregar columnas de soporte de envío y pago a pedidos
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS tipo_entrega text DEFAULT 'recojo';
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS direccion_entrega text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS telefono_contacto text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS metodo_pago text DEFAULT 'efectivo';
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS costo_delivery numeric DEFAULT 0;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS pago_estado text DEFAULT 'pendiente';`}
                  </pre>
                  <button onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md">
                    Reintentar conexión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* General settings */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Información del Restaurante</h3>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Nombre del restaurante</label>
                      <input value={config.nombre || ''} onChange={e => setConfig({ ...config, nombre: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition" placeholder="La Esquina" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Teléfono</label>
                      <input value={config.telefono || ''} onChange={e => setConfig({ ...config, telefono: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition" placeholder="+51 913 532 103" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Dirección</label>
                      <input value={config.direccion || ''} onChange={e => setConfig({ ...config, direccion: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition" placeholder="Av. Principal 123, Piura" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Horario de atención</label>
                      <input value={config.horario || ''} onChange={e => setConfig({ ...config, horario: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition" placeholder="Lun-Dom: 12:00pm - 11:00pm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Descripción del restaurante</label>
                      <textarea value={config.descripcion || ''} onChange={e => setConfig({ ...config, descripcion: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition resize-none" placeholder="El mejor sabor de la ciudad..." />
                    </div>
                  </div>

                  {/* Delivery Settings */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Tarifas y Políticas de Envío</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Costo de Envío Fijo (S/)</label>
                        <input type="number" step="0.1" min="0" disabled={config.delivery_coordinar}
                          value={config.delivery_costo}
                          onChange={(e) => setConfig({...config, delivery_costo: parseFloat(e.target.value) || 0})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition disabled:bg-gray-100" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Delivery gratis a partir de (S/)</label>
                        <input type="number" step="1" min="0"
                          value={config.delivery_gratis_desde}
                          onChange={(e) => setConfig({...config, delivery_gratis_desde: parseFloat(e.target.value) || 0})}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                      <input type="checkbox" checked={config.delivery_coordinar}
                        onChange={(e) => setConfig({...config, delivery_coordinar: e.target.checked})}
                        className="rounded text-red-600 focus:ring-red-500" />
                      <span className="text-xs text-gray-600 font-medium">Coordinar costo de envío con el motorizado (precio variable)</span>
                    </label>
                  </div>

                  {/* Mercado Pago Settings */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Pasarela de Pagos (Mercado Pago)</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={config.mercado_pago_activo}
                        onChange={(e) => setConfig({...config, mercado_pago_activo: e.target.checked})}
                        className="rounded text-red-600 focus:ring-red-500" />
                      <span className="text-xs text-gray-855 font-bold">Activar Mercado Pago para compras en línea</span>
                    </label>

                    {config.mercado_pago_activo && (
                      <div className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Mercado Pago Public Key (Clave Pública)</label>
                          <input type="text" placeholder="TEST-a1b2..."
                            value={config.mercado_pago_public_key}
                            onChange={(e) => setConfig({...config, mercado_pago_public_key: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-red-500 transition" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Mercado Pago Access Token (Token de Acceso)</label>
                          <input type="password" placeholder="TEST-12345..."
                            value={config.mercado_pago_access_token}
                            onChange={(e) => setConfig({...config, mercado_pago_access_token: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-red-500 transition" />
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          * Nota: Utiliza llaves de prueba (`TEST-...`) para simular compras o llaves de producción para procesar cobros reales.
                        </p>
                      </div>
                    )}
                  </div>

                  <button onClick={guardarConfig} disabled={guardandoConfig} className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 shadow-md">
                    {guardandoConfig ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
                    Guardar Todas las Configuraciones
                  </button>

                  {configGuardada && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold">
                      <FiCheckCircle size={16} />
                      Configuraciones guardadas correctamente en Supabase
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Admin