import React, { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleLogin = async () => {

    if (loading) return

    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setLoading(false)
      setError("Email veya şifre hatalı")
      triggerShake()
      return
    }

    window.location.href = "/admin"
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div style={wrapperStyle}>

      <div style={{
        ...cardStyle,
        animation: shake ? "shake 0.4s" : "none"
      }}>

        <h2 style={titleStyle}>
          Anadolu Fason Admin
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, marginTop: "20px" }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? <Spinner /> : "Giriş Yap"}
        </button>

      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0px); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-6px); }
          100% { transform: translateX(0px); }
        }
      `}</style>

    </div>
  )
}

const wrapperStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at top left, #0f172a, #020617)"
}

const cardStyle = {
  width: "420px",
  padding: "55px 45px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.85)",
  backdropFilter: "blur(8px)",
  border: "1px solid #1e293b",
  boxShadow: "0 0 8px rgba(59,130,246,0.25)",
  transition: "0.3s"
}

const titleStyle = {
  textAlign: "center",
  marginBottom: "45px",
  fontSize: "26px",
  fontWeight: "600",
  color: "#38bdf8",
  letterSpacing: "1px"
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "1px solid #1e293b",
  background: "#0f172a",
  color: "white",
  outline: "none",
  fontSize: "14px",
  transition: "0.3s",
}

const buttonStyle = {
  marginTop: "30px",
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: "600",
  fontSize: "15px",
  boxShadow: "0 0 8px rgba(59,130,246,0.5)",
  transition: "0.3s"
}

const errorStyle = {
  marginTop: "15px",
  color: "#ef4444",
  fontSize: "14px"
}

const Spinner = () => (
  <div style={{
    width: "18px",
    height: "18px",
    border: "2px solid white",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite"
  }}>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)