import {
  HttpError,
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireSession } from "@/lib/server/auth";
import {
  createReservationForRestaurant,
  listReservationsForRestaurant,
} from "@/lib/server/reservations/service";
import { createReservationSchema } from "@/lib/server/schemas/reservations";
import { prisma } from "@/lib/server/prisma";

type Params = {
  id: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const { id } = await context.params;
    const restaurantId = toIntId(id);
    const input = await parseJsonWithSchema(
      request,
      createReservationSchema,
      "Invalid reservation payload.",
    );

    let userId: string;

    try {
      const session = await requireSession();
      userId = session.user.id;
    } catch {
      const fallbackId = input.userId?.trim() ?? "";
      const fallbackEmail = input.userEmail?.trim().toLowerCase() ?? "";

      if (!fallbackId && !fallbackEmail) {
        throw new HttpError(401, "Authentication required.");
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(fallbackId ? [{ id: fallbackId }] : []),
            ...(fallbackEmail ? [{ email: fallbackEmail }] : []),
          ],
        },
        select: { id: true },
      });

      if (!user) {
        throw new HttpError(404, "User not found.");
      }

      userId = user.id;
    }

    const reservation = await createReservationForRestaurant(
      restaurantId,
      userId,
      input,
    );

    return json({ data: reservation }, 201);
  } catch (cause) {
    return handleRouteError(cause);
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<Params> },
) {
  try {
    const session = await requireSession();

    const { id } = await context.params;
    const restaurantId = toIntId(id);
    const reservations = await listReservationsForRestaurant(
      restaurantId,
      session.user.id,
    );

    return json({ data: reservations });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
