import React from "react"
import { NavLink } from "react-router-dom"

function Sidebar() {

  const linkStyle = ({ isActive }) => ({
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "block",
    textDecoration: "none",
    background: isActive ? "#1e293b" : "transparent",
    color: isActive ? "#38bdf8" : "#cbd5e1",
    transition: "0.2s"
  })

  return (
    <div style={{
      width: "260px",
      background: "#0f172a",
      padding: "24px",
      borderRight: "1px solid #1e293b"
    }}>
      <h2 style={{ marginBottom: "30px", color: "#38bdf8" }}>
        Anadolu Fason
      </h2>

      <NavLink to="/admin" end style={linkStyle}>
        Dashboard
      </NavLink>

      <NavLink to="/admin/orders" style={linkStyle}>
        Siparişler
      </NavLink>

      <NavLink to="/admin/materials" style={linkStyle}>
        Malzemeler
      </NavLink>

      <NavLink to="/admin/banks" style={linkStyle}>
        Banka Hesapları
      </NavLink>

      <NavLink to="/admin/post-operations" style={linkStyle}>
        Baskı Sonrası İşlemler
      </NavLink>

    </div>
  )
}

export default Sidebar