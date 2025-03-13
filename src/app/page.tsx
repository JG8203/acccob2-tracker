"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>ACCCOB2 Management System</CardTitle>
          <CardDescription>
            Select an option to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={() => router.push('/attendance')}
              className="w-full h-16 text-lg"
            >
              Attendance Tracker
            </Button>
            
            <Button 
              onClick={() => router.push('/evaluation')}
              className="w-full h-16 text-lg"
            >
              Evaluation Submission
            </Button>
            
            <Button 
              onClick={() => router.push('/evaluation-tracker')}
              className="w-full h-16 text-lg"
            >
              Evaluation Tracker
            </Button>
            
            <Button 
              onClick={() => router.push('/tracker')}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              Search Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
