// src/pages/TrabajaConNosotros.jsx
import { useState, useRef, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiUpload, FiCheck, FiChevronDown } from "react-icons/fi";
import InstitutionalLayout from "../components/InstitutionalLayout";

const AREAS = [
  "Cocina",
  "Atención al cliente / Salón",
  "Delivery",
  "Administración",
  "Marketing",
  "Otro",
];

export default function TrabajaConNosotros() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    area: "",
    mensaje: "",
  });
  const [archivo, setArchivo] = useState(null);
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo no debe superar los 5 MB.");
      return;
    }
    setArchivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acepta) return;
    if (!archivo) {
      alert("Por favor adjunta tu CV para postular.");
      return;
    }
    if (!form.area) {
      alert("Por favor selecciona un área de interés.");
      return;
    }

    setEnviando(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setEnviado(true);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al enviar tu postulación. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <InstitutionalLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-red-700/20 border border-red-700 flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-3">¡Postulación enviada!</h2>
            <p className="text-gray-400">
              Gracias por tu interés en unirte a nuestro equipo. Revisaremos
              tu CV y nos pondremos en contacto si tu perfil calza con
              alguna vacante disponible.
            </p>
          </div>
        </div>
      </InstitutionalLayout>
    );
  }

  return (
    <InstitutionalLayout>
      <span className="text-red-500 text-xs font-semibold tracking-widest uppercase">
        Únete a nuestro equipo
      </span>
      <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Trabaja con nosotros</h1>
      <p className="text-gray-400 mb-10 max-w-2xl">
        Si te apasiona la buena cocina y el servicio de calidad, nos
        encantaría conocerte. Cuéntanos sobre ti y adjunta tu CV.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-950 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl shadow-black/50 space-y-10"
      >
        <Seccion numero="01" titulo="Tus datos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Campo label="Nombre" required icon={<FiUser />}>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ingresar nombres"
                className="input-dark"
              />
            </Campo>
            <Campo label="Apellido" required>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                placeholder="Ingresar apellidos"
                className="input-dark"
              />
            </Campo>
            <Campo label="Correo electrónico" required icon={<FiMail />}>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Ingresar correo electrónico"
                className="input-dark"
              />
            </Campo>
            <Campo label="Celular" required icon={<FiPhone />}>
              <input
                name="celular"
                value={form.celular}
                onChange={handleChange}
                required
                placeholder="Ingresar celular"
                className="input-dark"
              />
            </Campo>
          </div>
        </Seccion>

        <div className="border-t border-gray-800" />

        <Seccion numero="02" titulo="Área de interés" icon={<FiBriefcase />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Campo label="¿En qué área te gustaría trabajar?" required>
              <AreaDropdown
                value={form.area}
                onChange={(val) => setForm({ ...form, area: val })}
              />
            </Campo>
          </div>
          <Campo label="Cuéntanos sobre tu experiencia">
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={handleChange}
              rows={5}
              placeholder="Cuéntanos sobre tu experiencia laboral, disponibilidad y por qué te gustaría unirte a nuestro equipo..."
              className="input-dark resize-none"
            />
          </Campo>
        </Seccion>

        <div className="border-t border-gray-800" />

        <Seccion numero="03" titulo="Adjunta tu CV" icon={<FiUpload />}>
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-700 rounded-xl py-10 cursor-pointer hover:border-red-600 hover:bg-red-950/10 transition-all group">
            <div className="w-12 h-12 rounded-full bg-gray-900 group-hover:bg-red-700/20 flex items-center justify-center transition-colors">
              <FiUpload className="text-gray-500 group-hover:text-red-500 text-xl transition-colors" />
            </div>
            <span className="text-sm text-gray-300 font-medium">
              {archivo ? archivo.name : "Arrastra y suelta tu CV aquí"}
            </span>
            <span className="text-xs text-red-500 underline">
              o haz clic para seleccionarlo
            </span>
            <span className="text-xs text-gray-500">
              Formatos: pdf, doc, docx · Peso máximo: 5 MB
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFile}
              className="hidden"
              required
            />
          </label>
        </Seccion>

        <div className="pt-2">
          <label className="flex items-start gap-3 text-sm text-gray-400 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={acepta}
              onChange={(e) => setAcepta(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 accent-red-600"
            />
            <span>Acepto que revisen mi información y me contacten sobre oportunidades laborales.</span>
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-red-700 hover:bg-red-600 transition-colors text-white font-bold py-4 rounded-xl disabled:opacity-50 tracking-wide uppercase text-sm shadow-lg shadow-red-900/30"
          >
            {enviando ? "Enviando..." : "Enviar Postulación"}
          </button>
        </div>
      </form>
    </InstitutionalLayout>
  );
}

function AreaDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`input-dark font-bold flex items-center justify-between w-full text-left ${
          value ? "text-white" : "text-gray-500"
        }`}
      >
        <span>{value || "Selecciona una opción"}</span>
        <FiChevronDown
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-20 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden max-h-64 overflow-y-auto">
          {AREAS.map((op) => (
            <li key={op}>
              <button
                type="button"
                onClick={() => {
                  onChange(op);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 font-bold text-sm transition-colors ${
                  value === op
                    ? "bg-red-700 text-white"
                    : "text-gray-200 hover:bg-red-700/20 hover:text-red-400"
                }`}
              >
                {op}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Seccion({ numero, titulo, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-red-600 font-bold text-sm tracking-widest">{numero}</span>
        {icon && <span className="text-red-500">{icon}</span>}
        <h2 className="text-lg font-semibold text-white">{titulo}</h2>
      </div>
      {children}
    </div>
  );
}

function Campo({ label, required, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}