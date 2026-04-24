"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: { name: string | null } | null;
  createdAt: string;
}

interface Role {
  id: number;
  name: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetch("/api/admin/users?type=list"),
          fetch("/api/admin/users?type=roles"),
        ]);
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          setRoles(rolesData.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des donnees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(users.length / pageSize);

  async function saveRole(userId: string, roleId: number | null) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleId }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: roles.find((r) => r.id === roleId) || null }
            : u
        )
      );
    }

    setEditingId(null);
    setEditRoleId(null);
  }

  async function deactivateUser(userId: string) {
    if (!confirm("Voulez-vous vraiment desactiver cet utilisateur ?")) return;

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "deactivate" }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: { name: "Désactivé" } }
            : u
        )
      );
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
          Gestion des utilisateurs
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Nom</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Rôle</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[#666]">Inscrit le</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[#666]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#f0f0f0] hover:bg-[#fafafa]"
              >
                <td className="px-4 py-3">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-[#666]">
                  {user.email || "—"}
                </td>
                <td className="px-4 py-3">
                  {editingId === user.id ? (
                    <select
                      value={editRoleId ?? 0}
                      onChange={(e) =>
                        setEditRoleId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="border border-[#ddd] rounded px-2 py-1"
                    >
                      <option value={0}>Sélectionner...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        user.role?.name === "admin"
                          ? "bg-[#7f1919] text-white"
                          : user.role?.name === "inspector"
                          ? "bg-[#2b6cff] text-white"
                          : "bg-[#e5e5e5] text-[#666]"
                      }`}
                    >
                      {user.role?.name || "user"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#666]">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === user.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => saveRole(user.id, editRoleId)}
                        className="text-sm text-[#00a862] hover:underline"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditRoleId(null);
                        }}
                        className="text-sm text-[#666] hover:underline"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(user.id);
                          setEditRoleId(
                            roles.find((r) => r.name === user.role?.name)
                              ?.id ?? null
                          );
                        }}
                        className="text-sm text-[#2b6cff] hover:underline"
                      >
                        Modifier
                      </button>
                      {user.role?.name !== "admin" && (
                        <button
                          onClick={() => deactivateUser(user.id)}
                          className="text-sm text-[#c1282d] hover:underline"
                        >
                          Désactiver
                        </button>
                      )}
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