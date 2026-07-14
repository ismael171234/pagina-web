// src/pages/Contactanos.jsx
import { useState, useRef, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiUpload, FiCheck, FiChevronDown } from "react-icons/fi";

const TEMAS = [
  "Consulta general",
  "Reclamo o queja",
  "Trabaja con nosotros",
  "Ventas corporativas",
  "Sugerencia",
];

const FORMA_PEDIDO = ["Local", "Delivery", "Recojo en tienda", "No aplica"];

export default function Contactanos() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    formaPedido: "",
    tema: "",
    mensaje: "",
  });
  const [archivo, setArchivo] = useState(null);
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const esTrabajo = form.tema === "Trabaja con nosotros";

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
    if (esTrabajo && !archivo) {
      alert("Por favor adjunta tu CV para postular.");
      return;
    }
    if (!form.formaPedido) {
      alert("Por favor indica cómo realizaste tu pedido.");
      return;
    }
    if (!form.tema) {
      alert("Por favor elige el tema de tu mensaje.");
      return;
    }

    setEnviando(true);
    try {
      // Conexión a backend pendiente
      await new Promise((r) => setTimeout(r, 800));
      setEnviado(true);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al enviar tu mensaje. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 font-montserrat">
        <div className="text-center max-w-md bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-10">
          <div className="w-16 h-16 rounded-full bg-red-700/20 border border-red-700 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-3">¡Gracias por escribirnos!</h2>
          <p className="text-gray-400">
            Hemos recibido tu mensaje. Nos pondremos en contacto contigo a la
            brevedad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      {/* Encabezado */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/60 to-black px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <span className="text-red-500 text-sm font-semibold tracking-widest uppercase">
            Estamos para ayudarte
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Contáctanos</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Tu opinión es muy importante para nosotros. Nos alegra que quieras
            ponerte en contacto.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-950 border border-gray-800 rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/50 space-y-10"
        >
          {/* Sección 1: Datos personales */}
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

          {/* Sección 2: Motivo */}
          <Seccion numero="02" titulo="Cuéntanos más" icon={<FiMessageSquare />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <Campo label="¿Cómo realizaste tu pedido?" required>
                <Dropdown
                  options={FORMA_PEDIDO}
                  value={form.formaPedido}
                  onChange={(val) => setForm({ ...form, formaPedido: val })}
                />
              </Campo>
              <Campo label="Elige el tema de tu mensaje" required>
                <Dropdown
                  options={TEMAS}
                  value={form.tema}
                  onChange={(val) => setForm({ ...form, tema: val })}
                />
              </Campo>
            </div>
            <Campo label="Tu mensaje">
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows={5}
                placeholder={esTrabajo ? "Cuéntanos sobre tu experiencia..." : "Escribe tu mensaje..."}
                className="input-dark resize-none"
              />
            </Campo>
          </Seccion>

          <div className="border-t border-gray-800" />

          {/* Sección 3: Archivo */}
          <Seccion
            numero="03"
            titulo={esTrabajo ? "Adjunta tu CV" : "Adjuntar archivo"}
            icon={<FiUpload />}
          >
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-700 rounded-xl py-10 cursor-pointer hover:border-red-600 hover:bg-red-950/10 transition-all group">
              <div className="w-12 h-12 rounded-full bg-gray-900 group-hover:bg-red-700/20 flex items-center justify-center transition-colors">
                <FiUpload className="text-gray-500 group-hover:text-red-500 text-xl transition-colors" />
              </div>
              <span className="text-sm text-gray-300 font-medium">
                {archivo ? archivo.name : "Arrastra y suelta tu archivo aquí"}
              </span>
              <span className="text-xs text-red-500 underline">
                o haz clic para seleccionarlo
              </span>
              <span className="text-xs text-gray-500">
                Formatos: jpg, png, pdf, doc, docx · Peso máximo: 5 MB
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFile}
                className="hidden"
                required={esTrabajo}
              />
            </label>
          </Seccion>

          {/* Confirmación y envío */}
          <div className="pt-2">
            <label className="flex items-start gap-3 text-sm text-gray-400 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={acepta}
                onChange={(e) => setAcepta(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 accent-red-600"
              />
              <span>Acepto que me contacten con relación a este mensaje.</span>
            </label>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-red-700 hover:bg-red-600 transition-colors text-white font-bold py-4 rounded-xl disabled:opacity-50 tracking-wide uppercase text-sm shadow-lg shadow-red-900/30"
            >
              {enviando ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Dropdown personalizado (reemplaza el <select> nativo) para tener control
 * total del estilo: fondo oscuro, texto en negrita y resaltado en rojo
 * acorde a la marca, en lugar del azul/gris por defecto del navegador.
 */
function Dropdown({ options, value, onChange, placeholder = "Selecciona una opción" }) {
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
        <span>{value || placeholder}</span>
        <FiChevronDown
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-20 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden max-h-64 overflow-y-auto">
          {options.map((op) => (
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