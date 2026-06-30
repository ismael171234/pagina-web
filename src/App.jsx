import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Cocina from './pages/Cocina'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import WhatsAppButton from './components/WhatsAppButton'
import CartDrawer from './components/CartDrawer'

function Layout() {
  const location = useLocation()
  const hideNav = ['/login', '/admin', '/cocina'].includes(location.pathname)

  return (
    <>
      {!hideNav && <Navbar />}
      <CartDrawer />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/menu"        element={<Menu />} />
        <Route path="/orders"      element={<Orders />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/admin"       element={<Admin />} />
        <Route path="/cocina"      element={<Cocina />} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
      {!hideNav && <Footer />}
      {!hideNav && <Chatbot />}
      {!hideNav && <WhatsAppButton />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App