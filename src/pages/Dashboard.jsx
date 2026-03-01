import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import OrderModal from "../components/dashboard/OrderModal"
import { formatMoney } from "../utils/money"

export default function Dashboard() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    const isAdmin = await checkAdmin()
    if (isAdmin) await fetchOrders()
  }

  const checkAdmin = async () => {
    const result = await supabase.auth.getSession()
    if (!result.data.session) {
      window.location.href = "/login"
      return false
    }
    return true
  }

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        area_m2,
        quantity,
        status,
        total_with_kdv,
        grand_total,
        invoice_requested,
        company_name,
        customer_name,
        customer_email,
        customer_phone,
        tax_office,
        tax_number,
        company_address,
        estimated_delivery,
        width_cm,
        height_cm,
        file_name,
        file_base64,
        file_url,
        link_url,
        materials!orders_material_id_fkey (
          name,
          price_per_m2
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("DASHBOARD ERROR:", error)
      setLoading(false)
      return
    }

    setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id)
    fetchOrders()
    setSelected(null)
  }

  if (loading)
    return <div style={{ color: "white", padding: 40 }}>Yükleniyor...</div>

  const completedTotal = orders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => {
  const net = o.grand_total || 0
  const total = o.invoice_requested
    ? (o.total_with_kdv || net * 1.20)
    : net
  return sum + total
}, 0)

  const cariTotal = orders
    .filter(o => o.status === "cari")
    .reduce((sum, o) => {
  const net = o.grand_total || 0
  const total = o.invoice_requested
    ? (o.total_with_kdv || net * 1.20)
    : net
  return sum + total
}, 0)

  const pendingTotal = orders
    .filter(o => o.status === "pending")
    .reduce((sum, o) => {
  const net = o.grand_total || 0
  const total = o.invoice_requested
    ? (o.total_with_kdv || net * 1.20)
    : net
  return sum + total
}, 0)

  const inProductionCount =
    orders.filter(o => o.status === "in_production").length

  const completedCount =
    orders.filter(o => o.status === "completed").length

  const statusMap = {
    completed: "Tamamlandı",
    in_production: "İşlemde",
    cari: "Cari",
    cancelled: "İptal",
    pending: "Bekliyor"
  }

  const statusStyleMap = {
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  in_production: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  cari: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
  pending: "bg-slate-500/15 text-slate-400 border border-slate-500/30"
}

  const calculateMaterialTotals = (status) => {
    const totals = {}
    orders
      .filter(o => o.status === status)
      .forEach(order => {
        const name = order.materials?.name
        if (!name) return
        totals[name] = (totals[name] || 0) + (order.area_m2 || 0)
      })
    return Object.entries(totals)
  }

  const completedArray = calculateMaterialTotals("completed")
  const inProductionArray = calculateMaterialTotals("in_production")

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px",
        background: "radial-gradient(circle at top left, #0f172a, #020617)",
        color: "#e2e8f0"
      }}
    >

      <h1 style={{ marginBottom: 40, fontSize: 28, fontWeight: 600 }}>
        Sipariş Özeti
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12"
      >
        <SummaryCard title="Toplam Satış" value={completedTotal} color="#10b981" isCurrency />
