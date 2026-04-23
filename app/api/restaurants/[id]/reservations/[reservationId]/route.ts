import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireSession } from "@/lib/server/auth";
import {
  cancelReservationForRestaurant,
  updateReservationForRestaurant,
} from "@/lib/server/reservations/service";
import { updateReservationSchema } from "@/lib/server/schemas/reservations";

type Params = {
  id: string;
  reservationId: string;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { id, reservationId } = await context.params;
    const restaurantId = toIntId(id);
    const currentReservationId = toIntId(reservationId, "reservationId");
    const input = await parseJsonWithSchema(
      request,
      updateReservationSchema,
      "Invalid reservation payload.",
    );

    const reservation = await updateReservationForRestaurant(
      restaurantId,
      currentReservationId,
      session.user.id,
      input,
    );

    return json({ data: reservation });
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { id, reservationId } = await context.params;
    const restaurantId = toIntId(id);
    const currentReservationId = toIntId(reservationId, "reservationId");

    const reservation = await cancelReservationForRestaurant(
      restaurantId,
      currentReservationId,
      session.user.id,
    );

    return json({ data: reservation });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
