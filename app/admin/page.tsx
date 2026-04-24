import { getAdminStats } from "@/lib/server/admin/service";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Restaurants",
      value: stats.restaurantCount,
      color: "bg-[#7f1919]",
    },
    {
      label: "Hôtels",
      value: stats.hotelCount,
      color: "bg-[#2b6cff]",
    },
    {
      label: "Utilisateurs",
      value: stats.userCount,
      color: "bg-[#00a862]",
    },
    {
      label: "Réservations",
      value: stats.reservationCount,
      color: "bg-[#f5a623]",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#171717] mb-6">
        Tableau de bord administrateur
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center`}>
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#171717]">{card.value}</p>
                <p className="text-sm text-[#666]">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <h2 className="text-lg font-semibold text-[#171717] mb-4">
          Tendances récentes
        </h2>
        <p className="text-sm text-[#666]">
          Consultez les pages dédiées pour voir les tendances détaillées.
        </p>
      </div>
    </div>
  );
}