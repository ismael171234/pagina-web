import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductConfiguratorModal from '../components/ProductConfiguratorModal'
import { supabase } from '../supabase/supabaseClient'

const hamburguesaclasica1 = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesaclasica1.png'
const hamburguesaclasica2 = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesaclasica2.jpg'
const hamburguesaroyal    = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesaroyal.jpg'
const hamburguesaperuana  = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/hamburguesa%20clasica.png'
const alitasAcevichadas   = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/alitas_acevichadas.png'
const alitasBBQ           = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/alitas_BBQ.png'
const alitasMaracuya      = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/alitas_maracuya.png'
const alitasMozarella     = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/alitas_mozarella.png'
const alitasTeriyaki      = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/Alitas_teriyaki.png'
const honeyMustard        = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/honey_mustard.png'
const rondaMini           = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/RondaMiniAlitas.png'
const rondaFresh          = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/Ronda_Fresh.png'
const rondaBig            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/RondaBig.png'
const polloEntero         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/pollolabrasentero.png'
const mediopollo          = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/mediopollo.png'
const cuartoPollo         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/cuartodepollo.png'
const unoctavoPollo       = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/unoctavodepollo.png'
const salchiCuarto        = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/salchibrasauncuarto.png'
const salchiPapas         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/salchipapas.png'
const salchiClasica       = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/salchiclasica.png'
const especialAguadito    = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/especialaguadito.png'
const especialAnticucho   = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/especialanticucho.png'
const especialChaufa      = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/especialarrozchaufa.png'
const especialMollejitas  = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/especialmollejitas.png'
const comboanticuchos     = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/comboanticuchos.png'
const comboalitas         = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/comboalitas.png'
const combonuggets        = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/combonuggets.png'
const combopollobbq       = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/combopollobbq.png'
const cocacola            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/gaseosacocacola.png'
const fanta               = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/gaseosafanta.png'
const inkacola            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/gaseosainkacola.png'
const sprint              = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/gaseosaSprint.png'
const maracuya            = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/bebidamaracuya.png'
const chichamorada        = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/chichamoradabebida.png'
const arrozconleche       = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/arrozconleche.png'
const brownie             = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/brownieconhelado.png'
const cheesecake          = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/cheesecakedefresa.png'
const torta               = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/tortahumedadechocolate.png'

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

const opTamano = (img) => ({ titulo: 'Elige el tamaño', subtitulo: 'Elige 1 opción', items: [{ nombre: 'Personal', imagen: img }, { nombre: 'Grande', imagen: img }] })
const opPorcion = (img) => ({ titulo: 'Elige la porción', subtitulo: 'Elige 1 opción', items: [{ nombre: '6 unidades', imagen: img }, { nombre: '12 unidades', imagen: img }] })
const opAcomp = () => ({ titulo: 'Elige tu acompañamiento', subtitulo: 'Elige 1 opción', items: [{ nombre: 'Papas fritas' }, { nombre: 'Arroz chaufa' }, { nombre: 'Ensalada' }] })
const opGaseosa = () => ({ titulo: 'Elige tu gaseosa', subtitulo: 'Elige 1 opción', items: [{ nombre: 'Coca Cola', imagen: cocacola }, { nombre: 'Inca Kola', imagen: inkacola }, { nombre: 'Fanta', imagen: fanta }, { nombre: 'Sprint', imagen: sprint }] })
const complementos = { titulo: 'Adicionales', subtitulo: 'Opcional', items: AD }

