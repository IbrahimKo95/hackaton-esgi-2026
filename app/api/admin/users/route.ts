import { handleRouteError, HttpError, json } from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import { listUsers, listRoles, updateUserRole, deactivateUser } from "@/lib/server/admin/service";

export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "list") {
      const [users, roles] = await Promise.all([listUsers(), listRoles()]);
      return json({ data: { users, roles } });
    }

    if (type === "roles") {
      const roles = await listRoles();
      return json({ data: roles });
    }

    return handleRouteError(new HttpError(400, "Invalid type."));
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();
    const { userId, roleId, action } = body;

    if (!userId) {
      return handleRouteError(new HttpError(400, "userId is required."));
    }

    if (action === "deactivate") {
      const user = await deactivateUser(userId);
      return json({ data: user });
    }

    if (roleId !== undefined) {
      const user = await updateUserRole(userId, roleId);
      return json({ data: user });
    }

    return handleRouteError(new HttpError(400, "Invalid action."));
  } catch (cause) {
    return handleRouteError(cause);
  }
}