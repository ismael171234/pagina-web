import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductConfiguratorModal from '../components/ProductConfiguratorModal'
import { supabase } from '../supabase/supabaseClient'

import hamburguesaclasica1 from '../assets/hamburguesaclasica1.png'
import hamburguesaclasica2 from '../assets/hamburguesaclasica2.jpg'
import hamburguesaroyal    from '../assets/hamburguesaroyal.jpg'
import hamburguesaperuana  from '../assets/hamburguesa clasica.png'
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
import mediopollo          from '../assets/mediopollo.png'
import cuartoPollo         from '../assets/cuartodepollo.png'
import unoctavoPollo       from '../assets/unoctavodepollo.png'
import salchiCuarto        from '../assets/salchibrasauncuarto.png'
import salchiPapas         from '../assets/salchipapas.png'
import salchiClasica       from '../assets/salchiclasica.png'
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

const AD = [
  { nombre: 'Anticucho 1 palito',   extra: 7.00  },
  { nombre: 'Alitas 4 unidades',    extra: 9.00  },
  { nombre: 'Carne de hamburguesa', extra: 6.00  },
  { nombre: 'Chorizo',              extra: 3.50  },
  { nombre: 'Huevo frito',          extra: 1.50  },
  { nombre: 'Mollejitas',           extra: 8.00  },
  { nombre: 'Papas fritas',         extra: 10.00 },
  { nombre: 'Queso cheddar',        extra: 1.50  },
  { nombre: 'Salchicha',            extra: 2.50  },
  { nombre: 'Tocino',               extra: 2.00  },
  { nombre: 'Pollo a la brasa 1/8', extra: 7.00  },
  { nombre: 'Pollo a la brasa 1/4', extra: 14.00 },
]

// Helper: opciones de tamaño genéricas
const opTamano = (img) => ({
  titulo: 'Elige el tamaño', subtitulo: 'Elige 1 opción',
  items: [{ nombre: 'Personal', imagen: img }, { nombre: 'Grande', imagen: img }],
})
const opPorcion = (img) => ({
  titulo: 'Elige la porción', subtitulo: 'Elige 1 opción',
  items: [{ nombre: '6 unidades', imagen: img }, { nombre: '12 unidades', imagen: img }],
})
const opAcomp = () => ({
  titulo: 'Elige tu acompañamiento', subtitulo: 'Elige 1 opción',
  items: [{ nombre: 'Papas fritas' }, { nombre: 'Arroz chaufa' }, { nombre: 'Ensalada' }],
})
const opGaseosa = () => ({
  titulo: 'Elige tu gaseosa', subtitulo: 'Elige 1 opción',
  items: [
    { nombre: 'Coca Cola', imagen: cocacola },
    { nombre: 'Inca Kola', imagen: inkacola },
    { nombre: 'Fanta',     imagen: fanta    },
    { nombre: 'Sprint',    imagen: sprint   },
  ],
})
const complementos = { titulo: 'Adicionales', subtitulo: 'Opcional', items: AD }

const DEFAULT_CATEGORIES = [
  { nombre: 'Hamburguesas', color: '#e63946', descripcion: 'Artesanales · Jugosas · Irresistibles' },
  { nombre: 'Alitas', color: '#f4a261', descripcion: '6 sabores · Crujientes · Para compartir' },
  { nombre: 'Pollo a la Brasa', color: '#e63946', descripcion: 'A la lena · Jugoso · Con papas y ensalada' },
  { nombre: 'Salchis Salchis', color: '#e63946', descripcion: 'Papas · Chorizo · Pollo · Irresistibles' },
  { nombre: 'Especiales', color: '#7209b7', descripcion: 'Platos peruanos · Sabores de siempre' },
  { nombre: 'Combos', color: '#3a86ff', descripcion: 'Ahorra mas · Todo incluido · Gaseosa gratis' },
  { nombre: 'Bebidas', color: '#00b4d8', descripcion: 'Frias · Naturales · Refrescantes' },
  { nombre: 'Postres', color: '#f72585', descripcion: 'Dulces · Cremosos · El cierre perfecto' }
]

