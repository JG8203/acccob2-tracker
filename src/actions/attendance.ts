"use server";
import { z } from "zod";
import type { ActionResponse, AttendanceFormData } from "@/types/attendance";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";

const attendanceSchema = z.object({
  code: z.coerce.number().int(),
  name: z.string().min(1),
  signature: z.string().min(1),
});

export async function submitAttendance(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData: AttendanceFormData = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      signature: formData.get("signature") as string, 
    };

    const validatedData = attendanceSchema.safeParse(rawData);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const student = await prisma.student.findFirst({
      where: {
        name: validatedData.data.name,
      },
    });

    if (!student) {
      return {
        success: false,
        message: `Student with name ${validatedData.data.name} not found 😔`,
      };
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        eventId: validatedData.data.code,
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        message: `${validatedData.data.name} is already registered for event ${validatedData.data.code} 😔`,
      };
    }

    // Convert data URL to File object for uploading
    const signatureDataURL = validatedData.data.signature;
    const base64Data = signatureDataURL.split(',')[1];
    const signatureBuffer = Buffer.from(base64Data, 'base64');
    
    // Create a File object from the buffer
    const signatureFile = new File([signatureBuffer], `signature-${student.id}-${validatedData.data.code}.png`, {
      type: 'image/png',
    });

    // Upload the signature to UploadThing
    const uploadResult = await utapi.uploadFiles(signatureFile);
    
    if (!uploadResult.data) {
      return {
        success: false,
        message: `Failed to upload signature: ${uploadResult.error?.message || "Unknown error"} 😔`,
      };
    }

    // Create attendance record with signature URL
    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        eventId: validatedData.data.code,
        signatureURL: uploadResult.data.url,
      },
    });

    if (!attendance) {
      return {
        success: false,
        message: "Failed to register attendance 😔",
      };
    }

    return {
      success: true,
      message: `${validatedData.data.name} has been registered for event ${validatedData.data.code} 🥰`,
    };
  } catch (error) {
    console.error("Error submitting attendance:", error);
    return {
      success: false,
      message: "An unexpected error occurred 😔",
    };
  }
}

export async function getStudentOptions(): Promise<
  { value: string; label: string }[]
> {
  try {
    const students = await prisma.student.findMany();
    const studentOptions = students.map((student: { id: number; name: string }) => ({
      value: student.name,
      label: student.name,
    }));
    return studentOptions;
  } catch (error) {
    console.error("Error fetching student options:", error);
    return [];
  }
}