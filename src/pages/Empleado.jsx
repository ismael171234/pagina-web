import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, onSnapshot, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import {
  FiClock, FiCheckCircle, FiXCircle, FiTruck,
  FiShoppingBag, FiLogOut, FiMenu, FiX, FiList,
  FiPlus, FiMinus, FiTrash2, FiHome
} from 'react-icons/fi'
import { MdTableRestaurant } from 'react-icons/md'
import lesq from '../assets/lesq.png'
 
// ── Imágenes ──────────────────────────────────────────────
import alitasAcevichadas   from '../assets/alitas_acevichadas.png'
import alitasBBQ           from '../assets/alitas_BBQ.png'
import alitasMaracuya      from '../assets/alitas_maracuya.png'
import alitasMozarella     from '../assets/alitas_mozarella.png'
import alitasTeriyaki      from '../assets/Alitas_teriyaki.png'
import honeyMustard        from '../assets/honey_mustard.png'
import rondaMini           from '../assets/RondaMiniAlitas.png'
import rondaFresh          from '../assets/Ronda_Fresh.png'
import rondaBig            from '../assets/RondaBig.png'
 
import polloEntero         from '../assets/pollolabrasentero.png'
import medioPollo          from '../assets/mediopollo.png'
import cuartoPollo         from '../assets/cuartodepollo.png'
import unoctavoPollo       from '../assets/unoctavodepollo.png'
 
import hamburguesaclasica1 from '../assets/hamburguesaclasica1.png'
import hamburguesaclasica2 from '../assets/hamburguesaclasica2.jpg'
import hamburguesaroyal    from '../assets/hamburguesaroyal.jpg'
import hamburguesaperuana  from '../assets/hamburguesa clasica.png'
 
import salchiCuarto        from '../assets/salchibrasauncuarto.png'
import salchiPapas         from '../assets/salchipapas.png'
import unoctavoSalchi      from '../assets/unoctavodepollo.png' // reusar si no hay imagen específica
import heroImg             from '../assets/hero.png'
 
import especialAguadito    from '../assets/especialaguadito.png'
import especialAnticucho   from '../assets/especialanticucho.png'
import especialChaufa      from '../assets/especialarrozchaufa.png'
import especialMollejitas  from '../assets/especialmollejitas.png'
 
import comboanticuchos     from '../assets/comboanticuchos.png'
import comboalitas         from '../assets/comboalitas.png'
import combonuggets        from '../assets/combonuggets.png'
import combopollobbq       from '../assets/combopollobbq.png'

 
import cocacola            from '../assets/gaseosacocacola.png'
import fanta               from '../assets/gaseosafanta.png'
import inkacola            from '../assets/gaseosainkacola.png'
import sprint              from '../assets/gaseosaSprint.png'
import maracuya            from '../assets/bebidamaracuya.png'
import chichamorada        from '../assets/chichamoradabebida.png'
 
import arrozconleche       from '../assets/arrozconleche.png'
import brownie             from '../assets/brownieconhelado.png'
import cheesecake          from '../assets/cheesecakedefresa.png'
import torta               from '../assets/tortahumedadechocolate.png'
 
// ── Datos del menú ────────────────────────────────────────
const CATEGORIAS = [
  'Hamburguesas',
  'Alitas',
  'Pollo a la Brasa',
  'Salchis Salchis',
  'Especiales',
  'Combos',
  'Bebidas',
  'Postres',
]
 
