// src/pages/Historia.jsx
import InstitutionalLayout from '../components/InstitutionalLayout'

export default function Historia() {
  return (
    <InstitutionalLayout>
      <h1 className="text-3xl font-bold mb-6">Historia</h1>

      <div className="w-full h-72 md:h-96 rounded-xl overflow-hidden mb-8 bg-gray-900 flex items-center justify-center">
        {/* Reemplaza este div por tu <img src="..." /> cuando tengas la foto del local */}
        <span className="text-gray-600 text-sm">Foto del local o fundadores aquí</span>
      </div>

      <div className="space-y-6 text-gray-300 leading-relaxed max-w-3xl">
        <p>
          La Esquina nació en 2015 en el corazón de Piura, como un pequeño
          local familiar con apenas cuatro mesas y una receta heredada de
          generación en generación. Lo que comenzó como un sueño entre
          hermanos se convirtió, con el paso de los años, en un punto de
          encuentro para quienes buscan sabores auténticos de la cocina
          peruana.
        </p>
        <p>
          Cada plato que sale de nuestra cocina lleva consigo el cariño de
          nuestras raíces piuranas: ingredientes frescos comprados en el
          mercado local, técnicas tradicionales y ese toque casero que nos
          distingue.
        </p>
        <p>
          Hoy, La Esquina sigue siendo un negocio 100% local, orgulloso de
          servir a nuestra comunidad y de mantener viva la esencia que nos
          vio nacer: comida honesta, hecha con el corazón, para nuestra
          gente de Piura.
        </p>
      </div>
    </InstitutionalLayout>
  )
}