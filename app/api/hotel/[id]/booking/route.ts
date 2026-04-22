import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireRole, requireSession } from "@/lib/server/auth";
import {
  createBooking,
  listBookingsForHotel,
} from "@/lib/server/booking/service";
import { createBookingSchema } from "@/lib/server/schemas/booking";

type Params = {
  id: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  try {
    await requireRole(["admin", "inspector"]);

    const { id } = await context.params;
    const hotelId = toIntId(id);
    const bookings = await listBookingsForHotel(hotelId);

    return json({ data: bookings });
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { id } = await context.params;
    const hotelId = toIntId(id);
    const input = await parseJsonWithSchema(
      request,
      createBookingSchema,
      "Invalid booking payload.",
    );

    const booking = await createBooking(
      hotelId,
      session.user.id,
      input,
    );

    return json({ data: booking }, 201);
  } catch (cause) {
    return handleRouteError(cause);
  }
}
