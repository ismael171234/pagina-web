import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import lesq from '../assets/lesq.png'
import {
  HiMenu, HiX,
} from 'react-icons/hi'
import {
  FiSearch, FiUser, FiShoppingCart, FiChevronRight,
  FiHome, FiLogOut, FiX, FiShoppingBag, FiStar,
} from 'react-icons/fi'
import { MdOutlineLocalOffer, MdTableRestaurant } from 'react-icons/md'
import { GiHamburger, GiForkKnifeSpoon, GiChickenOven } from 'react-icons/gi'
import { RiDrinks2Fill } from 'react-icons/ri'
import { BiDish } from 'react-icons/bi'
import { BsFire } from 'react-icons/bs'
import { TbMeat } from 'react-icons/tb'

// ── Lista completa de productos para la búsqueda ───────────
const TODOS_PRODUCTOS = [
  // Hamburguesas
  { id: 1,  nombre: 'La Lorna',               precio: 'S/ 11.00', categoria: 'Hamburguesas' },
  { id: 2,  nombre: 'La Ruca',                precio: 'S/ 14.00', categoria: 'Hamburguesas' },
  { id: 3,  nombre: 'La Asolapada',           precio: 'S/ 14.00', categoria: 'Hamburguesas' },
  { id: 4,  nombre: 'Don C',                  precio: 'S/ 17.00', categoria: 'Hamburguesas' },
  // Alitas
  { id: 5,  nombre: 'Alitas Acevichadas',     precio: 'S/ 25.00', categoria: 'Alitas' },
  { id: 6,  nombre: 'Alitas BBQ',             precio: 'S/ 25.00', categoria: 'Alitas' },
  { id: 7,  nombre: 'Alitas Maracuyá',        precio: 'S/ 25.00', categoria: 'Alitas' },
  { id: 8,  nombre: 'Alitas Mozarella',       precio: 'S/ 25.00', categoria: 'Alitas' },
  { id: 9,  nombre: 'Alitas Teriyaki',        precio: 'S/ 25.00', categoria: 'Alitas' },
  { id: 10, nombre: 'Alitas Honey Mustard',   precio: 'S/ 25.00', categoria: 'Alitas' },
  { id: 11, nombre: 'Ronda Mini 12un x4',     precio: 'S/ 39.00', categoria: 'Alitas' },
  { id: 12, nombre: 'Ronda Fresh 16un x4',    precio: 'S/ 49.00', categoria: 'Alitas' },
  { id: 13, nombre: 'Ronda Big 20un x4',      precio: 'S/ 59.00', categoria: 'Alitas' },
  // Pollo a la Brasa
  { id: 14, nombre: 'Pollo Entero',           precio: 'S/ 57.00', categoria: 'Pollo a la Brasa' },
  { id: 15, nombre: '1/2 Pollo a la Brasa',   precio: 'S/ 33.00', categoria: 'Pollo a la Brasa' },
  { id: 16, nombre: '1/4 Pollo a la Brasa',   precio: 'S/ 20.00', categoria: 'Pollo a la Brasa' },
  { id: 17, nombre: '1/8 Pollo a la Brasa',   precio: 'S/ 12.00', categoria: 'Pollo a la Brasa' },
  // Salchis
  { id: 18, nombre: 'Salchi Cardiaca',        precio: 'S/ 22.00', categoria: 'Salchis Salchis' },
  { id: 19, nombre: 'Salchi Brasa 1/4',       precio: 'S/ 26.00', categoria: 'Salchis Salchis' },
  { id: 20, nombre: 'Salchi Brasa 1/8',       precio: 'S/ 16.00', categoria: 'Salchis Salchis' },
  { id: 21, nombre: 'Salchi Clásica',         precio: 'S/ 12.00', categoria: 'Salchis Salchis' },
  // Especiales
  { id: 22, nombre: 'Aguadito',               precio: 'S/ 6.00',  categoria: 'Especiales' },
  { id: 23, nombre: 'Anticuchos',             precio: 'S/ 18.00', categoria: 'Especiales' },
  { id: 24, nombre: 'Arroz Chaufa de Pollo',  precio: 'S/ 10.00', categoria: 'Especiales' },
  { id: 25, nombre: 'Mollejitas',             precio: 'S/ 16.00', categoria: 'Especiales' },
  // Combos
  { id: 26, nombre: 'Combo Anticuchos',       precio: 'S/ 35.90', categoria: 'Combos' },
  { id: 27, nombre: 'Combo Alitas',           precio: 'S/ 32.90', categoria: 'Combos' },
  { id: 28, nombre: 'Combo Nuggets',          precio: 'S/ 28.90', categoria: 'Combos' },
  { id: 29, nombre: 'Combo Pollo BBQ',        precio: 'S/ 34.90', categoria: 'Combos' },
  // Bebidas
  { id: 30, nombre: 'Coca Cola',              precio: 'S/ 5.90',  categoria: 'Bebidas' },
  { id: 31, nombre: 'Fanta',                  precio: 'S/ 5.90',  categoria: 'Bebidas' },
  { id: 32, nombre: 'Inca Kola',              precio: 'S/ 5.90',  categoria: 'Bebidas' },
  { id: 33, nombre: 'Sprint',                 precio: 'S/ 4.90',  categoria: 'Bebidas' },
  { id: 34, nombre: 'Maracuyá',              precio: 'S/ 6.50',  categoria: 'Bebidas' },
  { id: 35, nombre: 'Chicha Morada',          precio: 'S/ 6.50',  categoria: 'Bebidas' },
  // Postres
  { id: 36, nombre: 'Arroz con Leche',        precio: 'S/ 8.90',  categoria: 'Postres' },
  { id: 37, nombre: 'Brownie con Helado',     precio: 'S/ 12.90', categoria: 'Postres' },
  { id: 38, nombre: 'Cheesecake de Fresa',    precio: 'S/ 11.90', categoria: 'Postres' },
  { id: 39, nombre: 'Torta de Chocolate',     precio: 'S/ 10.90', categoria: 'Postres' },
]

