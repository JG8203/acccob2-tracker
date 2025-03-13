"use server";

import { z } from "zod";
import type { ActionResponse, EvaluationFormData } from "@/types/evaluation";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";

const evaluationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  signature: z.string().min(1, "Signature is required"),
  evaluationProof: z.string().min(1, "Evaluation proof is required"),
});

export async function submitEvaluation(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // Parse and validate form data
    const rawData: EvaluationFormData = {
      name: formData.get("name") as string,
      signature: formData.get("signature") as string,
      evaluationProof: formData.get("evaluationProof") as string,
    };

    const validatedData = evaluationSchema.safeParse(rawData);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    // Find the student
    const student = await prisma.student.findFirst({
      where: { name: validatedData.data.name },
    });

    if (!student) {
      return {
        success: false,
        message: `Student with name ${validatedData.data.name} not found 😔`,
      };
    }

    // Check if student already has an evaluation
    const existingEvaluation = await prisma.evaluation.findFirst({
      where: { studentId: student.id },
    });

    // Check if this is a confirmed resubmission
    const isConfirmedResubmission = formData.get("confirmResubmission") === "true";

    // If there's an existing evaluation and resubmission is not confirmed, return early
    if (existingEvaluation && !isConfirmedResubmission) {
      return {
        success: false,
        message: "existing_evaluation",
        existingEvaluation: true,
      };
    }

    // Process and upload files
    const [signatureURL, evaluationProofURL] = await Promise.all([
      processAndUploadImage(
        validatedData.data.signature, 
        `signature-eval-${student.id}-${Date.now()}.png`
      ),
      processAndUploadImage(
        validatedData.data.evaluationProof,
        `eval-proof-${student.id}-${Date.now()}.png`
      )
    ]);

    if (!signatureURL || !evaluationProofURL) {
      return {
        success: false,
        message: "Failed to upload files 😔",
      };
    }

    // Create or update the evaluation
    let evaluation;
    if (existingEvaluation && isConfirmedResubmission) {
      evaluation = await prisma.evaluation.update({
        where: { id: existingEvaluation.id },
        data: {
          signatureURL,
          evaluationProofURL,
          updatedAt: new Date(),
        },
      });
    } else {
      evaluation = await prisma.evaluation.create({
        data: {
          studentId: student.id,
          signatureURL,
          evaluationProofURL,
        }
      });
    }

    if (!evaluation) {
      return {
        success: false,
        message: "Failed to submit evaluation 😔",
      };
    }

    return {
      success: true,
      message: existingEvaluation && isConfirmedResubmission
        ? `${validatedData.data.name}'s evaluation has been updated successfully 🥰`
        : `${validatedData.data.name}'s evaluation has been submitted successfully 🥰`,
    };
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"} 😔`,
    };
  }
}

/**
 * Helper function to process and upload an image from a data URL
 */
async function processAndUploadImage(dataURL: string, filename: string): Promise<string | null> {
  try {
    const base64Data = dataURL.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const file = new File([buffer], filename, {
      type: 'image/png',
    });

    const uploadResult = await utapi.uploadFiles(file);
    
    if (!uploadResult.data) {
      console.error("Upload failed:", uploadResult.error);
      return null;
    }

    return uploadResult.data.url;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}

/**
 * Fetches all student options for dropdown selection
 */
export async function getStudentOptions(): Promise<{ value: string; label: string }[]> {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: 'asc' },
    });
    
    return students.map((student) => ({
      value: student.name,
      label: student.name,
    }));
  } catch (error) {
    console.error("Error fetching student options:", error);
    return [];
  }
}
