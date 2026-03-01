import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function PostOperations() {

  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCategory, setOpenCategory] = useState(null)

  const [newItem, setNewItem] = useState({
    name: "",
    category: "laminasyon",
    price_type: "m2",
    unit_price: ""
  })

  useEffect(() => {
    fetchOperations()
  }, [])

  const fetchOperations = async () => {
    const { data } = await supabase
      .from("post_operations")
      .select("*")
      .order("category", { ascending: true })

    setOperations(data || [])
    setLoading(false)
  }

  const updateField = async (id, field, value) => {
    await supabase
      .from("post_operations")
      .update({ [field]: value })
      .eq("id", id)

    fetchOperations()
  }

  const toggleActive = async (id, current) => {
    await supabase
      .from("post_operations")
      .update({ is_active: !current })
      .eq("id", id)

    fetchOperations()
  }

  const deleteItem = async (id) => {
    await supabase
      .from("post_operations")
      .delete()
      .eq("id", id)

    fetchOperations()
  }

  const addItem = async () => {
    if (!newItem.name || !newItem.unit_price) return

    await supabase.from("post_operations").insert({
      ...newItem,
      unit_price: parseFloat(newItem.unit_price),
      is_active: true
    })

    setNewItem({
      name: "",
      category: "laminasyon",
      price_type: "m2",
      unit_price: ""
    })

    fetchOperations()
  }

  const formatPrice = (value) => {
    return `₺${Number(value).toLocaleString("tr-TR", {
      minimumFractionDigits: 2
    })}`
  }

  const categoryLabels = {
    laminasyon: "Laminasyon",
    aplikasyon: "Aplikasyon",
    kusgozu: "Kuşgözü",
    kenar_kaynak: "Kenar Kaynak"
  }

  const grouped = operations.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  if (loading)
    return <div className="p-10 text-white">Yükleniyor...</div>

  return (
    <div className="p-10 text-white bg-slate-950 min-h-screen">

      <h1 className="text-3xl font-bold mb-10">
        Baskı Sonrası İşlemler
      </h1>

      {/* Yeni İşlem */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-12">
        <h2 className="text-lg font-semibold mb-6">
          Yeni İşlem Ekle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <input
            placeholder="İşlem Adı"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            className="bg-slate-800 p-3 rounded-lg"
          />

          <select
            value={newItem.category}
            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
            className="bg-slate-800 p-3 rounded-lg"
          >
            <option value="laminasyon">Laminasyon</option>
            <option value="aplikasyon">Aplikasyon</option>
            <option value="kusgozu">Kuşgözü</option>
            <option value="kenar_kaynak">Kenar Kaynak</option>
          </select>

          <select
            value={newItem.price_type}
            onChange={e => setNewItem({ ...newItem, price_type: e.target.value })}
            className="bg-slate-800 p-3 rounded-lg"
          >
            <option value="m2">m²</option>
            <option value="unit">Adet</option>
          </select>

          <input
            placeholder="Birim Fiyat"
            type="number"
            value={newItem.unit_price}
            onChange={e => setNewItem({ ...newItem, unit_price: e.target.value })}
            className="bg-slate-800 p-3 rounded-lg"
          />

        </div>

        <button
          onClick={addItem}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg"
        >
          Ekle
        </button>
      </div>

      {/* Accordion Kategoriler */}
      <div className="space-y-6">

        {Object.entries(grouped).map(([category, items]) => {

          const isOpen = openCategory === category

          return (
            <div
              key={category}
              className="bg-slate-900 border border-slate-800 rounded-2xl"
            >

              {/* Header */}
              <div
                onClick={() =>
                  setOpenCategory(isOpen ? null : category)
                }
                className="flex justify-between items-center p-6 cursor-pointer"
              >
                <div className="text-lg font-semibold">
                  {categoryLabels[category] || category}
                </div>

                <div className="text-slate-400 text-sm">
                  {items.length} işlem
                </div>
              </div>

              {/* Body */}
              {isOpen && (
                <div className="px-6 pb-6 space-y-4">

                  {items.map(op => (
                    <div
                      key={op.id}
                      className="bg-slate-800 p-5 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4 items-center"
                    >

                      <input
                        defaultValue={op.name}
                        onBlur={e =>
                          updateField(op.id, "name", e.target.value)
                        }
                        className="bg-slate-700 p-2 rounded"
                      />

                      <select
                        defaultValue={op.price_type}
                        onChange={e =>
                          updateField(op.id, "price_type", e.target.value)
                        }
                        className="bg-slate-700 p-2 rounded"
                      >
                        <option value="m2">m²</option>
                        <option value="unit">Adet</option>
                      </select>

                      <input
                        type="number"
                        defaultValue={op.unit_price}
                        onBlur={e =>
                          updateField(
                            op.id,
                            "unit_price",
                            parseFloat(e.target.value)
                          )
                        }
                        className="bg-slate-700 p-2 rounded"
                      />

                      <div className="text-emerald-400 font-semibold">
                        {formatPrice(op.unit_price)}
                      </div>

                      <button
                        onClick={() =>
                          toggleActive(op.id, op.is_active)
                        }
                        className={`px-4 py-2 rounded ${
                          op.is_active
                            ? "bg-emerald-600"
                            : "bg-slate-600"
                        }`}
                      >
                        {op.is_active ? "Aktif" : "Pasif"}
                      </button>

                      <button
                        onClick={() => deleteItem(op.id)}
                        className="bg-red-600 px-4 py-2 rounded"
                      >
                        Sil
                      </button>

                    </div>
                  ))}

                </div>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}