const CATEGORIAS_MENU = [
  { nombre: 'Hamburguesas',     icon: <GiHamburger />,      desc: '4 opciones' },
  { nombre: 'Alitas',           icon: <GiChickenOven />,    desc: '9 opciones' },
  { nombre: 'Pollo a la Brasa', icon: <BsFire />,           desc: '4 porciones' },
  { nombre: 'Salchis Salchis',  icon: <TbMeat />,           desc: '4 opciones' },
  { nombre: 'Especiales',       icon: <FiStar />,           desc: '4 platos' },
  { nombre: 'Combos',           icon: <GiForkKnifeSpoon />, desc: '4 combos' },
  { nombre: 'Bebidas',          icon: <RiDrinks2Fill />,    desc: '6 bebidas' },
  { nombre: 'Postres',          icon: <BiDish />,           desc: '4 postres' },
]

const CATEGORIA_COLORES = {
  'Hamburguesas':     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Alitas':           'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Pollo a la Brasa': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Salchis Salchis':  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Especiales':       'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Combos':           'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Bebidas':          'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Postres':          'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

function Navbar() {
  const [menuOpen, setMenuOpen]           = useState(false)
  const [search, setSearch]               = useState('')
  const [resultados, setResultados]       = useState([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled]           = useState(false)

  const { usuario, datosUsuario, cerrarSesion } = useAuth()
  const { totalItems, setCartOpen } = useCart()
  const navigate  = useNavigate()
  const location  = useLocation()
  const searchRef = useRef(null)

  const nombreCorto = datosUsuario?.nombre?.split(' ')[0] || usuario?.displayName?.split(' ')[0]
  const esAdmin    = datosUsuario?.rol === 'admin'

  // Scroll listener para efecto glassmorphism
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar búsqueda al cambiar ruta
  useEffect(() => {
    setSearch('')
    setResultados([])
    setMostrarResultados(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleSearch = (valor) => {
    setSearch(valor)
    if (!valor.trim()) { setResultados([]); setMostrarResultados(false); return }
    const filtrados = TODOS_PRODUCTOS.filter((p) =>
      p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
      p.categoria.toLowerCase().includes(valor.toLowerCase())
    ).slice(0, 7)
    setResultados(filtrados)
    setMostrarResultados(true)
  }

  const irAProducto = () => {
    navigate('/menu')
    setSearch('')
    setMostrarResultados(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .nav-font, .nav-font * { font-family: 'Montserrat', sans-serif; }
        .glass-nav {
          background: rgba(10,0,0,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-nav-scrolled {
          background: rgba(10,0,0,0.98);
          box-shadow: 0 4px 32px rgba(200,16,46,0.12);
        }
        .search-glow:focus-within {
          box-shadow: 0 0 0 2px rgba(200,16,46,0.5), 0 4px 20px rgba(200,16,46,0.15);
        }
        .cart-pulse::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid rgba(200,16,46,0.6);
          animation: cartPulse 2s ease infinite;
        }
        @keyframes cartPulse {
          0%,100% { opacity:0; transform: scale(1); }
          50% { opacity:1; transform: scale(1.3); }
        }
        .sidebar-slide {
          animation: slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .result-item {
          transition: background 0.15s ease, padding-left 0.15s ease;
        }
        .result-item:hover { padding-left: 20px; background: rgba(200,16,46,0.08); }
        .cat-btn {
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cat-btn:hover { transform: translateX(6px); }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className={`nav-font sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass-nav glass-nav-scrolled' : 'glass-nav'}`}>

        {/* Línea superior decorativa */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80" />

        <div className="px-3 md:px-6 py-2.5 flex items-center gap-3">

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-600/20 border border-white/8 hover:border-red-500/40 text-white transition-all duration-200 active:scale-90"
          >
            <HiMenu className="text-lg" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <img
              src={lesq}
              alt="L'ESQ"
              className="h-9 object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_0_8px_rgba(200,16,46,0.4)]"
            />
          </Link>

          {/* Barra de búsqueda */}
          <div className="flex-1 mx-1 md:mx-3 relative" ref={searchRef}>
            <div className={`search-glow flex items-center bg-white/6 border rounded-xl px-3.5 py-2 gap-2.5 transition-all duration-200 ${searchFocused ? 'border-red-500/60 bg-white/8' : 'border-white/10 hover:border-white/20'}`}>
              <FiSearch className={`flex-shrink-0 text-base transition-colors duration-200 ${searchFocused ? 'text-red-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Buscar platillos, bebidas..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => { setSearchFocused(true); if (search) setMostrarResultados(true) }}
                onBlur={() => { setSearchFocused(false); setTimeout(() => setMostrarResultados(false), 180) }}
                className="w-full text-sm text-white placeholder-gray-500 outline-none bg-transparent font-medium"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setResultados([]); setMostrarResultados(false) }}
                  className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* Dropdown resultados */}
            {mostrarResultados && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,16,46,0.15)' }}>

                {resultados.length > 0 ? (
                  <>
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {resultados.map((producto, i) => (
                      <div
                        key={producto.id}
                        onClick={irAProducto}
                        className="result-item flex items-center justify-between px-4 py-3 cursor-pointer border-b border-white/4 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full bg-red-500`} />
                          <div>
                            <p className="text-sm font-bold text-white">{producto.nombre}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${CATEGORIA_COLORES[producto.categoria] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                              {producto.categoria}
                            </span>
                          </div>
                        </div>
                        <p className="text-red-400 font-black text-sm flex-shrink-0">{producto.precio}</p>
                      </div>
                    ))}
                    <div className="px-4 py-2.5 bg-red-600/10 border-t border-red-500/20">
                      <button onClick={() => navigate('/menu')} className="text-xs text-red-400 font-bold hover:text-red-300 transition w-full text-center">
                        Ver todos en el menú →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-sm text-gray-400 font-semibold">Sin resultados para "{search}"</p>
                    <p className="text-xs text-gray-600 mt-1">Prueba con otro nombre</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zona derecha */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Usuario - desktop */}
            {usuario ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/orders"
                  className="flex flex-col items-end leading-tight hover:opacity-80 transition"
                >
                  <span className="text-[10px] text-gray-500">Mi Cuenta</span>
                  <span className="text-white font-black text-sm">{nombreCorto}</span>
                </Link>
                <button
                  onClick={() => cerrarSesion()}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 hover:bg-red-600/20 hover:border-red-500/40 text-gray-400 hover:text-white transition-all duration-200 active:scale-95"
                  title="Cerrar sesión"
                >
                  <FiLogOut size={13} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex flex-col items-end leading-tight hover:opacity-80 transition"
              >
                <span className="text-[10px] text-gray-500">Identifícate</span>
                <span className="text-white font-black text-sm">Inicia sesión</span>
              </Link>
            )}

            {/* Icono usuario mobile */}
            <Link
              to={usuario ? '/orders' : '/login'}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 hover:border-red-500/40 text-gray-300 hover:text-white transition-all duration-200"
            >
              <FiUser size={16} />
            </Link>

            {/* Carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 hover:bg-red-600/20 hover:border-red-500/40 text-gray-300 hover:text-white transition-all duration-200 active:scale-90"
            >
              <FiShoppingCart size={16} />
              {totalItems > 0 && (
                <span className="cart-pulse absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center leading-none px-1 shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Línea inferior decorativa */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </nav>

      {/* ── SIDEBAR OVERLAY ────────────────────────────────── */}
      {menuOpen && (
        <div className="nav-font fixed inset-0 z-50 flex">

          {/* Panel */}
          <div className="sidebar-slide w-[300px] max-w-[88vw] bg-[#0d0d0d] h-full flex flex-col border-r border-white/8 shadow-2xl overflow-hidden">

            {/* Header sidebar */}
            <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 px-5 py-5 overflow-hidden">
              {/* Círculos decorativos */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/8 rounded-full" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/20 rounded-full translate-x-[-50%] translate-y-[50%]" />

              <div className="flex items-center justify-between relative z-10">
                {usuario ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {usuario.photoURL
                        ? <img src={usuario.photoURL} alt="" className="w-full h-full object-cover" />
                        : <FiUser className="text-white text-lg" />
                      }
                    </div>
                    <div>
                      <p className="text-white font-black text-sm leading-tight">{nombreCorto || 'Usuario'}</p>
                      <p className="text-red-200 text-[10px] truncate max-w-[140px]">{usuario.email}</p>
                      {(esAdmin || esEmpleado || esCocina) && (
                        <span className="text-[9px] bg-yellow-400 text-yellow-900 font-black px-1.5 py-0.5 rounded-full uppercase">
                          {datosUsuario?.rol}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                      <FiUser className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm">Iniciar sesión</p>
                      <p className="text-red-200 text-[10px]">Accede a tus pedidos</p>
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full text-white transition"
                >
                  <HiX size={16} />
                </button>
              </div>

              {/* Logo chico */}
              <div className="mt-3 relative z-10">
                <img src={lesq} alt="L'ESQ" className="h-6 object-contain opacity-60" />
              </div>
            </div>

            {/* Navegación rápida */}
            <div className="px-4 py-3 border-b border-white/5 flex gap-2">
              {[
                { to: '/',       icon: <FiHome size={14} />,         label: 'Inicio' },
                { to: '/orders', icon: <FiShoppingBag size={14} />,  label: 'Pedidos' },
                { to: '/menu',   icon: <MdOutlineLocalOffer size={14} />, label: 'Ofertas' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white/4 hover:bg-red-600/20 border border-white/5 hover:border-red-500/30 text-gray-400 hover:text-white transition-all duration-200"
                >
                  {item.icon}
                  <span className="text-[10px] font-bold">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Categorías */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3 px-1">
                Nuestra carta
              </p>
              <div className="flex flex-col gap-1">
                {CATEGORIAS_MENU.map((cat) => (
                  <Link
                    key={cat.nombre}
                    to="/menu"
                    onClick={() => setMenuOpen(false)}
                    className="cat-btn flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/8 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-red-400 group-hover:bg-red-600/20 group-hover:border-red-500/30 transition-all duration-200">
                        {cat.icon}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm leading-tight">{cat.nombre}</p>
                        <p className="text-gray-600 text-[10px]">{cat.desc}</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-700 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-200" size={14} />
                  </Link>
                ))}
              </div>

              {/* Paneles especiales (solo staff) */}
              {esAdmin && (
                <div className="mt-4">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2 px-1">
                    Panel staff
                  </p>
                  <div className="flex flex-col gap-1">
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="cat-btn flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/20 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                          <FiStar className="text-yellow-400" size={14} />
                        </div>
                        <p className="text-white font-bold text-sm">Admin</p>
                      </div>
                      <FiChevronRight className="text-gray-700 group-hover:text-yellow-400 transition" size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer sidebar */}
            <div className="px-4 py-4 border-t border-white/5 space-y-2">
              {usuario ? (
                <button
                  onClick={() => { cerrarSesion(); setMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-bold py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-200 text-sm"
                >
                  <FiLogOut size={14} />
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition text-sm"
                >
                  <FiUser size={14} />
                  Iniciar sesión
                </Link>
              )}
              <p className="text-[10px] text-gray-700 text-center">La Esquina © 2026 · Piura, Perú</p>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}
    </>
  )
}

export default Navbar