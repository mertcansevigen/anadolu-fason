import React from "react"
import { formatMoney } from "../../utils/money"

export default function OrderModal({ selected, setSelected, updateStatus }) {
  if (!selected) return null

  const net = Number(selected.grand_total || 0)

const brut = selected.invoice_requested
  ? Number(selected.total_with_kdv || net * 1.20)
  : net

const total = Number(brut.toFixed(2))
const finishing = selected.finishing_breakdown

  const downloadPDF = () => {
    const byteCharacters = atob(selected.file_base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = selected.file_name || "dosya.pdf"
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
      onClick={() => setSelected(null)}
    >
      <div
        style={{
          width: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#0f172a",
          padding: 40,
          borderRadius: 24,
          border: "1px solid #1f2937",
          color: "white"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: 30 }}>
          Sipariş: {selected.id.slice(0, 8)}
        </h2>

        {/* FATURA */}
        {(selected.tax_number ||
          selected.tax_office ||
          selected.company_address) && (
          <div
            style={{
              marginTop: 30,
              padding: 20,
              borderRadius: 12,
              background: "#0f172a",
              border: "1px solid #1f2937"
            }}
          >
            <h3 style={{ marginBottom: 15 }}>
              Fatura Bilgileri
            </h3>

            <div style={{ display: "grid", gap: 8 }}>
              {selected.company_name && (
                <div><strong>Ünvan:</strong> {selected.company_name}</div>
              )}
              {selected.tax_office && (
                <div><strong>Vergi Dairesi:</strong> {selected.tax_office}</div>
              )}
              {selected.tax_number && (
                <div><strong>Vergi No:</strong> {selected.tax_number}</div>
              )}
              {selected.company_address && (
                <div><strong>Adres:</strong> {selected.company_address}</div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
          <Info label="Firma" value={selected.company_name || "-"} />
          <Info label="Müşteri" value={selected.customer_name || "-"} />
          <Info label="Telefon" value={selected.customer_phone || "-"} />
          <Info label="E-posta" value={selected.customer_email || "-"} />
          <Info label="Malzeme" value={selected.materials?.name || "-"} />
          <Info label="Ölçü" value={
            selected.width_cm && selected.height_cm
  ? `${selected.width_cm.toFixed(1)} x ${selected.height_cm.toFixed(1)} cm`
  : "-"
}
/>
          <Info label="Adet" value={selected.quantity || 0} />
          <Info
            label="Teslim"
            value={
              selected.estimated_delivery
                ? new Date(selected.estimated_delivery).toLocaleDateString("tr-TR")
                : "Belirlenmedi"
            }
          />
          <Info
  label="Tutar"
  value={`₺${formatMoney(total)}`}
/>

  {finishing && (
  <>
    {finishing.lamination && (
      <Info
        label="Laminasyon"
        value={finishing.lamination.name}
      />
    )}

    {finishing.aplikasyon && (
      <Info
        label="Aplikasyon"
        value={finishing.aplikasyon.name}
      />
    )}
  </>
)}

        </div>

        {/* DOSYA */}
        {selected.file_base64 && (
          <div style={{ marginTop: 25 }}>
            <button
              onClick={downloadPDF}
              style={{
                padding: 10,
                borderRadius: 8,
                background: "#1e293b",
                color: "#3b82f6",
                border: "none",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              PDF İndir
            </button>
          </div>
        )}
        {selected.link_url && (
  <div style={{ marginTop: 15 }}>
    <a
      href={selected.link_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        padding: 10,
        borderRadius: 8,
        background: "#1e293b",
        color: "#38bdf8",
        fontWeight: 600,
        display: "inline-block",
        textDecoration: "none"
      }}
    >
      Linki Aç
    </a>
  </div>
)}

        <div style={{ marginTop: 35, display: "flex", gap: 15 }}>
          <ActionBtn text="İşlemde" color="#92400e"
            onClick={() => updateStatus(selected.id, "in_production")}
          />
          <ActionBtn text="Tamamlandı" color="#065f46"
            onClick={() => updateStatus(selected.id, "completed")}
          />
          <ActionBtn text="Cari Yap" color="#b45309"
            onClick={() => updateStatus(selected.id, "cari")}
          />
          <ActionBtn text="İptal" color="#7f1d1d"
            onClick={() => updateStatus(selected.id, "cancelled")}
          />
        </div>

      </div>
    </div>
  )
}

const Info = ({ label, value }) => (
  <div
    style={{
      background: "#111827",
      padding: 15,
      borderRadius: 12,
      border: "1px solid #1f2937"
    }}
  >
    <div style={{ opacity: 0.6, fontSize: 13 }}>
      {label}
    </div>
    <div style={{ fontWeight: 600 }}>
      {value}
    </div>
  </div>
)

const ActionBtn = ({ text, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: color,
      border: "none",
      padding: "12px 22px",
      borderRadius: 12,
      color: "white",
      cursor: "pointer",
      fontWeight: 600
    }}
  >
    {text}
  </button>
)