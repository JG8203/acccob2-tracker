"use client";
import * as React from "react";
import { useActionState } from "react";
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
import { CheckCircle2 } from "lucide-react";
import type { ActionResponse } from "@/types/attendance";
import Combobox from "@/components/ui/combobox";
import SignatureCanvas from "react-signature-canvas";

const initialState: ActionResponse = { success: false, message: "" };

export default function AttendanceForm() {
  const [state, action, isPending] = useActionState(submitAttendance, initialState);
  const [studentOptions, setStudentOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [student, setStudent] = React.useState<string>("");
  const [signURL, setSignURL] = React.useState<string>("");
  const [initialCanvasState, setInitialCanvasState] = React.useState<string | null>(null); // To store the initial canvas state
  const signCanvasRef = React.useRef<SignatureCanvas | null>(null);

  // Capture the initial state of the canvas when the component mounts
  React.useEffect(() => {
    if (signCanvasRef.current) {
      const initialDataURL = signCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
      setInitialCanvasState(initialDataURL); // Store the initial state
    }
  }, []);

  // Function to check if the canvas has been modified
  const isCanvasModified = (): boolean => {
    if (!signCanvasRef.current || !initialCanvasState) return false;
    const currentDataURL = signCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
    return currentDataURL !== initialCanvasState; // Compare current state with initial state
  };

  // Function to generate the signature image and update the form
  const handleGenerate = () => {
    if (signCanvasRef.current) {
      const trimmedDataURL = signCanvasRef.current.getTrimgedCanvas().toDataURL("image/png");
      setSignURL(trimmedDataURL);
    }
  };

  // Fetch student options and restore stored student on mount
  React.useEffect(() => {
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

  // Save selected student to localStorage
  React.useEffect(() => {
    if (student) localStorage.setItem("student", JSON.stringify(student));
  }, [student]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>ACCCOB2 Attendance Tracker</CardTitle>
          <CardDescription>Ang hirap mag-encode ng attendance sa Excel 🥲</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={(formData) => {
              if (isCanvasModified()) {
                formData.append("signature", signURL);
              }
              action(formData); 
            }}
            className="space-y-6"
            autoComplete="on"
          >
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
                className={`w-full ${state?.errors?.name ? "border-red-500" : ""}`}
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
              <SignatureCanvas
                penColor="green"
                canvasProps={{ width: 200, height: 150, className: "sigCanvas border-2" }}
                ref={(ref) => (signCanvasRef.current = ref)}
                onEnd={handleGenerate}
              />
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
          {signURL && <img src={signURL} alt="Signature" className="mt-4" />}
        </CardContent>
      </Card>
    </div>
  );
}