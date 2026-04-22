import {
  handleRouteError,
  json,
  parseJsonWithSchema,
  toIntId,
} from "@/lib/server/http";
import { requireRole } from "@/lib/server/auth";
import {
  upsertDistinction,
} from "@/lib/server/hotel/service";
import { distinctionPatchSchema } from "@/lib/server/schemas/hotel";

type Params = {
  id: string;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<Params> },
) {
  try {
    await requireRole(["admin", "inspector"]);

    const { id } = await context.params;
    const hotelId = toIntId(id);
    const input = await parseJsonWithSchema(
      request,
      distinctionPatchSchema,
      "Invalid distinction payload.",
    );

    const distinction = await upsertDistinction(hotelId, input);
    return json({ data: distinction });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
