import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import logo from '../assets/imagesesquina.jpeg'
import fondo from '../assets/lugaresquina.jpeg'
import { FcGoogle } from 'react-icons/fc'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiCheck, FiX } from 'react-icons/fi'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { loginGoogle, loginEmail, registrar } = useAuth()
  const navigate = useNavigate()

  const validaciones = {
    longitud: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    numero: /[0-9]/.test(password),
    especial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const passwordSegura = Object.values(validaciones).every(Boolean)

  const handleGoogle = async () => {
    try {
      setCargando(true)
      setError('')
      const result = await loginGoogle()
      const user = result.user
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: user.displayName,
        email: user.email,
        foto: user.photoURL,
        rol: 'usuario',
        creadoEn: new Date(),
      }, { merge: true })
      navigate('/')
    } catch (err) {
      setError('Error al iniciar sesión con Google')
    } finally {
      setCargando(false)
    }
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }
    if (isRegister && !nombre) {
      setError('Por favor ingresa tu nombre')
      return
    }
    if (isRegister && !passwordSegura) {
      setError('La contraseña no cumple los requisitos de seguridad')
      return
    }
    try {
      setCargando(true)
      setError('')
      if (isRegister) {
        const result = await registrar(email, password)
        await setDoc(doc(db, 'usuarios', result.user.uid), {
          nombre: nombre,
          email: email,
          foto: null,
          rol: 'usuario',
          creadoEn: new Date(),
        })
      } else {
        await loginEmail(email, password)
      }
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('Usuario no encontrado')
      else if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta')
      else if (err.code === 'auth/email-already-in-use') setError('El correo ya está en uso')
      else if (err.code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres')
      else if (err.code === 'auth/invalid-credential') setError('Correo o contraseña incorrectos')
      else setError('Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      <div className="hidden md:flex w-1/2 relative">
        <img src={fondo} alt="La Esquina" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 flex flex-col justify-center px-12"> 
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="h-20 w-20 rounded-full object-cover border-4 border-red-600 shadow-lg" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            {isRegister ? 'Regístrate para hacer tus pedidos' : 'Accede a tu cuenta para pedir'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition mb-5 shadow-sm disabled:opacity-50"
          >
            <FcGoogle className="text-2xl" />
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">o continúa con correo</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-4">
            {isRegister && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition pl-11"
                />
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <FiUser />
                </span>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition pl-11"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <FiMail />
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition pl-11 pr-11"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <FiLock />
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {isRegister && password.length > 0 && (
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
          </div>

          {!isRegister && (
            <div className="text-right mt-2">
              <a href="#" className="text-xs text-red-600 font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={cargando}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl mt-5 hover:bg-red-700 transition shadow-md active:scale-95 disabled:opacity-50"
          >
            {cargando ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); setPassword('') }}
              className="text-red-600 font-bold hover:underline"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>

          <p className="text-center text-xs text-gray-300 mt-6">La Esquina © 2026</p>

        </div>
      </div>

    </div>
  )
}

export default Login