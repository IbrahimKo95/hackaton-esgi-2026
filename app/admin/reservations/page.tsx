"use client";

import { useState, useEffect } from "react";

interface Reservation {
  id: number;
  date: string;
  guestCount: number;
  restaurant: {
    id: number;
    name: string;
    address: { city: string } | null;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRestaurant, setFilterRestaurant] = useState<number | undefined>();
  const [filterUser, setFilterUser] = useState<string | undefined>();
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchReservations() {
      try {
        const params = new URLSearchParams();
        
        if (filterRestaurant) params.append("restaurantId", String(filterRestaurant));
        if (filterUser) params.append("userId", filterUser);
        if (filterDateFrom) params.append("dateFrom", filterDateFrom);
        if (filterDateTo) params.append("dateTo", filterDateTo);
        
        const url = `/api/admin/reservations${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setReservations(data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des reservations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter((r) => {
    if (filterRestaurant && r.restaurant.id !== filterRestaurant) return false;
    if (filterUser && r.user.id !== filterUser) return false;
    if (filterDateFrom && new Date(r.date) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(r.date) > new Date(filterDateTo)) return false;
    return true;
  });

  const paginatedReservations = filteredReservations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = Math.ceil(filteredReservations.length / pageSize);

  function applyFilters() {
    setPage(1);
  }

  function clearFilters() {
    setFilterRestaurant(undefined);
    setFilterUser(undefined);
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(1);
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
          Gestion des réservations
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="block text-sm text-[#666] mb-1">
              Restaurant
            </p>
            <select
              value={filterRestaurant || ""}
              onChange={(e) =>
                setFilterRestaurant(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full border border-[#ddd] rounded px-2 py-1"
            >
              <option value="">Tous</option>
              {[
                ...new Set(
                  reservations.map((r) => JSON.stringify({ id: r.restaurant.id, name: r.restaurant.name }))
                ),
              ].map((r) => {
                const res = JSON.parse(r);
                return (
                  <option key={res.id} value={res.id}>
                    {res.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <p className="block text-sm text-[#666] mb-1">Date du</p>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-[#ddd] rounded px-2 py-1"
            />
          </div>

          <div>
            <p className="block text-sm text-[#666] mb-1">Date au</p>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-[#ddd] rounded px-2 py-1"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="bg-[#7f1919] text-white px-3 py-1 rounded hover:bg-[#8f1f1f] transition-colors"
            >
              Appliquer
            </button>
            <button
              onClick={clearFilters}
              className="text-sm text-[#666] hover:underline"
            >
              Reinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Restaurant
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Client
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Date
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">
                Convives
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedReservations.length > 0 ? (
              paginatedReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-b border-[#f0f0f0] hover:bg-[#fafafa]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{reservation.restaurant.name}</div>
                    <div className="text-sm text-[#666]">
                      {reservation.restaurant.address?.city}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {[
                        reservation.user.firstName,
                        reservation.user.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </div>
                    <div className="text-sm text-[#666]">
                      {reservation.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(reservation.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {reservation.guestCount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-[#666]"
                >
                  Aucune reservation trouvee.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e5e5]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-[#7f1919] hover:underline disabled:text-[#999]"
            >
              Precedent
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