import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import {
  getHotelById,
  updateHotel,
} from "@/lib/server/hotel/service";
import { updateHotelSchema } from "@/lib/server/schemas/hotel";

type Params = {
  id: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const { id } = await context.params;
    const hotel = await getHotelById(toIntId(id));
    return json({ data: hotel });
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
    const hotelId = toIntId(id);
    const patch = await parseJsonWithSchema(
      request,
      updateHotelSchema,
      "Invalid hotel patch payload.",
    );

    const updated = await updateHotel(hotelId, patch);
    return json({ data: updated });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