const PRODUCTOS = [
  // HAMBURGUESAS
  { id: 1,  nombre: 'La Lorna',               precio: 11.00, imagen: hamburguesaclasica1, categoria: 'Hamburguesas' },
  { id: 2,  nombre: 'La Ruca',                precio: 14.00, imagen: hamburguesaclasica2, categoria: 'Hamburguesas' },
  { id: 3,  nombre: 'La Asolapada',           precio: 14.00, imagen: hamburguesaroyal,    categoria: 'Hamburguesas' },
  { id: 4,  nombre: 'Don C',                  precio: 17.00, imagen: hamburguesaperuana,  categoria: 'Hamburguesas' },
 
  // ALITAS
  { id: 5,  nombre: 'Alitas Acevichadas',     precio: 25.00, imagen: alitasAcevichadas,   categoria: 'Alitas' },
  { id: 6,  nombre: 'Alitas BBQ',             precio: 25.00, imagen: alitasBBQ,           categoria: 'Alitas' },
  { id: 7,  nombre: 'Alitas Maracuyá',        precio: 25.00, imagen: alitasMaracuya,      categoria: 'Alitas' },
  { id: 8,  nombre: 'Alitas Mozarella',       precio: 25.00, imagen: alitasMozarella,     categoria: 'Alitas' },
  { id: 9,  nombre: 'Alitas Teriyaki',        precio: 25.00, imagen: alitasTeriyaki,      categoria: 'Alitas' },
  { id: 10, nombre: 'Alitas Honey Mustard',   precio: 25.00, imagen: honeyMustard,        categoria: 'Alitas' },
  { id: 11, nombre: 'Ronda Mini 12un x4',     precio: 39.00, imagen: rondaMini,           categoria: 'Alitas' },
  { id: 12, nombre: 'Ronda Fresh 16un x4',    precio: 49.00, imagen: rondaFresh,          categoria: 'Alitas' },
  { id: 13, nombre: 'Ronda Big 20un x4',      precio: 59.00, imagen: rondaBig,            categoria: 'Alitas' },
 
  // POLLO A LA BRASA
  { id: 14, nombre: 'Pollo Entero',           precio: 57.00, imagen: polloEntero,         categoria: 'Pollo a la Brasa' },
  { id: 15, nombre: '1/2 Pollo a la Brasa',   precio: 33.00, imagen: medioPollo,          categoria: 'Pollo a la Brasa' },
  { id: 16, nombre: '1/4 Pollo a la Brasa',   precio: 20.00, imagen: cuartoPollo,         categoria: 'Pollo a la Brasa' },
  { id: 17, nombre: '1/8 Pollo a la Brasa',   precio: 12.00, imagen: unoctavoPollo,       categoria: 'Pollo a la Brasa' },
 
  // SALCHIS SALCHIS
  { id: 18, nombre: 'Salchi Cardiaca',        precio: 22.00, imagen: salchiPapas,         categoria: 'Salchis Salchis' },
  { id: 19, nombre: 'Salchi Brasa 1/4',       precio: 26.00, imagen: salchiCuarto,        categoria: 'Salchis Salchis' },
  { id: 20, nombre: 'Salchi Brasa 1/8',       precio: 16.00, imagen: salchiCuarto,        categoria: 'Salchis Salchis' },
  { id: 21, nombre: 'Salchi Clásica',         precio: 12.00, imagen: salchiPapas,         categoria: 'Salchis Salchis' },
 
  // ESPECIALES
  { id: 22, nombre: 'Aguadito',               precio: 6.00,  imagen: especialAguadito,    categoria: 'Especiales' },
  { id: 23, nombre: 'Anticuchos',             precio: 18.00, imagen: especialAnticucho,   categoria: 'Especiales' },
  { id: 24, nombre: 'Arroz Chaufa de Pollo',  precio: 10.00, imagen: especialChaufa,      categoria: 'Especiales' },
  { id: 25, nombre: 'Mollejitas',             precio: 16.00, imagen: especialMollejitas,  categoria: 'Especiales' },
 
  // COMBOS
  { id: 26, nombre: 'Combo Anticuchos',       precio: 35.90, imagen: comboanticuchos,     categoria: 'Combos' },
  { id: 27, nombre: 'Combo Alitas',           precio: 32.90, imagen: comboalitas,         categoria: 'Combos' },
  { id: 28, nombre: 'Combo Nuggets',          precio: 28.90, imagen: combonuggets,        categoria: 'Combos' },
  { id: 29, nombre: 'Combo Pollo BBQ',        precio: 34.90, imagen: combopollobbq,       categoria: 'Combos' },
 
  // BEBIDAS
  { id: 30, nombre: 'Coca Cola',              precio: 5.90,  imagen: cocacola,            categoria: 'Bebidas' },
  { id: 31, nombre: 'Fanta',                  precio: 5.90,  imagen: fanta,               categoria: 'Bebidas' },
  { id: 32, nombre: 'Inca Kola',              precio: 5.90,  imagen: inkacola,            categoria: 'Bebidas' },
  { id: 33, nombre: 'Sprint',                 precio: 4.90,  imagen: sprint,              categoria: 'Bebidas' },
  { id: 34, nombre: 'Maracuyá',               precio: 6.50,  imagen: maracuya,            categoria: 'Bebidas' },
  { id: 35, nombre: 'Chicha Morada',          precio: 6.50,  imagen: chichamorada,        categoria: 'Bebidas' },
 
  // POSTRES
  { id: 36, nombre: 'Arroz con Leche',        precio: 8.90,  imagen: arrozconleche,       categoria: 'Postres' },
  { id: 37, nombre: 'Brownie con Helado',     precio: 12.90, imagen: brownie,             categoria: 'Postres' },
  { id: 38, nombre: 'Cheesecake de Fresa',    precio: 11.90, imagen: cheesecake,          categoria: 'Postres' },
  { id: 39, nombre: 'Torta de Chocolate',     precio: 10.90, imagen: torta,               categoria: 'Postres' },
]
 
