import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  const adminName = session.user.name || "Admin";

  const navItems = [
    { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
    { href: "/admin/restaurants", label: "Restaurants", icon: "restaurant" },
    { href: "/admin/hotels", label: "Hôtels", icon: "hotel" },
    { href: "/admin/users", label: "Utilisateurs", icon: "users" },
    { href: "/admin/reservations", label: "Réservations", icon: "reservations" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f1] flex font-[var(--font-figtree)]">
      <aside className="w-64 bg-[#1a1a1a] text-white fixed h-full">
        <div className="p-5">
          <Link
            href="/admin"
            className="block text-xl font-semibold text-[#c1282d] mb-8"
          >
            Guide Michelin
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="bg-white h-16 flex items-center justify-between px-6 border-b border-[#e5e5e5]">
          <div></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666]">{adminName}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-[#7f1919] hover:underline"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}