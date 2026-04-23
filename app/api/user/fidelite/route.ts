import { handleRouteError, json } from "@/lib/server/http";
import { getAuthSession } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const fallbackId = requestUrl.searchParams.get("id")?.trim() ?? "";
    const fallbackEmail = requestUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";

    const session = await getAuthSession();
    const userId = session?.user?.id?.trim();
    const userEmail = session?.user?.email?.trim().toLowerCase();

    const effectiveId = userId || fallbackId;
    const effectiveEmail = userEmail || fallbackEmail;

    if (!effectiveId && !effectiveEmail) {
      return json({ error: { message: "Authentication required." } }, 401);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(effectiveId ? [{ id: effectiveId }] : []),
          ...(effectiveEmail ? [{ email: effectiveEmail }] : []),
        ],
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        rank: true,
        reservationCount: true,
      },
    });

    if (!user) {
      return json({ error: { message: "User not found." } }, 404);
    }

    return json({ data: user });
  } catch (cause) {
    return handleRouteError(cause);
  }
}
