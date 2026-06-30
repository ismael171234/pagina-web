import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { FiArrowLeft, FiCheck, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'

export default function Producto() {
  const { state }           = useLocation()
  const navigate            = useNavigate()
  const { agregarProducto } = useCart()
  const producto            = state?.producto

  const [cantidad, setCantidad]       = useState(1)
  const [opcion, setOpcion]           = useState(null)
  const [adicionales, setAdicionales] = useState([])
  const [agregado, setAgregado]       = useState(false)

  if (!producto) { navigate('/menu'); return null }

  const base     = parseFloat(producto.precio.replace('S/ ', ''))
  const extraSum = adicionales.reduce((s, a) => s + a.extra, 0)
  const total    = ((base + extraSum) * cantidad).toFixed(2)
  const opcionOK = !producto.opciones || !!opcion

  // Agregar una unidad de adicional
  const addAd = (item) => setAdicionales(prev => [...prev, item])
  // Quitar una unidad de adicional
  const removeAd = (item) => setAdicionales(prev => {
    const idx = prev.findLastIndex(a => a.nombre === item.nombre)
    if (idx === -1) return prev
    return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
  })
  const countAd = (nombre) => adicionales.filter(a => a.nombre === nombre).length

  const handleAgregar = () => {
    if (!opcionOK) return
    const comp = adicionales.length
      ? { nombre: adicionales.map(a => a.nombre).join(', '), extra: extraSum }
      : null
    agregarProducto(producto, cantidad, opcion, comp)
    setAgregado(true)
    setTimeout(() => navigate(-1), 1100)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: "'Montserrat', sans-serif",
      paddingBottom: 90,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        /* ── Header ── */
        .ph { position: sticky; top: 0; z-index: 50; background: #fff;
          border-bottom: 1px solid #e5e7eb; display: flex; align-items: center;
          gap: 12px; padding: 0 20px; height: 54px; }
        .ph-btn { width: 34px; height: 34px; border-radius: 50%; background: #f3f4f6;
          border: none; cursor: pointer; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; transition: background .15s; }
        .ph-btn:hover { background: #e5e7eb; }
        .ph-title { flex: 1; font-size: 15px; font-weight: 700; color: #111;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* ── Layout 2 col ── */
        .pl { display: flex; flex-direction: column; max-width: 1060px; margin: 0 auto; }
        @media (min-width: 820px) {
          .pl { flex-direction: row; align-items: flex-start; }
        }

        /* ── Col izquierda ── */
        .pl-left { padding: 24px 20px 0; }
        @media (min-width: 820px) {
          .pl-left { width: 420px; flex-shrink: 0; position: sticky; top: 54px;
            padding: 28px 28px 0 28px; }
        }
        .pl-img { width: 100%; aspect-ratio: 4/3; object-fit: contain;
          border-radius: 10px; background: #f9fafb; display: block; }
        .pl-img-note { color: #9ca3af; font-size: 11px; font-style: italic;
          text-align: center; margin-top: 6px; }
        .pl-nombre { font-size: 20px; font-weight: 800; color: #111;
          margin-top: 14px; line-height: 1.2; }
        .pl-precio { font-size: 22px; font-weight: 800; color: #111; margin-top: 4px; }
        .pl-desc { font-size: 13px; color: #6b7280; font-weight: 500;
          margin-top: 6px; line-height: 1.6; }
        .pl-hr { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
        .pl-personaliza { font-size: 14px; font-weight: 700; color: #111; }

        /* índice de secciones (solo desktop) */
        .pl-index { display: none; }
        @media (min-width: 820px) { .pl-index { display: block; } }
        .pl-idx-row { display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .pl-idx-name { font-size: 13px; font-weight: 600; color: #111; }
        .pl-idx-sub  { font-size: 11px; color: #9ca3af; margin-top: 1px; }

        /* ── Col derecha ── */
        .pl-right { padding: 20px 20px 0; flex: 1; }
        @media (min-width: 820px) {
          .pl-right { padding: 28px 28px 0 0; border-left: 1px solid #e5e7eb; }
        }

        /* ── Sección ── */
        .sec { border: 1px solid #e5e7eb; border-radius: 12px;
          overflow: hidden; margin-bottom: 12px; }
        .sec-head { display: flex; align-items: flex-start; justify-content: space-between;
          gap: 8px; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
        .sec-title { font-size: 15px; font-weight: 700; color: #111; }
        .sec-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; font-weight: 500; }

        /* badges */
        .bdg { font-size: 10px; font-weight: 700; padding: 3px 10px;
          border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
        .bdg-req { background: #fee2e2; color: #dc2626; }
        .bdg-ok  { background: #fff; color: #16a34a; border: 1.5px solid #16a34a; }
        .bdg-opt { background: #f3f4f6; color: #6b7280; }

        /* ── Fila opción ── */
        .row { display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-bottom: 1px solid #f3f4f6;
          cursor: pointer; transition: background .13s; }
        .row:last-child { border-bottom: none; }
        .row:hover { background: #fafafa; }
        .row-img { width: 46px; height: 46px; border-radius: 8px;
          object-fit: cover; flex-shrink: 0; border: 1px solid #e5e7eb; background: #f9fafb; }
        .row-body { flex: 1; min-width: 0; }
        .row-name  { font-size: 13px; font-weight: 600; color: #111; }
        .row-extra { font-size: 12px; color: #9ca3af; margin-top: 2px; font-weight: 500; }

        /* radio */
        .radio { width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #d1d5db; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; transition: all .18s; }
        .radio.on { border-color: #dc2626; }
        .radio-dot { width: 9px; height: 9px; border-radius: 50%; background: #dc2626; }

        /* contador KFC */
        .kcounter { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .kcbtn { width: 26px; height: 26px; border-radius: 6px; border: none;
          cursor: pointer; font-size: 16px; font-weight: 900; line-height: 1;
          display: flex; align-items: center; justify-content: center; transition: all .15s; }
        .kcbtn-add  { background: #dc2626; color: #fff; }
        .kcbtn-add:hover  { background: #b91c1c; }
        .kcbtn-sub  { background: #fff; color: #111; border: 1.5px solid #d1d5db; }
        .kcbtn-sub:hover  { border-color: #9ca3af; }
        .kcnum { font-size: 13px; font-weight: 700; color: #111; min-width: 16px; text-align: center; }

        /* resumen */
        .resumen { background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; }
        .res-title { font-size: 11px; font-weight: 800; color: #dc2626;
          text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
        .res-row { display: flex; justify-content: space-between; padding: 3px 0; }
        .res-n { font-size: 13px; color: #374151; font-weight: 500; }
        .res-p { font-size: 13px; color: #dc2626; font-weight: 700; }
        .res-sep { border: none; border-top: 1px solid #fecaca; margin: 8px 0; }

        /* ── Barra fija inferior ── */
        .pbar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff;
          border-top: 1px solid #e5e7eb; padding: 10px 20px;
          display: flex; align-items: center; gap: 10px; z-index: 50; }
        .pbar-qty { display: flex; align-items: center; gap: 6px;
          border: 1.5px solid #e5e7eb; border-radius: 8px;
          padding: 6px 10px; flex-shrink: 0; }
        .pbar-qbtn { width: 28px; height: 28px; border-radius: 6px; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          background: #f3f4f6; transition: background .15s; color: #111; }
        .pbar-qbtn:hover { background: #e5e7eb; }
        .pbar-qbtn.red { background: #dc2626; color: #fff; }
        .pbar-qbtn.red:hover { background: #b91c1c; }
        .pbar-qnum { font-size: 14px; font-weight: 800; color: #111;
          width: 20px; text-align: center; }
        .pbar-add { flex: 1; background: #dc2626; color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; font-weight: 700; padding: 13px 20px;
          border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all .2s; white-space: nowrap; }
        .pbar-add:hover:not(:disabled) { background: #b91c1c; }
        .pbar-add:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }
        .pbar-add.ok { background: #16a34a; }
        .pbar-hint { font-size: 11px; font-weight: 600; color: #dc2626;
          text-align: center; margin-top: 4px; }
      `}</style>

      {/* ══ HEADER ══ */}
      <header className="ph">
        <button className="ph-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={17} />
        </button>
        <span className="ph-title">{producto.nombre}</span>
        <button className="ph-btn" onClick={() => navigate('/orders')}>
          <FiShoppingCart size={16} />
        </button>
      </header>

      {/* ══ BODY 2 COLUMNAS ══ */}
      <div className="pl">

        {/* ─── COL IZQUIERDA ─── */}
        <div className="pl-left">
          <img src={producto.imagen} alt={producto.nombre} className="pl-img" />
          <p className="pl-img-note">*Imágenes referenciales</p>
          <p className="pl-nombre">{producto.nombre}</p>
          <p className="pl-precio">S/ {total}</p>
          {producto.desc && <p className="pl-desc">{producto.desc}</p>}

          <hr className="pl-hr" />
          <p className="pl-personaliza">Personaliza tu pedido</p>

          {/* Índice secciones — solo desktop */}
          <div className="pl-index" style={{ marginTop: 12 }}>
            {producto.opciones && (
              <div className="pl-idx-row">
                <div>
                  <p className="pl-idx-name">{producto.opciones.titulo}</p>
                  <p className="pl-idx-sub">{producto.opciones.subtitulo}</p>
                </div>
                <span className={`bdg ${opcion ? 'bdg-ok' : 'bdg-req'}`}>
                  {opcion ? 'Completado' : 'Requerido'}
                </span>
              </div>
            )}
            {producto.complementos && (
              <div className="pl-idx-row">
                <div>
                  <p className="pl-idx-name">{producto.complementos.titulo}</p>
                  <p className="pl-idx-sub">Elige los que quieras</p>
                </div>
                <span className={`bdg ${adicionales.length > 0 ? 'bdg-ok' : 'bdg-opt'}`}>
                  {adicionales.length > 0
                    ? `${adicionales.length} elegido${adicionales.length > 1 ? 's' : ''}`
                    : 'Opcional'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── COL DERECHA ─── */}
        <div className="pl-right">

          {/* Sección opciones requeridas */}
          {producto.opciones && (
            <div className="sec">
              <div className="sec-head">
                <div>
                  <p className="sec-title">{producto.opciones.titulo}</p>
                  <p className="sec-sub">{producto.opciones.subtitulo}</p>
                </div>
                <span className={`bdg ${opcion ? 'bdg-ok' : 'bdg-req'}`}>
                  {opcion ? 'Completado' : 'Requerido'}
                </span>
              </div>
              {producto.opciones.items.map((item) => {
                const on = opcion === item.nombre
                return (
                  <div key={item.nombre} className="row" onClick={() => setOpcion(item.nombre)}>
                    {item.imagen && <img src={item.imagen} alt={item.nombre} className="row-img" />}
                    <div className="row-body">
                      <p className="row-name">{item.nombre}</p>
                    </div>
                    <div className={`radio ${on ? 'on' : ''}`}>
                      {on && <div className="radio-dot" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sección adicionales */}
          {producto.complementos && (
            <div className="sec">
              <div className="sec-head">
                <div>
                  <p className="sec-title">{producto.complementos.titulo}</p>
                  <p className="sec-sub">Elige los que quieras</p>
                </div>
                <span className={`bdg ${adicionales.length > 0 ? 'bdg-ok' : 'bdg-opt'}`}>
                  {adicionales.length > 0
                    ? `${adicionales.length} elegido${adicionales.length > 1 ? 's' : ''}`
                    : 'Opcional'}
                </span>
              </div>
              {producto.complementos.items.map((item) => {
                const qty = countAd(item.nombre)
                return (
                  <div key={item.nombre} className="row" style={{ cursor: 'default' }}>
                    {item.imagen && <img src={item.imagen} alt={item.nombre} className="row-img" />}
                    <div className="row-body">
                      <p className="row-name">{item.nombre}</p>
                      {item.extra > 0 && (
                        <p className="row-extra">+ S/ {item.extra.toFixed(2)}</p>
                      )}
                    </div>
                    {/* Contador estilo KFC */}
                    <div className="kcounter">
                      {qty > 0 ? (
                        <>
                          <button className="kcbtn kcbtn-sub" onClick={() => removeAd(item)}>−</button>
                          <span className="kcnum">{qty}</span>
                          <button className="kcbtn kcbtn-add" onClick={() => addAd(item)}>+</button>
                        </>
                      ) : (
                        <button className="kcbtn kcbtn-sub" onClick={() => addAd(item)}
                          style={{ fontSize: 20, fontWeight: 900 }}>+</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Resumen adicionales */}
          {adicionales.length > 0 && (() => {
            const agrupado = adicionales.reduce((acc, a) => {
              acc[a.nombre] = { count: (acc[a.nombre]?.count || 0) + 1, extra: a.extra }
              return acc
            }, {})
            return (
              <div className="resumen">
                <p className="res-title">Adicionales seleccionados</p>
                {Object.entries(agrupado).map(([nombre, { count, extra }]) => (
                  <div key={nombre} className="res-row">
                    <span className="res-n">{count > 1 ? `${count}x ` : '+ '}{nombre}</span>
                    <span className="res-p">S/ {(extra * count).toFixed(2)}</span>
                  </div>
                ))}
                <hr className="res-sep" />
                <div className="res-row">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Total adicionales</span>
                  <span className="res-p">S/ {extraSum.toFixed(2)}</span>
                </div>
              </div>
            )
          })()}

        </div>
      </div>

      {/* ══ BARRA FIJA INFERIOR ══ */}
      <div className="pbar">
        <div className="pbar-qty">
          <button className="pbar-qbtn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>
            <FiMinus size={13} />
          </button>
          <span className="pbar-qnum">{cantidad}</span>
          <button className="pbar-qbtn red" onClick={() => setCantidad(c => c + 1)}>
            <FiPlus size={13} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button
            className={`pbar-add ${agregado ? 'ok' : ''}`}
            onClick={handleAgregar}
            disabled={!opcionOK}
          >
            {agregado
              ? <><FiCheck size={15} /> Agregado al carrito</>
              : `Agregar (S/ ${total})`}
          </button>
          {!opcionOK && (
            <p className="pbar-hint">Selecciona una opción para continuar</p>
          )}
        </div>
      </div>

    </div>
  )
}