import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import {
  getRestaurantById,
  updateRestaurant,
} from "@/lib/server/restaurants/service";
import { deleteRestaurant } from "@/lib/server/admin/service";
import { updateRestaurantSchema } from "@/lib/server/schemas/restaurants";

type Params = {
  id: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const { id } = await context.params;
    const restaurant = await getRestaurantById(toIntId(id));
    return json({ data: restaurant });
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    await requireRole(["admin"]);

    const { id } = await context.params;
    const restaurantId = toIntId(id);
    const patch = await parseJsonWithSchema(
      request,
      updateRestaurantSchema,
      "Invalid restaurant patch payload.",
    );

    const updated = await updateRestaurant(restaurantId, patch);
    return json({ data: updated });
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Params> },
) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;
    await deleteRestaurant(toIntId(id));
    return json({ success: true });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
