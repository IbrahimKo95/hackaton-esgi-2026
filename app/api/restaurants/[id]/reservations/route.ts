import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireSession } from "@/lib/server/auth";
import {
  createReservationForRestaurant,
} from "@/lib/server/reservations/service";
import { createReservationSchema } from "@/lib/server/schemas/reservations";

type Params = {
  id: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { id } = await context.params;
    const restaurantId = toIntId(id);
    const input = await parseJsonWithSchema(
      request,
      createReservationSchema,
      "Invalid reservation payload.",
    );

    const reservation = await createReservationForRestaurant(
      restaurantId,
      session.user.id,
      input,
    );

    return json({ data: reservation }, 201);
  } catch (cause) {
    return handleRouteError(cause);
  }
}
