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

const AttendanceArraySchema = z.array(AttendanceSchema);

export type Student = z.infer<typeof StudentSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;

export async function getAttendance(eventCode: string) {
  try {
    const validatedEventCode = z.coerce.number().positive().parse(eventCode);

    const studentsWithAttendanceStatus = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        attendance: {
          where: {
            eventId: validatedEventCode,
          },
          select: {
            event: {
              select: {
                date: true,
                label: true,
              },
            },
          },
        },
      },
    });

    const formattedResults = studentsWithAttendanceStatus.map(student => ({
      id: student.id,
      name: student.name,
      attended: student.attendance.length > 0,
      eventInfo: student.attendance[0]?.event || null,
    }));

    return formattedResults;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }
    throw error;
  }
}