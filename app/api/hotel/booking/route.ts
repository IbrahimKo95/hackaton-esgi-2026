import { handleRouteError, json } from "@/lib/server/http";
import { requireSession } from "@/lib/server/auth";
import { listBookingsForUser } from "@/lib/server/booking/service";

export async function GET() {
  try {
    const session = await requireSession();
    const bookings = await listBookingsForUser(session.user.id);

    return json({ data: bookings });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
