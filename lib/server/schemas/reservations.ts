import { z } from "zod";

export const createReservationSchema = z.object({
  date: z
    .string({
      error: "date is required and must be a valid date string.",
    })
    .trim()
    .min(1, "date is required and must be a valid date string.")
    .transform((value) => new Date(value))
    .refine((value) => !Number.isNaN(value.getTime()), {
      message: "date is invalid.",
    }),
  guestCount: z
    .number({
      error: "guestCount must be an integer.",
    })
    .int("guestCount must be an integer.")
    .gt(0, "guestCount must be greater than 0."),
  userId: z.string().trim().optional(),
  userEmail: z.string().trim().email().toLowerCase().optional(),
});

export type ReservationCreateInput = z.infer<typeof createReservationSchema>;

export const updateReservationSchema = createReservationSchema;

export type ReservationUpdateInput = z.infer<typeof updateReservationSchema>;
