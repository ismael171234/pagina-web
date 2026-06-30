import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nf-anim { animation: fadeUp 0.6s ease forwards; }
        .nf-anim-2 { animation: fadeUp 0.6s ease 0.15s forwards; opacity: 0; }
        .nf-anim-3 { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; }
      `}</style>

      {/* Número 404 */}
      <div className="nf-anim relative mb-6">
        <p
          className="font-black select-none leading-none"
          style={{
            fontSize: 'clamp(100px, 22vw, 200px)',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(230,57,70,0.25)',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </p>
        <p
          className="absolute inset-0 flex items-center justify-center font-black leading-none"
          style={{
            fontSize: 'clamp(100px, 22vw, 200px)',
            color: 'transparent',
            WebkitTextStroke: '2px #e63946',
            letterSpacing: '-0.04em',
            clipPath: 'inset(0 0 50% 0)',
          }}
        >
          404
        </p>
      </div>

      {/* Línea decorativa */}
      <div className="nf-anim-2 w-16 h-[3px] bg-red-600 rounded-full mb-6" />

      {/* Mensaje */}
      <div className="nf-anim-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 mb-3">
          La Esquina · Página no encontrada
        </p>
        <h1 className="text-white font-black text-2xl md:text-3xl leading-tight mb-3">
          Esta página no existe
        </h1>
        <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
          La ruta que buscas no está en nuestra carta. Quizás fue movida o simplemente no existe.
        </p>
      </div>

      {/* Botones */}
      <div className="nf-anim-3 flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-150 shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(230,57,70,0.35)' }}
        >
          Volver al inicio
        </button>
        <button
          onClick={() => navigate('/menu')}
          className="text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-150 border border-white/10 hover:bg-white/5 active:scale-95"
        >
          Ver el menú
        </button>
      </div>

    </div>
  )
}

export default NotFound