// Imagen de respaldo cuando un producto de Supabase no trae foto
const IMG_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#1a1a1a"/></svg>`
  )

// Helper to dynamically assign options and complements based on category and product name
const getOptionsAndComplements = (p, imagen) => {
  const nombre = p.nombre || ''
  const categoria = p.categoria || ''

  // Custom configurations for specific items
  if (nombre.includes('Ronda')) {
    return {
      opciones: {
        titulo: 'Elige tus 4 sabores',
        subtitulo: 'Hasta 4 opciones',
        items: [
          { nombre: 'BBQ' },
          { nombre: 'Acevichadas' },
          { nombre: 'Maracuya' },
          { nombre: 'Teriyaki' },
          { nombre: 'Honey Mustard' },
          { nombre: 'Mozarella' }
        ]
      },
      complementos
    }
  }

  if (nombre === 'Anticuchos') {
    return {
      opciones: {
        titulo: 'Elige la porción',
        subtitulo: 'Elige 1 opción',
        items: [{ nombre: '2 palitos' }, { nombre: '4 palitos' }]
      },
      complementos
    }
  }

  if (nombre === 'Brownie con Helado') {
    return {
      opciones: {
        titulo: 'Elige el sabor',
        subtitulo: 'Elige 1 opción',
        items: [{ nombre: 'Vainilla' }, { nombre: 'Chocolate' }, { nombre: 'Fresa' }]
      }
    }
  }

  // Fallback to category defaults
  switch (categoria) {
    case 'Hamburguesas':
      return { opciones: opTamano(imagen), complementos }
    case 'Alitas':
      return { opciones: opPorcion(imagen), complementos }
    case 'Pollo a la Brasa':
      return { opciones: opAcomp(), complementos }
    case 'Salchis Salchis':
      return {
        opciones: {
          titulo: 'Elige el tamaño',
          subtitulo: 'Elige 1 opción',
          items: [{ nombre: 'Regular' }, { nombre: 'Grande' }]
        },
        complementos
      }
    case 'Especiales':
      return {
        opciones: {
          titulo: 'Elige la porción/tamaño',
          subtitulo: 'Elige 1 opción',
          items: [{ nombre: 'Regular' }, { nombre: 'Grande' }]
        },
        complementos
      }
    case 'Combos':
      return { opciones: opGaseosa(), complementos }
    case 'Bebidas':
      return {
        opciones: {
          titulo: 'Elige el tamaño',
          subtitulo: 'Elige 1 opción',
          items: [{ nombre: 'Personal 500ml', imagen }, { nombre: 'Familiar 1.5L', imagen }]
        }
      }
    case 'Postres':
      return {
        opciones: {
          titulo: 'Elige el tamaño',
          subtitulo: 'Elige 1 opción',
          items: [{ nombre: 'Personal', imagen }, { nombre: 'Grande', imagen }]
        }
      }
    default:
      return {
        opciones: {
          titulo: 'Elige una opción',
          subtitulo: 'Elige 1 opción',
          items: [{ nombre: 'Regular' }]
        }
      }
  }
}

// Convierte un producto guardado en Supabase al formato que usa el frontend
function mapProductoDatabase(p) {
  const imagen = p.imagen_url || IMG_PLACEHOLDER
  const precio =
    typeof p.precio === 'number'
      ? `S/ ${p.precio.toFixed(2)}`
      : (p.precio || 'S/ 0.00')

  const { opciones, complementos: comps } = getOptionsAndComplements(p, imagen)

  const finalOpciones = p.opciones ? (
    p.opciones.tipo === 'estatico' ? null : {
      tipo: p.opciones.tipo,
      max_seleccion: p.opciones.max_seleccion,
      titulo: p.opciones.titulo || 'Elige una opción',
      subtitulo: p.opciones.tipo === 'sabores' ? `Elige hasta ${p.opciones.max_seleccion} sabores` : 'Elige 1 opción',
      items: p.opciones.items?.map(item => ({
        nombre: item.nombre,
        extra: parseFloat(item.extra) || 0,
        imagen: item.imagen || imagen
      })) || []
    }
  ) : opciones

  return {
    id: p.id,
    nombre: p.nombre || 'Producto sin nombre',
    precio,
    imagen,
    tag: p.tag || 'Nuevo',
    desc: p.descripcion || p.desc || '',
    opciones: finalOpciones,
    complementos: p.categoria === 'Bebidas' || p.categoria === 'Postres' ? undefined : comps,
    categoria: p.categoria,
    disponible: p.disponible
  }
}

