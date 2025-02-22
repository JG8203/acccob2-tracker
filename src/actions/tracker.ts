"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type Student = {
  id: number;
  name: string;
};

export type Event = {
  id: number;
  date: Date;
  label: string | null;
};

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