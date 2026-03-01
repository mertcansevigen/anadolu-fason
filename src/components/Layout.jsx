import React from "react"
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1720", color: "white" }}>
      
      <Sidebar />

      <div style={{ flex: 1, padding: "40px", overflow: "auto" }}>
        <Outlet />
      </div>

    </div>
  )
}

export default Layout