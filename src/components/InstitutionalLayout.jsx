// src/components/InstitutionalLayout.jsx
import { Link, useLocation } from 'react-router-dom'

const SIDEBAR_ITEMS = [
  { label: 'Historia', to: '/historia' },
  { label: 'Trabaja con nosotros', to: '/trabaja-con-nosotros' },
  { label: 'Ventas corporativas', to: '/ventas-corporativas' },
  { label: 'Comprobantes electrónicos', to: '/comprobantes-electronicos' },
  { label: 'Términos y condiciones de la web', to: '/terminos-web' },
  { label: 'Políticas de privacidad', to: '/politicas-privacidad' },
  { label: 'Políticas de delivery y pick up', to: '/politicas-delivery' },
  { label: 'Términos de promociones y campañas', to: '/terminos-promociones' },
  { label: 'Línea Ética', to: '/linea-etica' },
  { label: 'Política de cookies', to: '/politica-cookies' },
  { label: 'Contáctanos', to: '/contactanos' },
]

export default function InstitutionalLayout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-black text-white font-montserrat px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-white transition">Inicio</Link>
          {' > '}
          <span className="text-gray-400">Nosotros</span>
        </p>

        <div className="flex flex-col md:flex-row gap-10">
          <aside className="md:w-72 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {SIDEBAR_ITEMS.map((item) => {
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition
                      ${active
                        ? 'bg-red-700 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-900'
                      }`}
                  >
                    {item.label}
                    <span className="text-xs opacity-70">›</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}