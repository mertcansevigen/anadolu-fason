import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import OrderModal from "../components/dashboard/OrderModal"
import { formatMoney } from "../utils/money"

export default function Orders(){

  const [orders,setOrders]=useState([])
  const [selected,setSelected]=useState(null)
  
  useEffect(()=>{fetchOrders()},[])

  const fetchOrders=async()=>{
    const {data,error}=await supabase
      .from("orders")
      .select(`
  id,
  created_at,
  width_cm,
  height_cm,
  quantity,
  status,
  payment_status,
  estimated_delivery,
  company_name,
  customer_name,
  customer_email,
  file_base64,
  file_name,
  link_url,
  finishing_breakdown,
  customer_phone,
  grand_total,
  invoice_requested,
  total_with_kdv,
  invoice_requested,
  materials!orders_material_id_fkey (
    name,
    price_per_m2
  )
`)
      .order("created_at",{ascending:false})

    if(!error) setOrders(data||[])
  }

  const updateStatus=async(id,status)=>{
    await supabase.from("orders").update({status}).eq("id",id)
    fetchOrders()
    setSelected(null)
  }

  return(
    <div className="p-10 text-white bg-slate-950 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tüm Siparişler</h1>
          <p className="text-slate-400 mt-2">
            Geçmişten bugüne tüm üretim ve sipariş kayıtları.
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <div className="grid grid-cols-6 px-6 py-4 text-sm text-slate-400 border-b border-slate-800">
          <div>SİPARİŞ NO</div>
          <div>FİRMA</div>
          <div>MALZEME</div>
          <div>DURUM</div>
          <div>TUTAR</div>
          <div>TESLİMAT</div>
        </div>

        {orders.map(order=>{

          const net = Number(order.grand_total || 0)

const brut = order.invoice_requested
  ? Number(order.total_with_kdv || net * 1.20)
  : net

const total = Number(brut.toFixed(2))

const kdvAmount = order.invoice_requested
  ? Number((total - net).toFixed(2))
  : 0

          const statusMap = {
            completed: { label: "Tamamlandı", color: "bg-emerald-500/20 text-emerald-400" },
            in_production: { label: "İşlemde", color: "bg-orange-500/20 text-orange-400" },
            cari: { label: "Cari", color: "bg-blue-500/20 text-blue-400" },
            cancelled: { label: "İptal", color: "bg-red-500/20 text-red-400" },
            pending: { label: "Ödeme Bekliyor", color: "bg-yellow-500/20 text-yellow-400" }
          }

          const status = statusMap[order.status] || {}

          return(
            <div
              key={order.id}
              onClick={()=>setSelected(order)}
              className="grid grid-cols-6 px-6 py-5 items-center border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer transition"
            >

              <div className="font-semibold">
                ORD-{order.id.slice(0,4).toUpperCase()}
              </div>

              <div className="text-slate-300">
                {order.company_name || order.customer_name || "-"}
              </div>

              <div className="text-slate-400">
  {order.materials?.name || "-"}
  <div className="text-xs text-slate-500 mt-1">
    {order.width_cm && order.height_cm
      ? `${order.width_cm.toFixed(1)} x ${order.height_cm.toFixed(1)} cm`
      : "-"}
  </div>
</div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div>
  <div className="font-semibold text-white">
  ₺{formatMoney(total)}
</div>

{order.invoice_requested && (
  <div className="text-xs text-emerald-400 mt-1">
    ₺{formatMoney(kdvAmount)} KDV (%20)
  </div>
)}
</div>

              <div className="text-slate-400">
                {order.estimated_delivery
                  ? new Date(order.estimated_delivery).toLocaleDateString("tr-TR")
                  : "-"}
              </div>

            </div>
          )
        })}

      </div>

      {/* MODAL */}
      <OrderModal
        selected={selected}
        setSelected={setSelected}
        updateStatus={updateStatus}
      />

    </div>
  )
}