import { hash } from "bcryptjs";

import { Prisma } from "@/app/generated/prisma/client";
import { HttpError, handleRouteError, json, parseJsonWithSchema } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { registerSchema } from "@/lib/server/schemas/auth";

export async function POST(request: Request) {
  try {
    const input = await parseJsonWithSchema(request, registerSchema, "Invalid register payload.");

    const email = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new HttpError(409, "An account already exists with this email.");
    }

    const passwordHash = await hash(input.password, 10);

    const userRole = await prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: {
        name: "user",
        type: 3,
      },
      select: { id: true, name: true },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        roleId: userRole.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    return json(
      {
        data: {
          ...user,
          role: userRole.name,
        },
      },
      201,
    );
  } catch (cause) {
    if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") {
      return handleRouteError(new HttpError(409, "An account already exists with this email."));
    }

    return handleRouteError(cause);
  }
}
