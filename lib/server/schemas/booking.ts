import { z } from "zod";

const dateString = (field: string) =>
    z
        .string({ error: `${field} is required and must be a valid date string.` })
        .trim()
        .min(1, `${field} is required and must be a valid date string.`)
        .transform((value) => new Date(value))
        .refine((value) => !Number.isNaN(value.getTime()), {
            message: `${field} is invalid.`,
        });

export const createBookingSchema = z
    .object({
        checkIn: dateString("checkIn"),
        checkOut: dateString("checkOut"),
        breakfast: z.boolean({ error: "breakfast must be a boolean." }).optional(),
        lateCheckout: z.boolean({ error: "lateCheckout must be a boolean." }).optional(),
        roomId: z.number({ error: "roomId must be an integer." }).int("roomId must be an integer.").gt(0, "roomId must be greater than 0."),
    })
    .refine((data) => data.checkOut > data.checkIn, {
        message: "checkOut must be after checkIn.",
        path: ["checkOut"],
    });

export const updateBookingSchema = z
    .object({
        checkIn: dateString("checkIn").optional(),
        checkOut: dateString("checkOut").optional(),
        breakfast: z.boolean({ error: "breakfast must be a boolean." }).optional(),
        lateCheckout: z.boolean({ error: "lateCheckout must be a boolean." }).optional(),
        roomId: z.number({ error: "roomId must be an integer." }).int("roomId must be an integer.").gt(0, "roomId must be greater than 0.").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided.",
    })
    .refine((data) => {
        if (!data.checkIn || !data.checkOut) {
            return true;
        }
        return data.checkOut > data.checkIn;
    }, {
        message: "checkOut must be after checkIn.",
        path: ["checkOut"],
    });

export type BookingCreateInput = z.infer<typeof createBookingSchema>;
export type BookingUpdateInput = z.infer<typeof updateBookingSchema>;
