import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function BankAccounts(){

  const [accounts,setAccounts] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    fetchAccounts()
  },[])

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("account_type",{ascending:true})

    if(!error) setAccounts(data || [])
    setLoading(false)
  }

  const updateAccount = async (id, field, value) => {
    await supabase
      .from("bank_accounts")
      .update({ [field]: value })
      .eq("id", id)

    fetchAccounts()
  }

  if(loading) return <div className="p-10 text-white">Yükleniyor...</div>

  return (
  <div className="p-10 text-white bg-slate-950 min-h-screen">

    <h1 className="text-3xl font-bold mb-10">
      Banka Hesapları
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">

      {accounts.map(acc => (
        <div
  key={acc.id}
  className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold capitalize">
              {acc.account_type === "company" ? "Şirket Hesabı" : "Kişisel Hesap"}
            </div>

            <input
              type="checkbox"
              checked={acc.is_active}
              className="w-5 h-5 accent-emerald-500"
              onChange={(e)=>updateAccount(acc.id,"is_active",e.target.checked)}
            />
          </div>

          {/* Body */}
          <div className="space-y-4">

            <div>
              <label className="text-sm text-slate-400">Banka</label>
              <input
                defaultValue={acc.bank_name}
                className="w-full mt-1 bg-slate-800 p-3 rounded-lg"
                onBlur={(e)=>updateAccount(acc.id,"bank_name",e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Hesap Adı</label>
              <input
                defaultValue={acc.account_name}
                className="w-full mt-1 bg-slate-800 p-3 rounded-lg"
                onBlur={(e)=>updateAccount(acc.id,"account_name",e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">IBAN</label>
              <input
                defaultValue={acc.iban}
                className="w-full mt-1 bg-slate-800 p-3 rounded-lg tracking-wider"
                onBlur={(e)=>updateAccount(acc.id,"iban",e.target.value)}
              />
            </div>

          </div>

        </div>
      ))}

    </div>

  </div>
)
}