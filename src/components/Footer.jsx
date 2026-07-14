import { FiInstagram, FiYoutube, FiTwitter, FiMapPin, FiPhone, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-black text-white">

      <div className="bg-red-700 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white font-bold text-sm">Siguenos en nuestras redes sociales</p>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/pollerialaesquina.sullana/"
              target="_blank" rel="noreferrer"
              className="bg-white/20 hover:bg-white/30 transition p-2 rounded-full">
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

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Sobre Nosotros</p>
            <div className="flex flex-col gap-2">
              <Link to="/historia" className="text-gray-400 hover:text-red-400 transition text-sm">Historia</Link>
              <Link to="/trabaja-con-nosotros" className="text-gray-400 hover:text-red-400 transition text-sm">Trabaja con nosotros</Link>
              <Link to="/contactanos" className="text-gray-400 hover:text-red-400 transition text-sm">Ventas corporativas</Link>
              <a href="#" className="text-gray-400 hover:text-red-400 transition text-sm">Comprobantes electronicos</a>
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Politicas y Terminos</p>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-400 hover:text-red-400 transition text-sm">Terminos y condiciones</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition text-sm">Politicas de privacidad</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition text-sm">Politicas de delivery</a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition text-sm">Linea Etica</a>
              <Link to="/contactanos" className="text-gray-400 hover:text-red-400 transition text-sm">Contactanos</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-white font-bold text-sm uppercase tracking-widest">Encuentranos</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0 mt-0.5">
                <FiMapPin className="text-red-500 text-sm" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">Direccion</p>
                <p className="text-gray-400 text-xs leading-relaxed">Sullana - Perú</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0 mt-0.5">
                <FiPhone className="text-red-500 text-sm" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">Telefono</p>
                <a href="tel:+51913532103" className="text-gray-400 text-xs hover:text-red-400 transition">+51 913 532 103</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-red-600/20 p-2 rounded-lg flex-shrink-0 mt-0.5">
                <FiClock className="text-red-500 text-sm" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">Horario</p>
                <p className="text-gray-400 text-xs leading-relaxed">Lun - Dom: 12:00pm - 11:00pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm uppercase tracking-widest">Ubicacion</p>
          <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-xl" style={{ height: '220px' }}>
            <iframe
              title="Mapa La Esquina"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)' }}
              src="https://maps.google.com/maps?q=Sullana+Piura+Peru&t=&z=15&ie=UTF8&iwloc=&output=embed"
            />
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Sullana+Piura+Peru"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition text-white text-xs font-bold py-2.5 rounded-xl"
          >
            <FiMapPin size={13} />
            Como llegar
          </a>
        </div>

      </div>

      <div className="border-t border-gray-800 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">2026 La Esquina. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-xs">Hecho en Perú</p>
        </div>
      </div>

    </footer>
  )
}

export default Footer