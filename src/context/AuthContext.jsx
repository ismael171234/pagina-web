import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'

const AuthContext = createContext()

const ADMINS = ['admin@laesquina.com']
const COCINERO = ['cocinero@laesquina.com']
const EMPLEADOS = ['mesero@laesquina.com']

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [datosUsuario, setDatosUsuario] = useState(undefined)
  const [cargando, setCargando] = useState(true)

  const fetchDatosUsuario = async (user) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        let rol = data.rol
        if (ADMINS.includes(user.email)) rol = 'admin'
        else if (EMPLEADOS.includes(user.email)) rol = 'empleado'
        else if (COCINERO.includes(user.email)) rol = 'cocina'

        setDatosUsuario({ ...data, rol })
      } else {
        let rol = 'usuario'
        if (ADMINS.includes(user.email)) rol = 'admin'
        else if (EMPLEADOS.includes(user.email)) rol = 'empleado'
        else if (COCINERO.includes(user.email)) rol = 'cocina'

        setDatosUsuario({
          rol,
          email: user.email,
          nombre: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario'
        })
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setUsuario(user)
      if (user) {
        fetchDatosUsuario(user)
      } else {
        setDatosUsuario(null)
        setCargando(false)
      }
    })

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      setUsuario(user)
      if (user) {
        await fetchDatosUsuario(user)
      } else {
        setDatosUsuario(null)
        setCargando(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loginGoogle = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  const loginEmail = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const registrar = (email, password) => supabase.auth.signUp({ email, password })
  const cerrarSesion = () => supabase.auth.signOut()

  const value = { usuario, datosUsuario, loginGoogle, loginEmail, registrar, cerrarSesion, cargando }

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  )
}