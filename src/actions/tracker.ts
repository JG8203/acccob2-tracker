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

export async function getAttendance(eventCode: string | undefined) {
  try {
    if (!eventCode) {
      return [];
    }
    
    const validatedEventCode = z.coerce
      .number()
      .positive()
      .safeParse(eventCode);
    
    // If validation fails, return empty array
    if (!validatedEventCode.success) {
      console.log(`Invalid event code: ${eventCode}`);
      return [];
    }

    const studentsWithAttendanceStatus = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        attendance: {
          where: {
            eventId: validatedEventCode.data,
          },
          select: {
            signatureURL: true,
            timestamp: true,
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
      signatureURL: student.attendance[0]?.signatureURL || null,
      timestamp: student.attendance[0]?.timestamp || null,
      eventInfo: student.attendance[0]?.event || null,
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return []; // Return empty results on error
  }
}
