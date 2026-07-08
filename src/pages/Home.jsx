import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { CARTA } from './Menu'
import ProductConfiguratorModal from '../components/ProductConfiguratorModal'

// Imágenes
const hamburguesaclasica1 = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesaclasica1.png'
const hamburguesaroyal    = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesaroyal.jpg'
const hamburguesaperuana  = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesa%20clasica.png'
const comboanticuchos     = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/comboanticuchos.png'
const comboalitas         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/comboalitas.png'
const combonuggets        = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/combonuggets.png'
const combopollobbq       = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/combopollobbq.png'
const cocacola            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/gaseosacocacola.png'
const inkacola            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/gaseosainkacola.png'
const maracuya            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/bebidamaracuya.png'
const brownie             = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/brownieconhelado.png'
const cheesecake          = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/cheesecakedefresa.png'
const alitasbbq           = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/alitas_BBQ.png'
const alitasAcevichadas   = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/alitas_acevichadas.png'
const rondabig            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/RondaBig.png'
const polloEntero         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/pollolabrasentero.png'
const mediopollo          = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/mediopollo.png'
const cuartoPollo         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/cuartodepollo.png'
const especialAnticucho   = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/especialanticucho.png'
const especialmollejitas  = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/especialmollejitas.png'
const lesqImg             = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/LESQ.png'

// ── Hook de Intersection Observer para lazy reveal ─────────
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ── Datos ───────────────────────────────────────────────────
const DESTACADOS = [
  { id: 1,  nombre: 'Hamburguesa Clásica',    precio: 'S/ 18.90', imagen: hamburguesaclasica1, tag: 'Más pedido',  cat: 'Hamburguesas' },
  { id: 2,  nombre: 'Hamburguesa Royal',       precio: 'S/ 22.90', imagen: hamburguesaroyal,    tag: 'Popular',     cat: 'Hamburguesas' },
  { id: 3,  nombre: 'Alitas BBQ',              precio: 'S/ 25.00', imagen: alitasbbq,           tag: 'Favorito',    cat: 'Alitas'       },
  { id: 4,  nombre: 'Alitas Acevichadas',      precio: 'S/ 25.00', imagen: alitasAcevichadas,   tag: 'Especial',    cat: 'Alitas'       },
  { id: 5,  nombre: 'Ronda Big 20un x4',       precio: 'S/ 59.00', imagen: rondabig,            tag: 'Para grupos', cat: 'Alitas'       },
  { id: 6,  nombre: 'Combo Anticuchos',        precio: 'S/ 35.90', imagen: comboanticuchos,     tag: 'Combo',       cat: 'Combos'       },
]

const CATEGORIAS = [
  { nombre: 'Hamburguesas',    imagen: hamburguesaclasica1 },
  { nombre: 'Alitas',          imagen: alitasbbq,          },
  { nombre: 'Pollo a la Brasa',imagen: polloEntero,        },
  { nombre: 'Combos',          imagen: comboanticuchos,    },
  { nombre: 'Bebidas',         imagen: cocacola,           },
  { nombre: 'Postres',         imagen: brownie,            },
]

const POPULARES = [
  { nombre: '1/2 Pollo a la Brasa', precio: 'S/ 33.00', imagen: mediopollo    },
  { nombre: '1/4 Pollo a la Brasa', precio: 'S/ 20.00', imagen: cuartoPollo   },
  { nombre: 'Combo Alitas',          precio: 'S/ 32.90', imagen: comboalitas   },
  { nombre: 'Anticuchos',            precio: 'S/ 18.00', imagen: especialAnticucho },
  { nombre: 'Mollejitas',            precio: 'S/ 16.00', imagen: especialmollejitas },
  { nombre: 'Brownie c/ Helado',     precio: 'S/ 12.90', imagen: brownie       },
]

// ── Componente ProductCard ──────────────────────────────────
// Helper para obtener el producto completo con todas sus opciones y complementos de la CARTA centralizada
const getFullProduct = (nombreSimplified) => {
  const clean = (s) => s.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
    .replace(/[^a-z0-9]/g, '')
  
  const searchName = clean(nombreSimplified)
  
  if (searchName.includes('hamburguesaclasica')) return { ...CARTA.Hamburguesas.productos.find(p => p.id === 1), color: CARTA.Hamburguesas.color }
  if (searchName.includes('hamburguesaroyal')) return { ...CARTA.Hamburguesas.productos.find(p => p.id === 3), color: CARTA.Hamburguesas.color }
  if (searchName.includes('browniechelado') || searchName.includes('brownieconhelado')) return { ...CARTA.Postres.productos.find(p => p.id === 37), color: CARTA.Postres.color }
  
  for (const catName in CARTA) {
    const prod = CARTA[catName].productos.find(p => {
      const cleanP = clean(p.nombre)
      return cleanP.includes(searchName) || searchName.includes(cleanP)
    })
    if (prod) return { ...prod, color: CARTA[catName].color }
  }
  return null
}

