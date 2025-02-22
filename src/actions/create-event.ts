"use server";

import { z } from "zod";
import type { ActionResponse, EventFormData } from "@/types/event";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  code: z.coerce.number().int(),
  label: z.string().min(1).nullable(),
});

export async function createEvent(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    try {
      const rawData: EventFormData = {
        code: formData.get('code') as string,
        label: formData.get('label') as string,
      }
  
      const validatedData = eventSchema.safeParse(rawData)
  
      if (!validatedData.success) {
        return {
          success: false,
          message: 'Please fix the errors in the form',
          errors: validatedData.error.flatten().fieldErrors,
        }
      }
      
      // Prisma BS
      console.log('Event registered:', validatedData.data)
      const event = await prisma.event.create({
        data: {
          id: validatedData.data.code,
          label: validatedData.data.label,
          }
      })
      
      return {
        success: true,
        message: `New event registered with ID ${event.id} 🥰`,
      }
    } catch (error) {
      return {
        success: false,
        message: `An unexpected error occurre! Check if ID is unique`,
      }
    }
  }