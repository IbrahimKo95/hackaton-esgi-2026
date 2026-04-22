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
  id: string;
  bookingId: string;
};

function isPrivilegedRole(role: string | undefined): boolean {
  return role === "admin" || role === "inspector";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { id, bookingId } = await context.params;
    const hotelId = toIntId(id);
    const reservationId = toIntId(bookingId, "bookingId");
    const input = await parseJsonWithSchema(
      request,
      updateBookingSchema,
      "Invalid booking patch payload.",
    );

    const booking = await updateBooking(
      reservationId,
      session.user.id,
      input,
      {
        hotelId,
        isPrivileged: isPrivilegedRole(session.user.role),
      },
    );

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

    const { id, bookingId } = await context.params;
    const hotelId = toIntId(id);
    const reservationId = toIntId(bookingId, "bookingId");

    const booking = await cancelBooking(reservationId, session.user.id, {
      hotelId,
      isPrivileged: isPrivilegedRole(session.user.role),
    });

    return json({ data: booking });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
