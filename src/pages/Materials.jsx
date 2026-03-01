import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Materials() {

  const [materials, setMaterials] = useState([])
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [rollInputs, setRollInputs] = useState({})
  const [editingPrice, setEditingPrice] = useState({})
  const [editingFramePrice, setEditingFramePrice] = useState({})
  const [openCard, setOpenCard] = useState(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select(`
        id,
        name,
        price_per_m2,
        has_frame,
        frame_price_per_meter,
        material_rolls (
          id,
          roll_width_mm
        )
      `)

    if (error) {
      console.error(error)
      return
    }

    setMaterials(data || [])
  }

  const addMaterial = async () => {
    if (!newName || !newPrice) return

    await supabase
      .from("materials")
      .insert({
        name: newName,
        price_per_m2: parseFloat(newPrice)
      })

    setNewName("")
    setNewPrice("")
    fetchMaterials()
  }

  const updatePrice = async (materialId) => {
    const newValue = editingPrice[materialId]
    if (!newValue) return

    await supabase
      .from("materials")
      .update({ price_per_m2: parseFloat(newValue) })
      .eq("id", materialId)

    setEditingPrice(prev => ({ ...prev, [materialId]: "" }))
    fetchMaterials()
  }

  const updateFramePrice = async (materialId) => {
    const newValue = editingFramePrice[materialId]
    if (!newValue) return

    await supabase
      .from("materials")
      .update({ frame_price_per_meter: parseFloat(newValue) })
      .eq("id", materialId)

    setEditingFramePrice(prev => ({ ...prev, [materialId]: "" }))
    fetchMaterials()
  }

  const addRoll = async (materialId) => {
    const width = rollInputs[materialId]
    if (!width) return

    await supabase
      .from("material_rolls")
      .insert({
        material_id: materialId,
        roll_width_mm: parseInt(width)
      })

    setRollInputs(prev => ({ ...prev, [materialId]: "" }))
    fetchMaterials()
  }

  const deleteRoll = async (rollId) => {
    await supabase
      .from("material_rolls")
      .delete()
      .eq("id", rollId)

    fetchMaterials()
  }

  const deleteMaterial = async (materialId) => {
    const confirmDelete = confirm("Bu malzemeyi silmek istediğine emin misin?")
    if (!confirmDelete) return

    await supabase
      .from("materials")
      .delete()
      .eq("id", materialId)

    fetchMaterials()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-10">

      <h1 className="text-2xl mb-10">Malzeme Yönetimi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {materials.map(mat => {

          const isOpen = openCard === mat.id

          return (
            <div
              key={mat.id}
              onClick={() => setOpenCard(isOpen ? null : mat.id)}
              className="group relative p-6 rounded-2xl 
              bg-gradient-to-br from-slate-900/90 to-slate-800/60 
              backdrop-blur border border-slate-800 
              hover:border-blue-400 
              hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] 
              hover:scale-[1.02] 
              transition-all duration-300 cursor-pointer"
            >

              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{mat.name}</h2>
                  <div className="text-blue-400 text-sm mt-1">
                    ₺{mat.price_per_m2} / m²
                  </div>
                </div>
                <div className="text-sm opacity-60">
                  {isOpen ? "▲" : "▼"}
                </div>
              </div>

              {isOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-6 space-y-6"
                >

                  {/* Fiyat Güncelle */}
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Yeni m² fiyat"
                      value={editingPrice[mat.id] || ""}
                      onChange={e =>
                        setEditingPrice(prev => ({
                          ...prev,
                          [mat.id]: e.target.value
                        }))
                      }
                      className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    />

                    <button
                      onClick={() => updatePrice(mat.id)}
                      className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Güncelle
                    </button>

                    <button
                      onClick={() => deleteMaterial(mat.id)}
                      className="text-red-400 text-sm"
                    >
                      Sil
                    </button>
                  </div>

                  {/* FRAME ALANI */}
                  {mat.has_frame && (
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-400">
                        Çıta Metre Fiyatı: ₺{mat.frame_price_per_meter}
                      </div>

                      <input
                        type="number"
                        placeholder="Yeni çıta fiyatı"
                        value={editingFramePrice[mat.id] || ""}
                        onChange={e =>
                          setEditingFramePrice(prev => ({
                            ...prev,
                            [mat.id]: e.target.value
                          }))
                        }
                        className="w-40 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />

                      <button
                        onClick={() => updateFramePrice(mat.id)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Güncelle
                      </button>
                    </div>
                  )}

                  {/* RULOLAR */}
                  <div>
                    <strong>Rulolar:</strong>

                    {mat.material_rolls.map(roll => (
                      <div key={roll.id} className="flex gap-3 mt-2">
                        {roll.roll_width_mm} mm
                        <button
                          onClick={() => deleteRoll(roll.id)}
                          className="text-red-400 text-sm"
                        >
                          Sil
                        </button>
                      </div>
                    ))}

                    <div className="mt-4 flex gap-3 items-center">
                      <input
                        placeholder="Rulo mm"
                        type="number"
                        value={rollInputs[mat.id] || ""}
                        onChange={e =>
                          setRollInputs(prev => ({
                            ...prev,
                            [mat.id]: e.target.value
                          }))
                        }
                        className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />

                      <button
                        onClick={() => addRoll(mat.id)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Ekle
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )
        })}

      </div>

    </div>
  )
}