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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitAttendance, getStudentOptions } from "@/actions/attendance";
import { CheckCircle2, Eraser } from "lucide-react";
import type { ActionResponse } from "@/types/attendance";
import Combobox from "@/components/ui/combobox";
import SignatureCanvas from "react-signature-canvas";

const initialState: ActionResponse = { success: false, message: "" };

export default function AttendanceForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const signCanvasRef = useRef<SignatureCanvas | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  async function formAction(currentState: ActionResponse, formData: FormData) {
    if (signCanvasRef.current) {
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
      return await submitAttendance(currentState, formData);
    }
    return { success: false, message: "Signature canvas not initialized" };
  }

  const [state, action, isPending] = useActionState(formAction, initialState);

  const [studentOptions, setStudentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [student, setStudent] = useState<string>("");
  const [initialCanvasState, setInitialCanvasState] = useState<string | null>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const width = containerWidth;
        const height = width * 0.5;
        setCanvasSize({ width, height });
        
        if (signCanvasRef.current) {
          signCanvasRef.current.clear();
          
          if (initialCanvasState && initialCanvasState !== "") {
            setTimeout(() => {
              const newInitialDataURL = signCanvasRef.current
                ?.getTrimmedCanvas()
                .toDataURL("image/png");
              setInitialCanvasState(newInitialDataURL || null);
            }, 100);
          }
        }
      }
    };

    updateCanvasSize();
    
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [initialCanvasState]);

  useEffect(() => {
    if (signCanvasRef.current) {
      const initialDataURL = signCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      setInitialCanvasState(initialDataURL);
    }
  }, [canvasSize.width, canvasSize.height]);

  const handleClear = () => {
    if (signCanvasRef.current) {
      signCanvasRef.current.clear();
    }
  }

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
          <CardTitle>ACCCOB2 Attendance Tracker</CardTitle>
          <CardDescription>
            Ang hirap mag-encode ng attendance sa Excel 🥲
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="See yellow pad for code."
                required
                aria-describedby="code-error"
                className={state?.errors?.code ? "border-red-500" : ""}
              />
              {state?.errors?.code && (
                <p id="code-error" className="text-sm text-red-500">
                  {state.errors.code[0]}
                </p>
              )}
            </div>

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
              <p className="text-2xl font-bold">Sign here:</p>
              <p className="text-sm text-gray-500">someone mistakenly pressed the wrong person last time so i added this 🙁</p>
              <div ref={containerRef} className="w-full border-2">
                {canvasSize.width > 0 && (
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{
                      width: canvasSize.width,
                      height: canvasSize.height,
                      className: "sigCanvas"
                    }}
                    ref={signCanvasRef}
                  />
                )}
                <Button onClick={handleClear} className="m-2 w-3/12 h-1/12" >Clear <Eraser/> </Button>
              </div>
            </div>

            {state?.message && (
              <Alert variant={state.success ? "default" : "destructive"}>
                {state.success && <CheckCircle2 className="h-4 w-4" />}
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}