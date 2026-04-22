import { handleRouteError, json, parseJsonWithSchema } from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import {
  createHotel,
  listHotels,
} from "@/lib/server/hotel/service";
import { createHotelSchema } from "@/lib/server/schemas/hotel";

export async function GET() {
  try {
    const hotels = await listHotels();
    return json({ data: hotels });
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);

    const input = await parseJsonWithSchema(
      request,
      createHotelSchema,
      "Invalid hotel payload.",
    );
    const hotel = await createHotel(input);

    return json({ data: hotel }, 201);
  } catch (cause) {
    return handleRouteError(cause);
  }
}
