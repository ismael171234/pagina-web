import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { FiX, FiCheck, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'

export default function ProductConfiguratorModal({ producto, onClose, color }) {
  const { agregarProducto } = useCart()

  const [cantidad, setCantidad]       = useState(1)
  const [opcion, setOpcion]           = useState(null)
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([])
  const [adicionales, setAdicionales] = useState([])
  const [agregado, setAgregado]       = useState(false)

  if (!producto) return null

  // Firebase price is in string 'S/ 11.00'. Convert it to float.
  const base = typeof producto.precio === 'string'
    ? parseFloat(producto.precio.replace('S/ ', ''))
    : (producto.precio || 0)

  const esMultiselect = producto.opciones?.tipo === 'sabores' && producto.opciones?.max_seleccion > 1
  const maxSeleccion = producto.opciones?.max_seleccion || 1

  // Calcular extra por variación de tamaño
  const optionExtra = producto.opciones && !esMultiselect
    ? (producto.opciones.items.find(i => i.nombre === opcion)?.extra || 0)
    : 0

  const extraSum = adicionales.reduce((s, a) => s + a.extra, 0)
  const total = ((base + optionExtra + extraSum) * cantidad).toFixed(2)
  
  const opcionOK = !producto.opciones || (esMultiselect ? opcionesSeleccionadas.length > 0 : !!opcion)

  // Agregar una unidad de adicional
  const addAd = (item) => setAdicionales(prev => [...prev, item])
  // Quitar una unidad de adicional
  const removeAd = (item) => setAdicionales(prev => {
    const idx = prev.findLastIndex(a => a.nombre === item.nombre)
    if (idx === -1) return prev
    return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
  })
  const countAd = (nombre) => adicionales.filter(a => a.nombre === nombre).length

  // Manejo de multiselección de sabores
  const toggleSabor = (nombre) => {
    setOpcionesSeleccionadas(prev => {
      if (prev.includes(nombre)) {
        return prev.filter(x => x !== nombre)
      }
      if (prev.length >= maxSeleccion) {
        // Reemplazar el primero si supera el max
        return [...prev.slice(1), nombre]
      }
      return [...prev, nombre]
    })
  }

  const handleAgregar = () => {
    if (!opcionOK) return
    const comp = adicionales.length
      ? { nombre: adicionales.map(a => a.nombre).join(', '), extra: extraSum }
      : null
    
    const opcionFinal = esMultiselect ? opcionesSeleccionadas.join(', ') : opcion
    
    // We pass producto object, cantidad, opcion, comp
    agregarProducto(producto, cantidad, opcionFinal, comp)
    setAgregado(true)
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-white max-h-[90vh]">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white rounded-full p-2 transition z-10"
        >
          <FiX size={18} />
        </button>

        {/* ── COL IZQUIERDA: Info e Imagen ── */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 bg-[#141414]">
          <div className="flex-1 flex flex-col justify-center items-center">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full max-w-[280px] md:max-w-full aspect-[4/3] object-contain rounded-2xl bg-[#0f0f0f]/40 p-2 border border-white/5 shadow-inner"
            />
            <p className="text-gray-500 text-[10px] italic mt-2">*Imágenes referenciales</p>
          </div>
          <div className="mt-4">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-fit"
              style={{ background: color || '#dc2626' }}
            >
              {producto.tag || 'Popular'}
            </span>
            <h2 className="text-white font-black text-2xl mt-2 leading-tight uppercase">{producto.nombre}</h2>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed font-medium">{producto.desc}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-gray-500 text-xs font-semibold">Precio unitario base:</span>
              <span className="text-lg font-black" style={{ color: color || '#dc2626' }}>{producto.precio}</span>
            </div>
          </div>
        </div>

        {/* ── COL DERECHA: Opciones y Adicionales ── */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-[#0a0a0a]">
          
          <div className="flex-1 space-y-5 pb-20">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
              Personaliza tu pedido
            </h3>

            {/* Opciones requeridas */}
            {producto.opciones && (
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111]">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{producto.opciones.titulo}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      {esMultiselect ? `Elige hasta ${maxSeleccion} opciones` : producto.opciones.subtitulo}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${opcionOK ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {opcionOK ? 'Completado' : 'Requerido'}
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {producto.opciones.items.map((item) => {
                    const selected = esMultiselect
                      ? opcionesSeleccionadas.includes(item.nombre)
                      : opcion === item.nombre
                    return (
                      <div
                        key={item.nombre}
                        onClick={() => esMultiselect ? toggleSabor(item.nombre) : setOpcion(item.nombre)}
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          {item.imagen && (
                            <img src={item.imagen} alt="" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{item.nombre}</p>
                            {item.extra > 0 && (
                              <p className="text-[10px] text-red-400 font-bold mt-0.5">+ S/ {item.extra.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        {esMultiselect ? (
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'border-red-500 bg-red-600' : 'border-gray-600'}`}>
                            {selected && <FiCheck size={12} className="text-white" />}
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-red-500' : 'border-gray-600'}`}>
                            {selected && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Adicionales opcionales */}
            {producto.complementos && (
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111]">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{producto.complementos.titulo}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Elige los adicionales que gustes</p>
                  </div>
                  <span className="text-[9px] bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded-full uppercase">
                    Opcional
                  </span>
                </div>
                <div className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                  {producto.complementos.items.map((item) => {
                    const qty = countAd(item.nombre)
                    return (
                      <div
                        key={item.nombre}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{item.nombre}</p>
                          {item.extra > 0 && (
                            <p className="text-[10px] text-red-400 font-bold mt-0.5">+ S/ {item.extra.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {qty > 0 ? (
                            <>
                              <button
                                onClick={() => removeAd(item)}
                                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black flex items-center justify-center transition text-sm"
                              >
                                −
                              </button>
                              <span className="text-xs font-black w-4 text-center">{qty}</span>
                              <button
                                onClick={() => addAd(item)}
                                className="w-6 h-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black flex items-center justify-center transition text-sm"
                              >
                                +
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => addAd(item)}
                              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black flex items-center justify-center transition text-sm"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resumen de adicionales seleccionados */}
            {adicionales.length > 0 && (() => {
              const agrupado = adicionales.reduce((acc, a) => {
                acc[a.nombre] = { count: (acc[a.nombre]?.count || 0) + 1, extra: a.extra }
                return acc
              }, {})
              return (
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-2">Resumen adicionales</p>
                  <div className="space-y-1">
                    {Object.entries(agrupado).map(([nombre, { count, extra }]) => (
                      <div key={nombre} className="flex justify-between text-xs">
                        <span className="text-gray-400">{count > 1 ? `${count}x ` : '+ '}{nombre}</span>
                        <span className="text-red-400 font-bold">S/ {(extra * count).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

          </div>

          {/* ── BARRA DE COMPRA FIJA AL FINAL DEL MODAL ── */}
          <div className="absolute bottom-0 left-0 right-0 md:left-1/2 p-4 bg-[#0a0a0a] border-t border-white/5 flex items-center gap-3">
            <div className="flex items-center gap-2 border border-white/10 rounded-xl px-2 py-1 bg-white/5 flex-shrink-0">
              <button
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-black">{cantidad}</span>
              <button
                onClick={() => setCantidad(c => c + 1)}
                className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition"
              >
                +
              </button>
            </div>

            <div className="flex-1 flex flex-col">
              <button
                onClick={handleAgregar}
                disabled={!opcionOK}
                className={`w-full font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 ${
                  agregado
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed'
                }`}
                style={agregado ? {} : { background: opcionOK ? color : '#374151' }}
              >
                {agregado ? (
                  <><FiCheck size={16} /> Agregado</>
                ) : (
                  <><FiShoppingCart size={16} /> Pedir — S/ {total}</>
                )}
              </button>
              {!opcionOK && (
                <p className="text-[10px] text-red-400 font-bold text-center mt-1">Selecciona una opción requerida</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
