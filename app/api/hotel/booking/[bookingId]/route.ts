import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireSession } from "@/lib/server/auth";
import { cancelBooking, updateBooking } from "@/lib/server/booking/service";
import { updateBookingSchema } from "@/lib/server/schemas/booking";

type Params = {
  bookingId: string;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { bookingId } = await context.params;
    const reservationId = toIntId(bookingId, "bookingId");
    const input = await parseJsonWithSchema(
      request,
      updateBookingSchema,
      "Invalid booking patch payload.",
    );

    const booking = await updateBooking(reservationId, session.user.id, input);

    return json({ data: booking });
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

    const { bookingId } = await context.params;
    const reservationId = toIntId(bookingId, "bookingId");
    const booking = await cancelBooking(reservationId, session.user.id);

    return json({ data: booking });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