// ── Hook reveal ────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function ProductCard({ producto, color, index, onSelect }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      onClick={onSelect}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`,
      }}
      className="group bg-[#141414] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/15 hover:shadow-2xl transition-all duration-300 flex flex-col"
    >
      <div className="relative w-full h-44 overflow-hidden flex-shrink-0">
        <img src={producto.imagen || producto.imagen_url} alt={producto.nombre} loading="lazy" decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider"
          style={{ background: color }}>{producto.tag}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-white font-bold text-sm leading-snug mb-1">{producto.nombre}</p>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">{producto.desc || producto.descripcion}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <p className="font-black text-base" style={{ color }}>
            {typeof producto.precio === 'number' ? `S/ ${producto.precio.toFixed(2)}` : producto.precio}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect() }}
            className="text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ background: color }}
          >Pedir</button>
        </div>
      </div>
    </div>
  )
}

function Menu() {
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const tabsRef   = useRef(null)
  const activoRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener categorias
      const { data: catData } = await supabase
        .from('categorias')
        .select('*')
        .order('id', { ascending: true })
      
      const listaCats = catData && catData.length > 0 ? catData : DEFAULT_CATEGORIES
      setCategorias(listaCats)

      // 2. Obtener productos
      const { data: prodData } = await supabase
        .from('productos')
        .select('*')
        .eq('disponible', true)
        .order('creado_en', { ascending: false })

      if (prodData) setProductos(prodData)

      // Seleccionar la primera por defecto si no hay activa
      if (listaCats.length > 0) {
        setCategoriaActiva(listaCats[0].nombre)
      }
    }
    fetchData()

    // Suscribirse en tiempo real
    const chanCats = supabase.channel('menu-realtime-cats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, fetchData)
      .subscribe()
    const chanProds = supabase.channel('menu-realtime-prods')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(chanCats)
      supabase.removeChannel(chanProds)
    }
  }, [])

  const cartaCombinada = useMemo(() => {
    const combinada = {}
    categorias.forEach((cat) => {
      const prodsFiltrados = productos
        .filter((p) => p.categoria === cat.nombre)
        .map(mapProductoDatabase)

      combinada[cat.nombre] = {
        color: cat.color || '#e63946',
        desc: cat.descripcion || '',
        productos: prodsFiltrados,
      }
    })
    return combinada
  }, [categorias, productos])

  const catData = cartaCombinada[categoriaActiva]
  const color   = catData?.color || '#e63946'

  useEffect(() => {
    if (activoRef.current && tabsRef.current) {
      activoRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [categoriaActiva])

  const productosActuales = catData?.productos || []
  const productoDestacado = productosActuales[0]
  const restoProductos    = productosActuales.slice(1)

  const handleSelect = (producto) => {
    setSelectedProduct(producto)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .menu-page, .menu-page * { font-family: 'Montserrat', sans-serif !important; }
        .tabs-scroll::-webkit-scrollbar { display: none; }
        .tabs-scroll { scrollbar-width: none; }
      `}</style>

      <div className="menu-page">
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0000 0%, #0a0a0a 100%)' }}>
          <div className="absolute inset-0">
            <img src={productoDestacado?.imagen || productoDestacado?.imagen_url} alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(24px) brightness(0.18)', transform: 'scale(1.1)' }} />
          </div>
          <div className="h-[3px] transition-all duration-500" style={{ background: color }} />
          <div className="relative z-10 px-5 pt-7 pb-0 max-w-6xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color }}>
              La Esquina — Carta completa
            </p>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-white font-black text-4xl md:text-5xl leading-none tracking-tight uppercase">{categoriaActiva}</h1>
                <p className="text-gray-500 text-xs mt-2 font-medium">{catData?.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-3xl" style={{ color }}>{productosActuales.length}</p>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Platos</p>
              </div>
            </div>
            <div ref={tabsRef} className="tabs-scroll flex gap-2 overflow-x-auto pb-4">
              {categorias.map((cat) => {
                const activo = cat.nombre === categoriaActiva
                const data   = cartaCombinada[cat.nombre]
                return (
                  <button key={cat.nombre} ref={activo ? activoRef : null}
                    onClick={() => setCategoriaActiva(cat.nombre)}
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border"
                    style={activo
                      ? { background: data.color, color: '#fff', borderColor: data.color, boxShadow: `0 4px 20px ${data.color}44` }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.08)' }
                    }>{cat.nombre}</button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-6 max-w-6xl mx-auto">
          {productoDestacado && (
            <div onClick={() => handleSelect(productoDestacado)}
              className="group relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-6 cursor-pointer border border-white/5 hover:border-white/15 transition-all duration-300">
              <img src={productoDestacado.imagen || productoDestacado.imagen_url} alt={productoDestacado.nombre} loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-7 md:px-10">
                <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider w-fit mb-3"
                  style={{ background: color }}>Destacado</span>
                <h2 className="text-white font-black text-3xl md:text-4xl leading-tight mb-2 uppercase tracking-tight">{productoDestacado.nombre}</h2>
                <p className="text-gray-300 text-sm mb-5 max-w-sm font-medium">{productoDestacado.desc || productoDestacado.descripcion}</p>
                <div className="flex items-center gap-4">
                  <p className="font-black text-2xl" style={{ color }}>
                    {typeof productoDestacado.precio === 'number' ? `S/ ${productoDestacado.precio.toFixed(2)}` : productoDestacado.precio}
                  </p>
                  <button onClick={(e) => { e.stopPropagation(); handleSelect(productoDestacado) }}
                    className="text-white font-bold text-sm px-6 py-2.5 rounded-lg transition active:scale-95"
                    style={{ background: color }}>Pedir ahora</button>
                </div>
              </div>
            </div>
          )}

          {restoProductos.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-5 rounded-full" style={{ background: color }} />
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Mas opciones</p>
                <div className="h-[1px] flex-1 bg-white/5 rounded-full" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {restoProductos.map((producto, i) => (
                  <ProductCard key={producto.id} producto={producto} color={color} index={i} onSelect={() => handleSelect(producto)} />
                ))}
              </div>
            </>
          )}



          <div className="mt-8 rounded-2xl bg-[#0d1f12] border border-green-900/40 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-green-400 font-bold text-sm">Prefiere pedir por WhatsApp</p>
              <p className="text-gray-600 text-xs mt-0.5">Atencion inmediata · +51 913 532 103</p>
            </div>
            <a href="https://wa.me/51913532103?text=Hola!%20Quiero%20hacer%20un%20pedido"
              target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition active:scale-95 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.916.518 3.71 1.424 5.255L2 22l4.878-1.399A9.944 9.944 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.182a8.164 8.164 0 01-4.168-1.144l-.299-.177-3.096.888.857-3.146-.196-.312A8.187 8.187 0 013.818 12c0-4.514 3.668-8.182 8.181-8.182 4.514 0 8.182 3.668 8.182 8.182 0 4.513-3.668 8.182-8.182 8.182z"/>
              </svg>
              Escribir
            </a>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductConfiguratorModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          color={color}
        />
      )}
    </div>
  )
}

export default Menu