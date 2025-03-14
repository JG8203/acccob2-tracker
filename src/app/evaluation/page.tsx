"use client";
import * as React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitEvaluation, getStudentOptions } from "@/actions/evaluation";
import { CheckCircle2, Eraser, Upload } from "lucide-react";
import type { ActionResponse } from "@/types/evaluation";
import Combobox from "@/components/ui/combobox";
import SignaturePad, { SignaturePadRef } from "@/components/ui/signaturepad";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialState: ActionResponse = { success: false, message: "" };

export default function EvaluationForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const signCanvasRef = useRef<SignaturePadRef | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [evaluationImage, setEvaluationImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  async function formAction(currentState: ActionResponse, formData: FormData) {
    try {
      if (!signCanvasRef.current || !evaluationImage) {
        return {
          success: false,
          message: evaluationImage 
            ? "Signature canvas not initialized" 
            : "Please upload an evaluation proof image",
        };
      }

      const currentDataURL = signCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      if (currentDataURL === initialCanvasState) {
        return {
          success: false,
          message: "No changes detected in the signature canvas.",
        };
      }

      formData.append("signature", currentDataURL);
      formData.append("evaluationProof", evaluationImage);
      return await submitEvaluation(currentState, formData);
    } catch (error) {
      console.error("Error in form action:", error);
      return {
        success: false,
        message: "An unexpected error occurred during form submission",
      };
    }
  }

  const [state, action, isPending] = useActionState(formAction, initialState);

  // Handle resubmission confirmation
  useEffect(() => {
    if (state?.message === "existing_evaluation" && state?.existingEvaluation) {
      setShowResubmitDialog(true);
    }
  }, [state]);

  const handleConfirmResubmission = async () => {
    try {
      if (!signCanvasRef.current || !evaluationImage || isResubmitting) return;
      
      setIsResubmitting(true); // Set loading state to true before submission
      
      const formData = new FormData();
      formData.append("name", student);
      formData.append("signature", signCanvasRef.current.getTrimmedCanvas().toDataURL("image/png"));
      formData.append("evaluationProof", evaluationImage);
      formData.append("confirmResubmission", "true");
      
      const result = await submitEvaluation(state, formData);
      if (result.success) {
        setShowResubmitDialog(false);
      }
    } catch (error) {
      console.error("Error during resubmission:", error);
    } finally {
      setIsResubmitting(false); // Reset loading state regardless of outcome
    }
  };

  const handleCancelResubmission = () => {
    setShowResubmitDialog(false);
  };

  const [studentOptions, setStudentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [student, setStudent] = useState<string>("");
  const [initialCanvasState, setInitialCanvasState] = useState<string | null>(
    null
  );

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const width = containerWidth;
        const height = width * 0.5;
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();

    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    if (
      signCanvasRef.current &&
      canvasSize.width > 0 &&
      canvasSize.height > 0
    ) {
      try {
        const initialDataURL = signCanvasRef.current
          .getTrimmedCanvas()
          .toDataURL("image/png");
        setInitialCanvasState(initialDataURL);
      } catch (error) {
        console.error("Error initializing canvas:", error);
      }
    }
  }, [canvasSize.width, canvasSize.height]);

  const handleClear = () => {
    if (signCanvasRef.current) {
      signCanvasRef.current.clear();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEvaluationImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const fetchStudentOptions = async () => {
      try {
        const options = await getStudentOptions();
        setStudentOptions(options);
      } catch (error) {
        console.error("Error fetching student options:", error);
      }
    };
    fetchStudentOptions();

    const storedStudent = localStorage.getItem("student");
    if (storedStudent) {
      try {
        setStudent(JSON.parse(storedStudent));
      } catch (error) {
        console.error("Error parsing stored student:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (student) {
      localStorage.setItem("student", JSON.stringify(student));
    }
  }, [student]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>ACCCOB2 Evaluation Submission</CardTitle>
          <CardDescription>
            Submit your evaluation proof here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Combobox
                name="name"
                options={studentOptions}
                searchPlaceholder="Enter any part of your name (e.g., 'Joshua' or 'Armaine')"
                aria-describedby="name-error"
                className={`w-full ${
                  state?.errors?.name ? "border-red-500" : ""
                }`}
                value={student}
                onChange={setStudent}
                placeholder="Select a student"
              />
              {state?.errors?.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Evaluation Proof</Label>
              <div className="flex flex-col items-center border-2 border-dashed rounded-md p-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {evaluationImage ? (
                  <div className="w-full">
                    <img 
                      src={evaluationImage} 
                      alt="Evaluation proof" 
                      className="max-h-64 mx-auto mb-2"
                    />
                    <Button 
                      type="button" 
                      onClick={handleUploadClick}
                      className="w-full"
                    >
                      Change Image <Upload className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleUploadClick}
                    className="w-full py-8"
                    variant="outline"
                  >
                    Click to upload evaluation proof
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
              {state?.errors?.evaluationProof && (
                <p className="text-sm text-red-500">
                  {state.errors.evaluationProof[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold">Sign here:</p>
              <div ref={containerRef} className="w-full border-2">
                {canvasSize.width > 0 && (
                  <SignaturePad
                    penColor="black"
                    canvasProps={{
                      width: canvasSize.width,
                      height: canvasSize.height,
                      className: "sigCanvas",
                    }}
                    ref={(ref) => {
                      signCanvasRef.current = ref;
                    }}
                  />
                )}
                <Button onClick={handleClear} className="m-2 w-3/12 h-1/12">
                  Clear <Eraser className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {state?.errors?.signature && (
                <p className="text-sm text-red-500">
                  {state.errors.signature[0]}
                </p>
              )}
            </div>

            {state?.message && state.message !== "existing_evaluation" && (
              <Alert variant={state.success ? "default" : "destructive"}>
                {state.success && <CheckCircle2 className="h-4 w-4" />}
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Resubmission Confirmation Dialog */}
      <Dialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluation Already Exists</DialogTitle>
            <DialogDescription>
              You have already submitted an evaluation. Do you want to update your previous submission?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelResubmission}
              disabled={isResubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmResubmission}
              disabled={isResubmitting}
            >
              {isResubmitting ? "Updating..." : "Update Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
