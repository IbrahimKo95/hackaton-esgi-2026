import { handleRouteError, json, parseJsonWithSchema } from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import {
  createRestaurant,
  listRestaurants,
} from "@/lib/server/restaurants/service";
import { createRestaurantSchema } from "@/lib/server/schemas/restaurants";

export async function GET() {
  try {
    const restaurants = await listRestaurants();
    return json({ data: restaurants });
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);

    const input = await parseJsonWithSchema(
      request,
      createRestaurantSchema,
      "Invalid restaurant payload.",
    );
    const restaurant = await createRestaurant(input);

    return json({ data: restaurant }, 201);
  } catch (cause) {
    return handleRouteError(cause);
  }
}
