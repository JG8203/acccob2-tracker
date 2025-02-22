"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const StudentSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
});

const EventSchema = z.object({
  id: z.number(),
  date: z.date(),
  label: z.string().nullable(),
});

const AttendanceSchema = z.object({
  id: z.number(),
  studentId: z.number(),
  eventId: z.number(),
  timestamp: z.date(),
  student: StudentSchema,
  event: EventSchema,
});

export type Student = z.infer<typeof StudentSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;

export async function getAttendance(eventCode: string) {
  try {
    const validatedEventCode = z.coerce.number().positive().parse(eventCode);
    
    const attendance = await prisma.attendance.findFirst({
      where: {
        eventId: validatedEventCode,
      },
      include: {
        student: true,
        event: true,
      },
    });

    return attendance ? AttendanceSchema.parse(attendance) : null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw error;
  }
}