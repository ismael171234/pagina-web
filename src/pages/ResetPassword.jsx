import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
const logo = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/imagesesquina.jpeg'
const fondo = 'https://uprqwroiifoetvohfldg.supabase.co/storage/v1/object/public/Productos/lugaresquina.jpeg'
import { FiEye, FiEyeOff, FiLock, FiCheck, FiX } from 'react-icons/fi'

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
  const [cargando, setCargando] = useState(false)

  const { actualizarPassword } = useAuth()
  const navigate = useNavigate()

  const validaciones = {
    longitud: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    numero: /[0-9]/.test(password),
    especial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const passwordSegura = Object.values(validaciones).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!passwordSegura) {
      setError('La contraseña no cumple con los requisitos de seguridad')
      return
    }

    try {
      setCargando(true)
      setError('')
      setInfoMsg('')
      
      const { error: resetError } = await actualizarPassword(password)
      if (resetError) throw resetError

      setInfoMsg('¡Contraseña restablecida con éxito! Serás redirigido al inicio de sesión.')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Background Image Panel (Left) */}
      <div className="hidden md:flex w-1/2 relative">
        <img src={fondo} alt="La Esquina" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 flex flex-col justify-center px-12"> 
        </div>
      </div>

      {/* Main Content Panel (Right) */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="h-20 w-20 rounded-full object-cover border-4 border-red-600 shadow-lg" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            Restablecer contraseña
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Ingresa tu nueva contraseña para acceder a tu cuenta
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          {infoMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 text-center font-medium animate-pulse">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition pl-11 pr-11"
                required
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <FiLock />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition pl-11 pr-11"
                required
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <FiLock />
              </span>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Password Validation List */}
            {password.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
                <p className="text-xs font-bold text-gray-600 mb-1">Requisitos de contraseña:</p>
                {[
                  { key: 'longitud', texto: 'Mínimo 8 caracteres' },
                  { key: 'mayuscula', texto: 'Al menos una mayúscula' },
                  { key: 'numero', texto: 'Al menos un número' },
                  { key: 'especial', texto: 'Al menos un carácter especial (!@#$...)' },
                ].map((req) => (
                  <div key={req.key} className="flex items-center gap-2">
                    {validaciones[req.key]
                      ? <FiCheck className="text-green-500 text-sm flex-shrink-0" />
                      : <FiX className="text-red-400 text-sm flex-shrink-0" />
                    }
                    <span className={`text-xs ${validaciones[req.key] ? 'text-green-600' : 'text-gray-400'}`}>
                      {req.texto}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-xl mt-3 hover:bg-red-700 transition shadow-md active:scale-95 disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-red-600 font-bold hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </p>

          <p className="text-center text-xs text-gray-300 mt-6">La Esquina © 2026</p>

        </div>
      </div>
    </div>
  )
}

export default ResetPassword
