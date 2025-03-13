"use server";
import { z } from "zod";
import type { ActionResponse, EvaluationFormData } from "@/types/evaluation";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing";

const evaluationSchema = z.object({
  name: z.string().min(1),
  signature: z.string().min(1),
  evaluationProof: z.string().min(1),
});

export async function submitEvaluation(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
  try {
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

    // Check if student already has an evaluation
    const existingEvaluation = await prisma.evaluation.findFirst({
      where: {
        studentId: student.id,
      },
    });

    // If this is a confirmed resubmission, we'll proceed
    const isConfirmedResubmission = formData.get("confirmResubmission") === "true";

    // If there's an existing evaluation and resubmission is not confirmed, return early
    if (existingEvaluation && !isConfirmedResubmission) {
      return {
        success: false,
        message: "existing_evaluation",
        existingEvaluation: true,
      };
    }

    // Process signature
    const signatureDataURL = validatedData.data.signature;
    const signatureBase64Data = signatureDataURL.split(',')[1];
    const signatureBuffer = Buffer.from(signatureBase64Data, 'base64');
    
    const signatureFile = new File([signatureBuffer], `signature-eval-${student.id}-${Date.now()}.png`, {
      type: 'image/png',
    });

    // Process evaluation proof
    const evaluationProofDataURL = validatedData.data.evaluationProof;
    const evaluationProofBase64Data = evaluationProofDataURL.split(',')[1];
    const evaluationProofBuffer = Buffer.from(evaluationProofBase64Data, 'base64');
    
    const evaluationProofFile = new File([evaluationProofBuffer], `eval-proof-${student.id}-${Date.now()}.png`, {
      type: 'image/png',
    });

    // Upload both files
    const [signatureUploadResult, evaluationProofUploadResult] = await Promise.all([
      utapi.uploadFiles(signatureFile),
      utapi.uploadFiles(evaluationProofFile)
    ]);
    
    if (!signatureUploadResult.data || !evaluationProofUploadResult.data) {
      return {
        success: false,
        message: `Failed to upload files: ${signatureUploadResult.error?.message || evaluationProofUploadResult.error?.message || "Unknown error"} 😔`,
      };
    }

    // If there's an existing evaluation, update it; otherwise, create a new one
    let evaluation;
    if (existingEvaluation && isConfirmedResubmission) {
      evaluation = await prisma.evaluation.update({
        where: {
          id: existingEvaluation.id,
        },
        data: {
          signatureURL: signatureUploadResult.data.url,
          evaluationProofURL: evaluationProofUploadResult.data.url,
          updatedAt: new Date(),
        },
      });
    } else {
      evaluation = await prisma.evaluation.create({
        data: {
          studentId: student.id,
          signatureURL: signatureUploadResult.data.url,
          evaluationProofURL: evaluationProofUploadResult.data.url,
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
