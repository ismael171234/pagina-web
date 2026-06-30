import { FiInstagram, FiYoutube, FiTwitter, FiPhone, FiMessageSquare, FiMail } from 'react-icons/fi'

function Footer() {
  return (
    <footer className="bg-black text-white">

      <div className="bg-red-700 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white font-bold text-sm">Síguenos en nuestras redes sociales</p>
          <div className="flex items-center gap-3">
            <a href="#" className="bg-white/20 hover:bg-white/30 transition p-2 rounded-full">
              <FiInstagram className="text-xl" />
            </a>
            <a href="#" className="bg-white/20 hover:bg-white/30 transition p-2 rounded-full">
              <FiYoutube className="text-xl" />
            </a>
            <a href="#" className="bg-white/20 hover:bg-white/30 transition p-2 rounded-full">
              <FiTwitter className="text-xl" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <p className="text-white font-bold text-sm mb-4">Contacto y Atención al Cliente</p>
          <div className="flex flex-col gap-3">
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition text-sm">
              <FiMail className="text-red-500 flex-shrink-0" />
              Encuesta de satisfacción
            </a>
            <a href="tel:5050505" className="flex items-center gap-3 text-gray-400 hover:text-white transition text-sm">
              <FiPhone className="text-red-500 flex-shrink-0" />
              Teléfono 505-0505
            </a>
            <a href="https://wa.me/51940155788" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition text-sm">
              <FiMessageSquare className="text-red-500 flex-shrink-0" />
              WhatsApp +51 940155788
            </a>
          </div>
        </div>

        <div>
          <p className="text-white font-bold text-sm mb-4">Sobre Nosotros</p>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Historia</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Trabaja con nosotros</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Ventas corporativas</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Comprobantes electrónicos</a>
          </div>
        </div>

        <div>
          <p className="text-white font-bold text-sm mb-4">Políticas y Términos</p>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Términos y condiciones de la web</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Políticas de privacidad</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Políticas de delivery y pick up</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Términos de promociones y campañas</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Línea Ética</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Política de cookies</a>
            <a href="#" className="text-gray-400 hover:text-white transition text-sm">Contáctanos</a>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-800 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">2026 La Esquina. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-xs">Hecho con amor en Perú</p>
        </div>
      </div>

    </footer>
  )
}

export default Footer