<SummaryCard title="Cari Toplam" value={cariTotal} color="#f59e0b" isCurrency />
<SummaryCard title="Ödeme Bekleyen" value={pendingTotal} color="#ef4444" isCurrency />
<SummaryCard title="İşlemde" value={inProductionCount} color="#3b82f6" />
<SummaryCard title="Tamamlanan" value={completedCount} color="#22c55e" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex gap-8 flex-wrap justify-center mb-16"
      >
        <ProductionCard title="Tamamlanan Üretim (m²)" data={completedArray} color="#10b981" />
        <ProductionCard title="İşlemde Üretim (m²)" data={inProductionArray} color="#f59e0b" />
      </motion.div>

      <h2 className="mb-8 text-xl">Siparişler</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {orders.slice(0, 9).map((order, index) => {

          const net = Number(order.grand_total || 0)

const brut = order.invoice_requested
  ? Number(order.total_with_kdv || net * 1.20)
  : net

const total = Number(brut.toFixed(2))

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelected(order)}
              className="group relative w-full p-6 rounded-2xl 
              bg-gradient-to-br from-slate-900/90 to-slate-800/60 
              border border-slate-800 hover:border-blue-400 
              hover:shadow-[0_0_12px_rgba(59,130,246,0.55)] transition-all 
              duration-300 cursor-pointer"
            >

              <h3 className="text-2xl font-semibold text-white">
                ORD-{order.id.slice(0, 4).toUpperCase()}
              </h3>

              <div className="absolute top-5 right-5">
                <span
  className={`px-4 py-1 text-xs rounded-full font-medium ${
    statusStyleMap[order.status] ||
    "bg-slate-500/15 text-slate-400 border border-slate-500/30"
  }`}
>
  {statusMap[order.status] || order.status}
</span>
              </div>

              <div className="mt-4">
  <div className="text-lg font-semibold text-white">
  {(order.company_name && order.company_name.trim() !== "")
    ? order.company_name
    : (order.customer_name && order.customer_name.trim() !== "")
      ? order.customer_name
      : "Bilinmeyen Müşteri"}
</div>
  <div className="text-xs text-slate-400">
  {[order.customer_phone, order.customer_email]
    .filter(Boolean)
    .join(" • ")}
</div>

  {order.width_cm && order.height_cm && (
    <div className="mt-2 text-sm text-slate-400">
      Ölçü: {order.width_cm.toFixed(1)} x {order.height_cm.toFixed(1)} cm
    </div>
  )}
</div>
              <div className="mt-6 text-3xl font-semibold text-blue-400">
                ₺{formatMoney(total)}
              </div>

            </motion.div>
          )
        })}
      </div>

      <OrderModal
        selected={selected}
        setSelected={setSelected}
        updateStatus={updateStatus}
      />

    </div>
  )
}

/* ---------------- UI COMPONENTS ---------------- */

const SummaryCard = ({ title, value, color, isCurrency = false }) => {

  const numericValue = Number(value || 0)

  return (
  <div
    style={{
      padding: "24px",
      borderRadius: "16px",
      background: "#0f172a",
      border: "3px solid #1e293b"
    }}
  >
    <div style={{ opacity: 0.6, marginBottom: 10 }}>
      {title}
    </div>

    <AnimatedNumber 
      value={Number(value)} 
      color={color} 
      isCurrency={isCurrency} 
    />
  </div>
)
}

const ProductionCard = ({ title, data, color }) => {

  const max = data.length ? Math.max(...data.map(m => m[1])) : 0

  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 
      w-full max-w-[520px] 
      shadow-lg">
      <h3 className="mb-6">{title}</h3>

      {data.length === 0 && (
        <div className="opacity-60">Veri yok.</div>
      )}

      {data.map(([name, total]) => {

        const percent = max ? (total / max) * 100 : 0

        return (
          <div key={name} className="mb-6">
            <div className="flex justify-between mb-2">
              <span>{name}</span>
              <strong>{total.toFixed(2)} m²</strong>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percent}%` }}
  transition={{ duration: 0.9, ease: "easeOut" }}
  style={{
    background: color,
    height: "100%",
    borderRadius: "999px"
  }}
/>
            </div>
          </div>
        )
      })}
    </div>
  )
}
const AnimatedNumber = ({ value, color, isCurrency }) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1000
    const increment = value / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= value) {
        start = value
        clearInterval(counter)
      }
      setDisplay(start)
    }, 16)

    return () => clearInterval(counter)
  }, [value])

  return (
  <div style={{ fontSize: 26, fontWeight: 600, color }}>
    {isCurrency && "₺"}
    {Number(display).toLocaleString("tr-TR", {
      maximumFractionDigits: isCurrency ? 2 : 0
    })}
  </div>
)
  const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const monthlyTotal = orders
  .filter(o => {
    if (o.status !== "completed") return false

    const date = new Date(o.created_at)
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  })
  .reduce((sum, o) => {
    const net = o.grand_total || 0
    const total = o.invoice_requested
      ? (o.total_with_kdv || net * 1.20)
      : net
    return sum + total
  }, 0)
}