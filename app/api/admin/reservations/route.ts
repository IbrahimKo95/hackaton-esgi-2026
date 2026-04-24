import { handleRouteError, json } from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import { listAllReservations } from "@/lib/server/admin/service";

export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const userId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const reservations = await listAllReservations({
      restaurantId: restaurantId ? Number(restaurantId) : undefined,
      userId: userId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });

    return json({ data: reservations });
  } catch (cause) {
    return handleRouteError(cause);
  }
}