// ── Adicionales ───────────────────────────────────────────
const ADICIONALES = [
  { id: 'a1',  nombre: 'Anticucho 1 palito',   extra: 7.00 },
  { id: 'a2',  nombre: 'Alitas 4 unidades',    extra: 9.00 },
  { id: 'a3',  nombre: 'Carne de hamburguesa', extra: 6.00 },
  { id: 'a4',  nombre: 'Chorizo',              extra: 3.50 },
  { id: 'a5',  nombre: 'Huevo frito',          extra: 1.50 },
  { id: 'a6',  nombre: 'Mollejitas',           extra: 8.00 },
  { id: 'a7',  nombre: 'Papas fritas',         extra: 10.00 },
  { id: 'a8',  nombre: 'Queso cheddar',        extra: 1.50 },
  { id: 'a9',  nombre: 'Salchicha',            extra: 2.50 },
  { id: 'a10', nombre: 'Tocino',               extra: 2.00 },
  { id: 'a11', nombre: 'Pollo brasa 1/8',      extra: 7.00 },
  { id: 'a12', nombre: 'Pollo brasa 1/4',      extra: 14.00 },
]
 
const TOTAL_MESAS = 22
 
// ── Componente principal ──────────────────────────────────
function Empleado() {
  const { usuario, datosUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
 
  const [autorizado, setAutorizado]           = useState(false)
  const [vista, setVista]                     = useState('mesas')
  const [mesas, setMesas]                     = useState([])
  const [pedidos, setPedidos]                 = useState([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [categoriaActiva, setCategoriaActiva] = useState('Hamburguesas')
  const [ordenActual, setOrdenActual]         = useState([])
  const [sidebarOpen, setSidebarOpen]         = useState(true)
  const [cargando, setCargando]               = useState(true)
 
  // Modal de adicionales
  const [modalProducto, setModalProducto]     = useState(null)
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([])
 
  // ── Auth / autorización ──
  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    if (datosUsuario === undefined || datosUsuario === null) return
    if (datosUsuario.rol === 'empleado' || datosUsuario.rol === 'admin') {
      setAutorizado(true)
    } else {
      navigate('/')
    }
  }, [usuario, datosUsuario])
 
  // ── Firestore listeners ──
  useEffect(() => {
    if (!autorizado) return
    const unsubMesas = onSnapshot(collection(db, 'mesas'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setMesas(data)
      setCargando(false)
    })
    const unsubPedidos = onSnapshot(collection(db, 'pedidos'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setPedidos(data.sort((a, b) => b.creadoEn?.seconds - a.creadoEn?.seconds))
    })
    return () => { unsubMesas(); unsubPedidos() }
  }, [autorizado])
 
  // ── Inicializar mesas ──
  useEffect(() => {
    if (!autorizado) return
    const inicializarMesas = async () => {
      for (let i = 1; i <= TOTAL_MESAS; i++) {
        await setDoc(doc(db, 'mesas', `mesa-${i}`), {
          numero: i,
          nombre: `Mesa ${i}`,
          estado: 'libre',
          pedidoActual: null,
        }, { merge: true })
      }
    }
    inicializarMesas()
  }, [autorizado])
 
  // ── Helpers ──
  const getMesaInfo = (numero) => mesas.find((m) => m.numero === numero)
 
  const seleccionarMesa = (numero) => {
    setMesaSeleccionada(numero)
    setOrdenActual([])
    setCategoriaActiva('Hamburguesas')
    setVista('orden')
  }
 
  // Abre modal antes de agregar
  const abrirModal = (producto) => {
    setModalProducto(producto)
    setAdicionalesSeleccionados([])
  }
 
  const toggleAdicional = (adicional) => {
    setAdicionalesSeleccionados((prev) =>
      prev.find((a) => a.id === adicional.id)
        ? prev.filter((a) => a.id !== adicional.id)
        : [...prev, adicional]
    )
  }
 
  const confirmarAdicionales = () => {
    if (!modalProducto) return
    const extraTotal = adicionalesSeleccionados.reduce((acc, a) => acc + a.extra, 0)
    const item = {
      ...modalProducto,
      uid: `${modalProducto.id}_${Date.now()}`,
      cantidad: 1,
      adicionales: adicionalesSeleccionados,
      extra: extraTotal,
      precioFinal: modalProducto.precio + extraTotal,
    }
    setOrdenActual((prev) => [...prev, item])
    setModalProducto(null)
    setAdicionalesSeleccionados([])
  }
 
  const quitarProducto = (uid) => {
    setOrdenActual((prev) => {
      const item = prev.find((p) => p.uid === uid)
      if (item.cantidad === 1) return prev.filter((p) => p.uid !== uid)
      return prev.map((p) => p.uid === uid ? { ...p, cantidad: p.cantidad + 1 } : p)
    })
  }
 
  const aumentarProducto = (uid) => {
    setOrdenActual((prev) =>
      prev.map((p) => p.uid === uid ? { ...p, cantidad: p.cantidad + 1 } : p)
    )
  }
 
  const eliminarProducto = (uid) => {
    setOrdenActual((prev) => prev.filter((p) => p.uid !== uid))
  }
 
  const totalOrden = ordenActual.reduce(
    (acc, p) => acc + p.precioFinal * p.cantidad, 0
  )
 
  const confirmarOrden = async () => {
    if (ordenActual.length === 0) { alert('Agrega productos al pedido'); return }
    try {
      const pedidoRef = await addDoc(collection(db, 'pedidos'), {
        usuarioId: usuario.uid,
        usuarioEmail: usuario.email,
        mesa: `Mesa ${mesaSeleccionada}`,
        productos: ordenActual.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precioFinal,
          cantidad: p.cantidad,
          adicionales: p.adicionales?.map((a) => a.nombre) || [],
          extra: p.extra || 0,
        })),
        total: parseFloat(totalOrden.toFixed(2)),
        estado: 'pendiente',
        tipo: 'mesa',
        creadoEn: new Date(),
      })
      await updateDoc(doc(db, 'mesas', `mesa-${mesaSeleccionada}`), {
        estado: 'ocupada',
        pedidoActual: pedidoRef.id,
      })
      setOrdenActual([])
      setVista('mesas')
      alert(`✅ Pedido confirmado para Mesa ${mesaSeleccionada}`)
    } catch (err) {
      alert('Error al confirmar el pedido')
    }
  }
 
  const liberarMesa = async (numero) => {
    await updateDoc(doc(db, 'mesas', `mesa-${numero}`), {
      estado: 'libre',
      pedidoActual: null,
    })
  }
 
  const cancelarPedido = async (pedidoId, numeroMesa) => {
    const pedido = pedidos.find((p) => p.id === pedidoId)
    if (pedido?.estado !== 'pendiente') {
      alert('Solo se pueden cancelar pedidos pendientes')
      return
    }
    await updateDoc(doc(db, 'pedidos', pedidoId), { estado: 'cancelado' })
    await liberarMesa(numeroMesa)
  }
 
  const productosFiltrados = PRODUCTOS.filter((p) => p.categoria === categoriaActiva)
 
  const estadoColor = {
    pendiente:  'bg-yellow-100 text-yellow-700',
    preparando: 'bg-blue-100 text-blue-700',
    listo:      'bg-green-100 text-green-700',
    entregado:  'bg-gray-100 text-gray-600',
    cancelado:  'bg-red-100 text-red-600',
  }
 
  // ── Loading / acceso denegado ──
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
 
  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-100 flex">
 
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
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Mesero</span>
          </div>
        )}
 
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {[
            { id: 'mesas',   label: 'Mesas',          icon: <MdTableRestaurant /> },
            { id: 'pedidos', label: 'Pedidos activos', icon: <FiList /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setVista(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-semibold w-full ${
                vista === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
 
        <div className="px-2 py-4 border-t border-gray-700 flex flex-col gap-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm font-semibold w-full"
          >
            <FiHome className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Ir al inicio</span>}
          </button>
          <button
            onClick={() => { cerrarSesion(); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm font-semibold w-full"
          >
            <FiLogOut className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
 
      {/* ── Contenido principal ── */}
      <div className="flex-1 overflow-auto">
 
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {vista === 'mesas'   ? 'Mesas del Restaurante' :
               vista === 'orden'   ? `Tomando orden — Mesa ${mesaSeleccionada}` :
               'Pedidos Activos'}
            </h1>
            <p className="text-xs text-gray-400">Panel de Mesero — La Esquina</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">En línea</span>
          </div>
        </div>
 
        <div className="p-6">
 
          {/* ══ VISTA: MESAS ══ */}
          {vista === 'mesas' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total mesas',     valor: TOTAL_MESAS,                                                                color: 'bg-gray-50 border-gray-200 text-gray-700' },
                  { label: 'Mesas libres',    valor: mesas.filter(m => m.estado === 'libre').length,                            color: 'bg-green-50 border-green-200 text-green-700' },
                  { label: 'Mesas ocupadas',  valor: mesas.filter(m => m.estado === 'ocupada').length,                         color: 'bg-red-50 border-red-200 text-red-700' },
                  { label: 'Pedidos activos', valor: pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado').length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.color} border rounded-2xl p-4 text-center`}>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color.split(' ')[2]}`}>{stat.valor}</p>
                  </div>
                ))}
              </div>
 
              {/* Grid de mesas */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: TOTAL_MESAS }, (_, i) => i + 1).map((numero) => {
                  const mesa = getMesaInfo(numero)
                  const ocupada = mesa?.estado === 'ocupada'
                  const pedidoMesa = pedidos.find(
                    p => p.mesa === `Mesa ${numero}` && p.estado !== 'entregado' && p.estado !== 'cancelado'
                  )
 
                  return (
                    <div
                      key={numero}
                      className={`rounded-2xl border-2 p-4 transition hover:shadow-lg ${
                        ocupada
                          ? 'bg-red-50 border-red-300'
                          : 'bg-green-50 border-green-300 hover:bg-green-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <MdTableRestaurant className={`text-2xl ${ocupada ? 'text-red-500' : 'text-green-500'}`} />
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          ocupada ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {ocupada ? 'Ocupada' : 'Libre'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-2">Mesa {numero}</p>
 
                      {ocupada && pedidoMesa ? (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">S/ {pedidoMesa.total?.toFixed(2)}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${estadoColor[pedidoMesa.estado]}`}>
                            {pedidoMesa.estado}
                          </span>
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => liberarMesa(numero)}
                              className="flex-1 text-xs bg-green-600 text-white py-1 rounded-lg font-bold hover:bg-green-700 transition"
                            >
                              Liberar
                            </button>
                            {pedidoMesa.estado === 'pendiente' && (
                              <button
                                onClick={() => cancelarPedido(pedidoMesa.id, numero)}
                                className="flex-1 text-xs bg-red-600 text-white py-1 rounded-lg font-bold hover:bg-red-700 transition"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => seleccionarMesa(numero)}
                          className="w-full text-xs bg-red-600 text-white py-1.5 rounded-lg font-bold hover:bg-red-700 transition"
                        >
                          Tomar orden
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
 
          {/* ══ VISTA: TOMAR ORDEN ══ */}
          {vista === 'orden' && (
            <div className="flex gap-6">
 
              {/* Panel izquierdo: productos */}
              <div className="flex-1">
                {/* Categorías */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoriaActiva(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                        categoriaActiva === cat
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
 
                {/* Grid de productos */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      onClick={() => abrirModal(producto)}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer group"
                    >
                      <div className="w-full h-28 overflow-hidden">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{producto.nombre}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-red-600 font-bold text-sm">S/ {producto.precio.toFixed(2)}</p>
                          <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <FiPlus size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Panel derecho: resumen orden */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
                  <div className="bg-red-700 px-4 py-3">
                    <h3 className="text-white font-bold">Mesa {mesaSeleccionada}</h3>
                    <p className="text-red-200 text-xs">{ordenActual.length} producto(s)</p>
                  </div>
 
                  <div className="p-4 flex flex-col gap-2 max-h-80 overflow-y-auto">
                    {ordenActual.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-6">Agrega productos al pedido</p>
                    ) : (
                      ordenActual.map((item) => (
                        <div key={item.uid} className="bg-gray-50 rounded-xl p-2">
                          <div className="flex items-center gap-2">
                            <img src={item.imagen} alt={item.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{item.nombre}</p>
                              <p className="text-red-600 text-xs font-bold">
                                S/ {(item.precioFinal * item.cantidad).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => quitarProducto(item.uid)} className="text-gray-500 hover:text-red-600 transition">
                                <FiMinus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                              <button onClick={() => aumentarProducto(item.uid)} className="text-gray-500 hover:text-red-600 transition">
                                <FiPlus size={12} />
                              </button>
                              <button onClick={() => eliminarProducto(item.uid)} className="text-gray-500 hover:text-red-600 transition ml-1">
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                          {item.adicionales?.length > 0 && (
                            <div className="mt-1 pl-12">
                              {item.adicionales.map((a) => (
                                <p key={a.id} className="text-xs text-gray-400">+ {a.nombre} (S/ {a.extra.toFixed(2)})</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
 
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex justify-between mb-3">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-red-600 text-lg">S/ {totalOrden.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={confirmarOrden}
                      disabled={ordenActual.length === 0}
                      className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirmar pedido
                    </button>
                    <button
                      onClick={() => setVista('mesas')}
                      className="w-full mt-2 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {/* ══ VISTA: PEDIDOS ACTIVOS ══ */}
          {vista === 'pedidos' && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Pedidos activos</h2>
              {pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado').length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <FiList className="text-gray-300 text-5xl mx-auto mb-3" />
                  <p className="text-gray-400">No hay pedidos activos</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pedidos
                    .filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado')
                    .map((pedido) => (
                      <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400">#{pedido.id.slice(0, 8)}</p>
                            <p className="text-sm font-bold text-gray-900">{pedido.mesa || 'Online'}</p>
                            <p className="text-xs text-gray-400">
                              {pedido.creadoEn?.toDate().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-600 font-bold">S/ {pedido.total?.toFixed(2)}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${estadoColor[pedido.estado]}`}>
                              {pedido.estado}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          {pedido.productos?.map((prod, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                              <span>{prod.nombre} x{prod.cantidad}</span>
                              <span>S/ {(prod.precio * prod.cantidad).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
 
        </div>
      </div>
 
      {/* ══ MODAL: ADICIONALES ══ */}
      {modalProducto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
 
            {/* Header modal */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={modalProducto.imagen}
                alt={modalProducto.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white font-bold text-lg leading-tight">{modalProducto.nombre}</p>
                <p className="text-red-300 font-bold text-sm">S/ {modalProducto.precio.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setModalProducto(null)}
                className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition"
              >
                <FiX size={16} />
              </button>
            </div>
 
            {/* Adicionales */}
            <div className="p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">¿Agregar adicionales? (opcional)</p>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                {ADICIONALES.map((adicional) => {
                  const seleccionado = adicionalesSeleccionados.find((a) => a.id === adicional.id)
                  return (
                    <button
                      key={adicional.id}
                      onClick={() => toggleAdicional(adicional)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                        seleccionado
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="truncate pr-1">{adicional.nombre}</span>
                      <span className="flex-shrink-0 font-bold">+S/{adicional.extra.toFixed(2)}</span>
                    </button>
                  )
                })}
              </div>
 
              {/* Resumen adicionales seleccionados */}
              {adicionalesSeleccionados.length > 0 && (
                <div className="mt-3 bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-700 font-bold mb-1">Adicionales seleccionados:</p>
                  {adicionalesSeleccionados.map((a) => (
                    <p key={a.id} className="text-xs text-red-600">+ {a.nombre}</p>
                  ))}
                  <p className="text-xs text-red-700 font-bold mt-1 border-t border-red-200 pt-1">
                    Total: S/ {(modalProducto.precio + adicionalesSeleccionados.reduce((acc, a) => acc + a.extra, 0)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
 
            {/* Botones */}
            <div className="px-4 pb-4 flex gap-3">
              <button
                onClick={() => setModalProducto(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAdicionales}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm"
              >
                Agregar al pedido
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  )
}
 
export default Empleado