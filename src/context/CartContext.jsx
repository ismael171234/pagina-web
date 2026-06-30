import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([])

  const agregarProducto = (producto, cantidad, opcion, complemento) => {
    setCarrito((prev) => {
      const existe = prev.find(
        (item) =>
          item.id === producto.id &&
          item.opcion === opcion &&
          item.complemento === complemento
      )
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id &&
          item.opcion === opcion &&
          item.complemento === complemento
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio.replace('S/ ', '')),
          imagen: producto.imagen,
          cantidad,
          opcion,
          complemento,
          extra: complemento?.extra || 0,
        },
      ]
    })
  }

  const eliminarProducto = (id, opcion, complemento) => {
    setCarrito((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.opcion === opcion && item.complemento === complemento)
      )
    )
  }

  const actualizarCantidad = (id, opcion, complemento, cantidad) => {
    if (cantidad < 1) {
      eliminarProducto(id, opcion, complemento)
      return
    }
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id && item.opcion === opcion && item.complemento === complemento
          ? { ...item, cantidad }
          : item
      )
    )
  }

  const vaciarCarrito = () => setCarrito([])

  const total = carrito.reduce(
    (acc, item) => acc + (item.precio + item.extra) * item.cantidad,
    0
  )

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  const [cartOpen, setCartOpen] = useState(false)

  const value = {
    carrito,
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    vaciarCarrito,
    total,
    totalItems,
    cartOpen,
    setCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
