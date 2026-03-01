import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Orders from "./pages/Orders"
import Materials from "./pages/Materials"
import Login from "./pages/login"
import BankAccounts from "./pages/BankAccounts"
import PostOperations from "./pages/PostOperations"
import Home from "./pages/Home"
import Siparis from "./pages/Siparis"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<Home />} />
        <Route path="/siparis" element={<Siparis />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="materials" element={<Materials />} />
          <Route path="banks" element={<BankAccounts />} />
          <Route path="post-operations" element={<PostOperations />} />
        </Route>

        <Route path="*" element={<div />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App