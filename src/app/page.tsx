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
import Image from "next/image";

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function AttendanceForm() {
  const [state, action, isPending] = useActionState(
    submitAttendance,
    initialState
  );
  const [studentOptions, setStudentOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [student, setStudent] = React.useState<string>("");

  React.useEffect(() => {
    const fetchStudentOptions = async () => {
      const options = await getStudentOptions();
      setStudentOptions(options);
    };

    fetchStudentOptions();

    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      try {
        const parsedStudent = JSON.parse(storedStudent);
        setStudent(parsedStudent);
      } catch (error) {
        console.error('Error parsing stored student:', error);
      }
    }
  }, []);

  React.useEffect(() => {
    if (student) {
      localStorage.setItem('student', JSON.stringify(student));
    }
  }, [student]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 max-h-fit overscroll-y-contain">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>ACCCOB2 Attendance Tracker</CardTitle>
          <CardDescription>
            Ang hirap mag-encode ng attendance sa Excel 🥲
          </CardDescription>
          {/* <Image
            src={
              "https://media1.tenor.com/m/ce1bT7v09f4AAAAd/white-dog-shaking.gif"
            }
            width={500}
            height={500}
            alt="dog gif"
          /> */}
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6" autoComplete="on">
            <div className="space-y-4">
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