export const CARTA = {
  Hamburguesas: {
    color: '#e63946', desc: 'Artesanales · Jugosas · Irresistibles',
    productos: [
      { id:1,  nombre:'La Lorna',      precio:'S/ 11.00', imagen:hamburguesaclasica1, tag:'Clasica',  desc:'Pan, carne, lechuga, tomate y mayonesa',                 opciones: opTamano(hamburguesaclasica1), complementos },
      { id:2,  nombre:'La Ruca',       precio:'S/ 14.00', imagen:hamburguesaclasica2, tag:'Popular',  desc:'Doble queso, cebolla caramelizada y salsa especial',      opciones: opTamano(hamburguesaclasica2), complementos },
      { id:3,  nombre:'La Asolapada',  precio:'S/ 14.00', imagen:hamburguesaroyal,    tag:'Especial', desc:'Con tocino, huevo frito y salsa secreta de La Esquina',   opciones: opTamano(hamburguesaroyal),    complementos },
      { id:4,  nombre:'Don C',         precio:'S/ 17.00', imagen:hamburguesaperuana,  tag:'Premium',  desc:'La burger mas grande: doble carne, triple queso y mas',   opciones: opTamano(hamburguesaperuana),  complementos },
    ],
  },
  Alitas: {
    color: '#f4a261', desc: '6 sabores · Crujientes · Para compartir',
    productos: [
      { id:5,  nombre:'Alitas Acevichadas',   precio:'S/ 25.00', imagen:alitasAcevichadas, tag:'Especial', desc:'Marinadas en leche de tigre con aji amarillo', opciones: opPorcion(alitasAcevichadas), complementos },
      { id:6,  nombre:'Alitas BBQ',           precio:'S/ 25.00', imagen:alitasBBQ,         tag:'Favorito', desc:'Banadas en BBQ ahumado caramelizado',          opciones: opPorcion(alitasBBQ),         complementos },
      { id:7,  nombre:'Alitas Maracuya',      precio:'S/ 25.00', imagen:alitasMaracuya,    tag:'Tropical', desc:'Glaseado tropical de maracuya brillante',      opciones: opPorcion(alitasMaracuya),    complementos },
      { id:8,  nombre:'Alitas Mozarella',     precio:'S/ 25.00', imagen:alitasMozarella,   tag:'Cremoso',  desc:'Con mozzarella derretida y salsa especial',    opciones: opPorcion(alitasMozarella),   complementos },
      { id:9,  nombre:'Alitas Teriyaki',      precio:'S/ 25.00', imagen:alitasTeriyaki,    tag:'Oriental', desc:'Salsa teriyaki japonesa brillante y dulce',    opciones: opPorcion(alitasTeriyaki),    complementos },
      { id:10, nombre:'Alitas Honey Mustard', precio:'S/ 25.00', imagen:honeyMustard,      tag:'Dorado',   desc:'Glaseado de miel y mostaza irresistible',      opciones: opPorcion(honeyMustard),      complementos },
      { id:11, nombre:'Ronda Mini 12un x4',   precio:'S/ 39.00', imagen:rondaMini,         tag:'Para 2',   desc:'12 alitas con 4 sabores a elegir',             opciones:{ titulo:'Elige tus 4 sabores', subtitulo:'Hasta 4 opciones', items:[{nombre:'BBQ'},{nombre:'Acevichadas'},{nombre:'Maracuya'},{nombre:'Teriyaki'},{nombre:'Honey Mustard'},{nombre:'Mozarella'}]}, complementos },
      { id:12, nombre:'Ronda Fresh 16un x4',  precio:'S/ 49.00', imagen:rondaFresh,        tag:'Para 3',   desc:'16 alitas con 4 sabores a elegir',             opciones:{ titulo:'Elige tus 4 sabores', subtitulo:'Hasta 4 opciones', items:[{nombre:'BBQ'},{nombre:'Acevichadas'},{nombre:'Maracuya'},{nombre:'Teriyaki'},{nombre:'Honey Mustard'},{nombre:'Mozarella'}]}, complementos },
      { id:13, nombre:'Ronda Big 20un x4',    precio:'S/ 59.00', imagen:rondaBig,          tag:'Grupos',   desc:'20 alitas con 4 sabores a elegir',             opciones:{ titulo:'Elige tus 4 sabores', subtitulo:'Hasta 4 opciones', items:[{nombre:'BBQ'},{nombre:'Acevichadas'},{nombre:'Maracuya'},{nombre:'Teriyaki'},{nombre:'Honey Mustard'},{nombre:'Mozarella'}]}, complementos },
    ],
  },
  'Pollo a la Brasa': {
    color: '#e63946', desc: 'A la lena · Jugoso · Con papas y ensalada',
    productos: [
      { id:14, nombre:'Pollo Entero',         precio:'S/ 57.00', imagen:polloEntero,   tag:'Familiar',   desc:'Pollo entero con ensalada y papas fritas',   opciones: opAcomp(), complementos },
      { id:15, nombre:'1/2 Pollo a la Brasa', precio:'S/ 33.00', imagen:mediopollo,    tag:'Popular',    desc:'Media pollo con ensalada y papas fritas',    opciones: opAcomp(), complementos },
      { id:16, nombre:'1/4 Pollo a la Brasa', precio:'S/ 20.00', imagen:cuartoPollo,   tag:'Personal',   desc:'Cuarto de pollo con ensalada y papas fritas', opciones: opAcomp(), complementos },
      { id:17, nombre:'1/8 Pollo a la Brasa', precio:'S/ 12.00', imagen:unoctavoPollo, tag:'Individual', desc:'Presa de pollo con ensalada y papas fritas',  opciones: opAcomp(), complementos },
    ],
  },
  'Salchis Salchis': {
    color: '#e63946', desc: 'Papas · Chorizo · Pollo · Irresistibles',
    productos: [
      { id:18, nombre:'Salchi Cardiaca',  precio:'S/ 22.00', imagen:salchiPapas,  tag:'Especial', desc:'Chorizo, salchicha, carne, queso, huevo y platano',  opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Regular'},{nombre:'Grande'}]}, complementos },
      { id:19, nombre:'Salchi Brasa 1/4', precio:'S/ 26.00', imagen:salchiCuarto, tag:'Popular',  desc:'1/4 pollo brasa, chorizo, salchicha y papas fritas', opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Regular'},{nombre:'Grande'}]}, complementos },
      { id:20, nombre:'Salchi Brasa 1/8', precio:'S/ 16.00', imagen:salchiPapas,  tag:'Personal', desc:'1/8 pollo brasa, chorizo, salchicha y papas fritas', opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Regular'},{nombre:'Grande'}]}, complementos },
      { id:21, nombre:'Salchi Clasica',   precio:'S/ 12.00', imagen:salchiClasica,tag:'Clasica',  desc:'Chorizo, salchicha y papas fritas',                  opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Regular'},{nombre:'Grande'}]}, complementos },
    ],
  },
  Especiales: {
    color: '#7209b7', desc: 'Platos peruanos · Sabores de siempre',
    productos: [
      { id:22, nombre:'Aguadito',              precio:'S/ 6.00',  imagen:especialAguadito,   tag:'Clasico',  desc:'Caldo verde con pollo, arroz y hierbas frescas', opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal'},{nombre:'Grande'}]}, complementos },
      { id:23, nombre:'Anticuchos',            precio:'S/ 18.00', imagen:especialAnticucho,  tag:'Popular',  desc:'A la parrilla con ensalada y papas fritas',      opciones:{ titulo:'Elige la porcion', subtitulo:'Elige 1 opcion', items:[{nombre:'2 palitos'},{nombre:'4 palitos'}]}, complementos },
      { id:24, nombre:'Arroz Chaufa de Pollo', precio:'S/ 10.00', imagen:especialChaufa,     tag:'Nuevo',    desc:'Con pollo, brotes de soya y cebolla china',      opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal'},{nombre:'Grande'}]}, complementos },
      { id:25, nombre:'Mollejitas',            precio:'S/ 16.00', imagen:especialMollejitas, tag:'Especial', desc:'A la parrilla con ensalada y papas fritas',      opciones:{ titulo:'Elige la porcion', subtitulo:'Elige 1 opcion', items:[{nombre:'Regular'},{nombre:'Grande'}]}, complementos },
    ],
  },
  Combos: {
    color: '#3a86ff', desc: 'Ahorra mas · Todo incluido · Gaseosa gratis',
    productos: [
      { id:26, nombre:'Combo Anticuchos', precio:'S/ 35.90', imagen:comboanticuchos, tag:'Ahorro', desc:'Anticuchos + papas fritas + gaseosa personal', opciones: opGaseosa(), complementos },
      { id:27, nombre:'Combo Alitas',     precio:'S/ 32.90', imagen:comboalitas,     tag:'Ahorro', desc:'Alitas crujientes + papas fritas + gaseosa',   opciones: opGaseosa(), complementos },
      { id:28, nombre:'Combo Nuggets',    precio:'S/ 28.90', imagen:combonuggets,    tag:'Ahorro', desc:'Nuggets dorados + papas fritas + gaseosa',     opciones: opGaseosa(), complementos },
      { id:29, nombre:'Combo Pollo BBQ',  precio:'S/ 34.90', imagen:combopollobbq,   tag:'Ahorro', desc:'Pollo a la parrilla BBQ + papas + gaseosa',    opciones: opGaseosa(), complementos },
    ],
  },
  Bebidas: {
    color: '#00b4d8', desc: 'Frias · Naturales · Refrescantes',
    productos: [
      { id:30, nombre:'Coca Cola',     precio:'S/ 5.90', imagen:cocacola,    tag:'Gaseosa', desc:'Botella personal 500ml bien fria',        opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal 500ml',imagen:cocacola},{nombre:'Familiar 1.5L',imagen:cocacola}]}},
      { id:31, nombre:'Fanta',         precio:'S/ 5.90', imagen:fanta,       tag:'Gaseosa', desc:'Botella personal 500ml bien fria',        opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal 500ml',imagen:fanta},{nombre:'Familiar 1.5L',imagen:fanta}]}},
      { id:32, nombre:'Inca Kola',     precio:'S/ 5.90', imagen:inkacola,    tag:'Gaseosa', desc:'La bebida de sabor nacional',             opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal 500ml',imagen:inkacola},{nombre:'Familiar 1.5L',imagen:inkacola}]}},
      { id:33, nombre:'Sprint',        precio:'S/ 4.90', imagen:sprint,      tag:'Gaseosa', desc:'Botella personal 500ml bien fria',        opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal 500ml',imagen:sprint},{nombre:'Familiar 1.5L',imagen:sprint}]}},
      { id:34, nombre:'Maracuya',      precio:'S/ 6.50', imagen:maracuya,    tag:'Natural', desc:'Jugo natural de maracuya fresco del dia', opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal',imagen:maracuya},{nombre:'Grande',imagen:maracuya}]}},
      { id:35, nombre:'Chicha Morada', precio:'S/ 6.50', imagen:chichamorada,tag:'Natural', desc:'Preparada artesanalmente',                opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal',imagen:chichamorada},{nombre:'Grande',imagen:chichamorada}]}},
    ],
  },
  Postres: {
    color: '#f72585', desc: 'Dulces · Cremosos · El cierre perfecto',
    productos: [
      { id:36, nombre:'Arroz con Leche',     precio:'S/ 8.90',  imagen:arrozconleche, tag:'Clasico',  desc:'Cremoso con canela y leche evaporada',      opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal',imagen:arrozconleche},{nombre:'Grande',imagen:arrozconleche}]}},
      { id:37, nombre:'Brownie con Helado',  precio:'S/ 12.90', imagen:brownie,       tag:'Favorito', desc:'Tibio con bola de helado de vainilla',       opciones:{ titulo:'Elige el sabor', subtitulo:'Elige 1 opcion', items:[{nombre:'Vainilla',imagen:brownie},{nombre:'Chocolate',imagen:brownie},{nombre:'Fresa',imagen:brownie}]}},
      { id:38, nombre:'Cheesecake de Fresa', precio:'S/ 11.90', imagen:cheesecake,    tag:'Postre',   desc:'Cremoso con coulis de fresa natural',        opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal',imagen:cheesecake},{nombre:'Grande',imagen:cheesecake}]}},
      { id:39, nombre:'Torta de Chocolate',  precio:'S/ 10.90', imagen:torta,         tag:'Postre',   desc:'Humeda con ganache de chocolate',            opciones:{ titulo:'Elige el tamano', subtitulo:'Elige 1 opcion', items:[{nombre:'Personal',imagen:torta},{nombre:'Grande',imagen:torta}]}},
    ],
  },
}

const CATEGORIAS = Object.keys(CARTA)

const COLORES_CATEGORIA = {
  Hamburguesas: '#e63946', Alitas: '#f4a261', 'Pollo a la Brasa': '#e63946',
  'Salchis Salchis': '#e63946', Especiales: '#7209b7', Combos: '#3a86ff',
  Bebidas: '#00b4d8', Postres: '#f72585',
}

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
  const [categoriaActiva, setCategoriaActiva] = useState('Hamburguesas')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productosSupabase, setProductosSupabase] = useState([])
  const tabsRef   = useRef(null)
  const activoRef = useRef(null)
  const catData   = CARTA[categoriaActiva]
  const color     = catData?.color || '#e63946'

  useEffect(() => {
    const fetchProductos = async () => {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .eq('disponible', true)
        .order('creado_en', { ascending: false })
      if (data) setProductosSupabase(data)
    }
    fetchProductos()

    const sub = supabase.channel('menu-productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, fetchProductos)
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  useEffect(() => {
    if (activoRef.current && tabsRef.current) {
      activoRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [categoriaActiva])

  const productosNuevos = productosSupabase
    .filter(p => p.categoria === categoriaActiva)
    .map(p => ({
      ...p,
      imagen: p.imagen_url,
      precio: `S/ ${parseFloat(p.precio).toFixed(2)}`,
      opciones: { titulo: 'Elige el tamaño', subtitulo: 'Elige 1 opción', items: [{ nombre: 'Personal' }, { nombre: 'Grande' }] },
      complementos,
    }))

  const productosActuales = catData ? [...catData.productos, ...productosNuevos] : productosNuevos

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
              {CATEGORIAS.map((cat) => {
                const activo = cat === categoriaActiva
                const data   = CARTA[cat]
                return (
                  <button key={cat} ref={activo ? activoRef : null}
                    onClick={() => setCategoriaActiva(cat)}
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border"
                    style={activo
                      ? { background: data.color, color: '#fff', borderColor: data.color, boxShadow: `0 4px 20px ${data.color}44` }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.08)' }
                    }>{cat}</button>
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

          {productosNuevos.length > 0 && (
            <div className="mt-4 flex items-center gap-3 mb-2">
              <div className="h-[2px] w-5 rounded-full bg-green-500" />
              <p className="text-green-500 text-[11px] font-bold uppercase tracking-widest">Nuevos en la carta</p>
              <div className="h-[1px] flex-1 bg-white/5 rounded-full" />
            </div>
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