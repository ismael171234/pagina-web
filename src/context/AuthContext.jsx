import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider, db } from '../firebase/config'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

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

  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user)
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
                    if (ADMINS.includes(user.email)) {
            setDatosUsuario({ ...data, rol: 'admin' })
          } else if (EMPLEADOS.includes(user.email)) {
            setDatosUsuario({ ...data, rol: 'empleado' })
          } else {
            setDatosUsuario(data)
          }
        } else {
          if (ADMINS.includes(user.email)) {
            setDatosUsuario({ rol: 'admin', email: user.email, nombre: user.displayName })
          } else {
            setDatosUsuario({ rol: 'usuario', email: user.email, nombre: user.displayName })
          }
        }
      } else {
        setDatosUsuario(null)
      }
      setCargando(false)
    })
    return unsuscribe
  }, [])

  const loginGoogle = () => signInWithPopup(auth, googleProvider)
  const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const registrar = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const cerrarSesion = () => signOut(auth)

  const value = { usuario, datosUsuario, loginGoogle, loginEmail, registrar, cerrarSesion, cargando }

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  )
}