// ── Componente ProductCard ──────────────────────────────────
function ProductCard({ producto, index = 0, onSelect }) {
  const [ref, visible] = useReveal()

  return (
    <div
      ref={ref}
      onClick={onSelect}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s`,
      }}
      className="group relative bg-[#111] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-red-500/50 hover:shadow-[0_0_24px_rgba(200,16,46,0.25)] transition-all duration-300"
    >
      {/* Imagen */}
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {producto.tag && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
            {producto.tag}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3.5">
        <p className="text-white font-bold text-sm leading-tight line-clamp-1">{producto.nombre}</p>
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-red-400 font-black text-base">{producto.precio}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect() }}
            className="bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black px-3.5 py-1.5 rounded-full transition-all duration-150 shadow-md"
          >
            + Pedir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Hero Slider ─────────────────────────────────────────────
const SLIDES = [
  {
    titulo: 'El sabor que\nno olvidas',
    sub: 'Hamburguesas, alitas y pollo a la brasa. La Esquina, de Piura para ti.',
    cta: 'Pedir ahora',
    bg: 'from-red-900/90 via-black/60 to-black/80',
    img: hamburguesaclasica1,
  },
  {
    titulo: 'Alitas para\ntoda ocasión',
    sub: '6 sabores únicos. Rondas para grupos. El sabor que todos piden.',
    cta: 'Ver alitas',
    bg: 'from-orange-900/90 via-black/60 to-black/80',
    img: rondabig,
  },
  {
    titulo: 'Pollo a la brasa\nde verdad',
    sub: 'Crujiente por fuera, jugoso por dentro. La receta de siempre.',
    cta: 'Ver carta',
    bg: 'from-yellow-900/90 via-black/60 to-black/80',
    img: polloEntero,
  },
]

function HeroSlider() {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[active]

  return (
    <div className="relative w-full h-[54vw] max-h-[420px] min-h-[260px] overflow-hidden">
      {/* Imagen de fondo */}
      {SLIDES.map((s, i) => (
        <img
          key={i}
          src={s.img}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}

      {/* Overlay degradado */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`} />

      {/* Contenido */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 max-w-2xl">
        <div key={active} style={{ animation: 'heroFadeUp 0.6s ease forwards' }}>
          <p className="text-red-400 text-xs font-black uppercase tracking-[0.2em] mb-2">La Esquina · Piura</p>
          <h1 className="text-white font-black text-3xl md:text-5xl leading-tight mb-3 drop-shadow-lg whitespace-pre-line">
            {slide.titulo}
          </h1>
          <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-5 max-w-sm drop-shadow">
            {slide.sub}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/menu')}
              className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black px-6 py-3 rounded-full text-sm shadow-xl transition-all duration-150"
            >
              {slide.cta} →
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold px-5 py-3 rounded-full text-sm border border-white/20 transition-all duration-150"
            >
              Ver menú
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-red-500' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Sección wrapper con reveal ──────────────────────────────
function Section({ children, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      {children}
    </div>
  )
}

// ── HOME ────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeColor, setActiveColor] = useState('#e63946')

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans">

      {/* ── HERO ── */}
      <HeroSlider />

      {/* ── ANUNCIO RÁPIDO ── */}
      <div className="bg-red-600 px-4 py-2.5 flex items-center justify-center gap-3">
        <span className="text-yellow-300 text-sm"></span>
        <p className="text-white text-xs font-bold text-center">
          Pedidos por WhatsApp · Recoge en local · Delivery disponible
        </p>
        <span className="text-yellow-300 text-sm"></span>
      </div>

      {/* ── CATEGORÍAS ── */}
      <Section className="px-4 pt-7 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.15em]">Explora</p>
            <h2 className="text-white font-black text-lg">Categorías</h2>
          </div>
          <Link to="/menu" className="text-red-400 text-xs font-bold hover:text-red-300 transition">
            Ver todo →
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATEGORIAS.map((cat, i) => (
            <Link
              key={cat.nombre}
              to="/menu"
              style={{
                animationDelay: `${i * 60}ms`,
                animation: 'catPop 0.4s ease forwards',
                opacity: 0,
              }}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-[#1a1a1a] border border-white/5 hover:border-red-500/60 hover:shadow-[0_0_18px_rgba(200,16,46,0.3)] transition-all duration-300"
            >
              <img
                src={cat.imagen}
                alt={cat.nombre}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2.5 px-1">
                <span className="text-xl mb-0.5">{cat.emoji}</span>
                <p className="text-white font-black text-[10px] text-center leading-tight">{cat.nombre}</p>
              </div>
            </Link>
          ))}
        </div>

        <style>{`
          @keyframes catPop {
            from { opacity: 0; transform: scale(0.9); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </Section>

      {/* ── LO MÁS PEDIDO ── */}
      <section className="px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.15em]">Destacados</p>
            <h2 className="text-white font-black text-lg">Lo más pedido</h2>
          </div>
          <Link to="/menu" className="text-red-400 text-xs font-bold hover:text-red-300 transition">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DESTACADOS.map((p, i) => (
            <ProductCard
              key={p.id}
              producto={p}
              index={i}
              onSelect={() => {
                const full = getFullProduct(p.nombre)
                if (full) {
                  setSelectedProduct(full)
                  setActiveColor(full.color || '#e63946')
                } else {
                  navigate('/menu')
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* ── BANNER ALITAS ── */}
      <Section className="mx-4 mt-8 rounded-3xl overflow-hidden relative h-44 md:h-52">
        <img
          src={rondabig}
          alt="Ronda de Alitas"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Para grupos</p>
          <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-1">
            Ronda Big<br />
            <span className="text-red-400">20 alitas · 4 sabores</span>
          </h3>
          <p className="text-gray-300 text-xs mb-4">El favorito para compartir en La Esquina</p>
          <button
            onClick={() => {
              const full = getFullProduct('Ronda Big 20un x4')
              if (full) {
                setSelectedProduct(full)
                setActiveColor(full.color || '#f4a261')
              } else {
                navigate('/menu')
              }
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-2.5 rounded-full w-fit shadow-xl transition active:scale-95"
          >
            Pedir ahora — S/ 59.00
          </button>
        </div>
      </Section>

      {/* ── TAMBIÉN TE PUEDE GUSTAR ── */}
      <section className="px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.15em]">Descubre</p>
            <h2 className="text-white font-black text-lg">También te puede gustar</h2>
          </div>
        </div>

        {/* Scroll horizontal en móvil, grid en desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-6 md:overflow-visible snap-x snap-mandatory">
          {POPULARES.map((p, i) => (
            <div
              key={p.nombre}
              onClick={() => {
                const full = getFullProduct(p.nombre)
                if (full) {
                  setSelectedProduct(full)
                  setActiveColor(full.color || '#e63946')
                } else {
                  navigate('/menu')
                }
              }}
              className="flex-shrink-0 snap-start w-36 md:w-auto group cursor-pointer"
              style={{
                animation: `catPop 0.4s ease ${i * 60}ms forwards`,
                opacity: 0,
              }}
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5 group-hover:border-red-500/50 transition-all duration-300 mb-2">
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <p className="text-white text-xs font-bold leading-tight line-clamp-2">{p.nombre}</p>
              <p className="text-red-400 text-xs font-black mt-0.5">{p.precio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANNER COMBO ── */}
      <Section className="mx-4 mt-8 rounded-3xl overflow-hidden relative h-40 md:h-48">
        <img
          src={comboanticuchos}
          alt="Combo del día"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-end px-6 text-right">
          <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Oferta del día</p>
          <h3 className="text-white font-black text-xl md:text-2xl leading-tight mb-3">
            Combo<br />Anticuchos
          </h3>
          <button
            onClick={() => {
              const full = getFullProduct('Combo Anticuchos')
              if (full) {
                setSelectedProduct(full)
                setActiveColor(full.color || '#3a86ff')
              } else {
                navigate('/menu')
              }
            }}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-xl transition active:scale-95"
          >
            Solo S/ 35.90 →
          </button>
        </div>
      </Section>

      {/* ── CTA FINAL ── */}
      <Section className="mx-4 mb-10 rounded-3xl overflow-hidden relative">
        <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 px-6 py-8 text-center relative overflow-hidden">
          {/* Círculos decorativos */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />

          <p className="text-red-200 text-[10px] font-black uppercase tracking-widest mb-2">¿Listo para pedir?</p>
          <h3 className="text-white font-black text-2xl mb-2 leading-tight">
            Tu próximo plato<br />favorito te espera
          </h3>
          <p className="text-red-200 text-xs mb-6 max-w-xs mx-auto">
            Elige tus favoritos y ordena ahora mismo. Rápido, fácil y delicioso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/menu"
              className="bg-white text-red-700 font-black px-8 py-3 rounded-full text-sm shadow-xl hover:bg-red-50 transition active:scale-95"
            >
              Ver carta completa
            </Link>
            <a
              href="https://wa.me/51913532103?text=Hola!%20Quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white font-black px-8 py-3 rounded-full text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.916.518 3.71 1.424 5.255L2 22l4.878-1.399A9.944 9.944 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.182a8.164 8.164 0 01-4.168-1.144l-.299-.177-3.096.888.857-3.146-.196-.312A8.187 8.187 0 013.818 12c0-4.514 3.668-8.182 8.181-8.182 4.514 0 8.182 3.668 8.182 8.182 0 4.513-3.668 8.182-8.182 8.182z"/>
              </svg>
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </Section>

      {selectedProduct && (
        <ProductConfiguratorModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          color={activeColor}
        />
      )}
    </div>
  )
}

export default Home