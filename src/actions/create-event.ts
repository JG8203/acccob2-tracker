"use server";

import { z } from "zod";
import type { ActionResponse, EventFormData } from "@/types/event";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  code: z.coerce.number().int(),
  label: z.string().min(1).nullable(),
});

export async function createEvent(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData: EventFormData = {
      code: formData.get("code") as string,
      label: formData.get("label") as string,
    };

    const validatedData = eventSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const existingEvent = await prisma.event.findUnique({
      where: {
        id: validatedData.data.code,
      },
    });

    if (existingEvent) {
      return {
        success: false,
        message: `An event with ID ${validatedData.data.code} already exists 😔`,
      };
    }

    const event = await prisma.event.create({
      data: {
        id: validatedData.data.code,
        label: validatedData.data.label,
      },
    });

    if (!event) {
      return {
        success: false,
        message: "Failed to create the event 😔",
      };
    }

    return {
      success: true,
      message: `New event registered with ID ${event.id} 🥰`,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      message: "An unexpected error occurred! Please check if the ID is unique or try again later.",
    };
  }
}