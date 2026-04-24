"use client";

import { useState, useEffect } from "react";

interface Hotel {
  id: number;
  name: string;
  starRating: number;
  address: {
    city: string;
    country: string;
  } | null;
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Hotel>>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch("/api/hotel?type=list");
        if (res.ok) {
          const data = await res.json();
          setHotels(data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des hotels:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  const paginatedHotels = hotels.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(hotels.length / pageSize);

  function startEdit(hotel: Hotel) {
    setEditingId(hotel.id);
    setEditForm({ name: hotel.name, starRating: hotel.starRating });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/hotel/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      const updated = await res.json();
      setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, ...updated.data } : h)));
    }

    cancelEdit();
  }

  async function deleteHotel(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer cet hôtel ?")) return;

    const res = await fetch(`/api/hotel/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setHotels((prev) => prev.filter((h) => h.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-[#666]">Chargement...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#171717]">
          Gestion des hôtels
        </h1>
        <a
          href="/admin/hotels/new"
          className="bg-[#7f1919] text-white px-4 py-2 rounded hover:bg-[#8f1f1f] transition-colors"
        >
          Ajouter un hôtel
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Nom</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Ville</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Catégorie</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[#666]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHotels.map((hotel) => (
              <tr key={hotel.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                <td className="px-4 py-3">
                  {editingId === hotel.id ? (
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="border border-[#ddd] rounded px-2 py-1 w-full"
                    />
                  ) : (
                    hotel.name
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#666]">{hotel.address?.city}</td>
                <td className="px-4 py-3 text-sm text-[#666]">
                  {editingId === hotel.id ? (
                    <input
                      type="number"
                      value={editForm.starRating || 0}
                      onChange={(e) => setEditForm((f) => ({ ...f, starRating: Number(e.target.value) }))}
                      className="border border-[#ddd] rounded px-2 py-1 w-20"
                      min={0}
                      max={5}
                    />
                  ) : (
                    "★".repeat(hotel.starRating)
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === hotel.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => saveEdit(hotel.id)} className="text-sm text-[#00a862] hover:underline">
                        Enregistrer
                      </button>
                      <button onClick={cancelEdit} className="text-sm text-[#666] hover:underline">
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(hotel)} className="text-sm text-[#2b6cff] hover:underline">
                        Modifier
                      </button>
                      <button onClick={() => deleteHotel(hotel.id)} className="text-sm text-[#c1282d] hover:underline">
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e5e5]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-[#7f1919] hover:underline disabled:text-[#999]"
            >
              Précédent
            </button>
            <span className="text-sm text-[#666]">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm text-[#7f1919] hover:underline disabled:text-[#999]"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}