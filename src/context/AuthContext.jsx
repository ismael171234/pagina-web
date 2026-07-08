import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'

const AuthContext = createContext()

const ADMINS = ['admin@laesquina.com', 'antony.delgadoestrada@gmail.com', 'ismael171234@gmail.com']

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

      const rol = ADMINS.includes(user.email) ? 'admin' : 'usuario'

      if (data) {
        // Asegurar rol de administrador si el correo está en la lista estática
        const finalRol = ADMINS.includes(user.email) ? 'admin' : (data.rol || 'usuario')
        setDatosUsuario({ ...data, rol: finalRol })
      } else {
        // Auto-creación del perfil público si no existe (vital para nuevos ingresos y Google OAuth)
        const nuevoPerfil = {
          id: user.id,
          nombre: user.user_metadata?.full_name || user.user_metadata?.name || 'Cliente',
          email: user.email,
          foto: user.user_metadata?.avatar_url || null,
          rol,
          creado_en: new Date().toISOString()
        }

        const { error: insErr } = await supabase
          .from('usuarios')
          .insert(nuevoPerfil)

        if (insErr) {
          console.error('Error creando perfil de usuario público:', insErr)
        }
        setDatosUsuario(nuevoPerfil)
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
  const recuperarPassword = (email) => supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  const actualizarPassword = (newPassword) => supabase.auth.updateUser({ password: newPassword })
  const recargarDatosUsuario = async () => {
    if (usuario) {
      await fetchDatosUsuario(usuario)
    }
  }

  const value = { 
    usuario, 
    datosUsuario, 
    loginGoogle, 
    loginEmail, 
    registrar, 
    cerrarSesion, 
    recuperarPassword, 
    actualizarPassword, 
    recargarDatosUsuario,
    cargando 
  }

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  )
}