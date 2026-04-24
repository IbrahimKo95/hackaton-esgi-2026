import { handleRouteError, json } from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import { getAdminStats } from "@/lib/server/admin/service";

export async function GET() {
  try {
    await requireRole(["admin"]);

    const stats = await getAdminStats();
    return json({ data: stats });
  } catch (cause) {
    return handleRouteError(cause);
  }
}