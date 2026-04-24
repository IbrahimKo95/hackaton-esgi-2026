"use client";

import { useState, useEffect, useTransition } from "react";

interface Restaurant {
  id: number;
  name: string;
  priceRange: number;
  address: {
    city: string;
    country: string;
  } | null;
  createdAt: string;
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({});
  const [isPending] = useTransition();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch("/api/restaurants?type=list");
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des restaurants:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  const paginatedRestaurants = restaurants.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(restaurants.length / pageSize);

  function startEdit(restaurant: Restaurant) {
    setEditingId(restaurant.id);
    setEditForm({
      name: restaurant.name,
      priceRange: restaurant.priceRange,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      const updated = await res.json();
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated.data } : r))
      );
    }

    cancelEdit();
  }

  async function deleteRestaurant(id: number) {
    if (!confirm("Voulez-vous vraiment supprimer ce restaurant ?")) return;

    const res = await fetch(`/api/restaurants/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
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
          Gestion des restaurants
        </h1>
        <a
          href="/admin/restaurants/new"
          className="bg-[#7f1919] text-white px-4 py-2 rounded hover:bg-[#8f1f1f] transition-colors"
        >
          Ajouter un restaurant
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Nom
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Ville
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Gamme de prix
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[#666]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRestaurants.map((restaurant) => (
              <tr
                key={restaurant.id}
                className="border-b border-[#f0f0f0] hover:bg-[#fafafa]"
              >
                <td className="px-4 py-3">
                  {editingId === restaurant.id ? (
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="border border-[#ddd] rounded px-2 py-1 w-full"
                    />
                  ) : (
                    restaurant.name
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#666]">
                  {restaurant.address?.city}
                </td>
                <td className="px-4 py-3 text-sm text-[#666]">
                  {editingId === restaurant.id ? (
                    <input
                      type="number"
                      value={editForm.priceRange || 0}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          priceRange: Number(e.target.value),
                        }))
                      }
                      className="border border-[#ddd] rounded px-2 py-1 w-20"
                      min={1}
                    />
                  ) : (
                    "$".repeat(restaurant.priceRange)
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === restaurant.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => saveEdit(restaurant.id)}
                        disabled={isPending}
                        className="text-sm text-[#00a862] hover:underline"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-[#666] hover:underline"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(restaurant)}
                        className="text-sm text-[#2b6cff] hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteRestaurant(restaurant.id)}
                        className="text-sm text-[#c1282d] hover:underline"
                      >
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