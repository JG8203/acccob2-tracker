'use client'

import * as React from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createEvent } from "@/actions/create-event"
import { CheckCircle2 } from "lucide-react"
import type { ActionResponse } from "@/types/event"

const initialState: ActionResponse = {
  success: false,
  message: '',
}

export default function AdminPage() {
  const [state, action, isPending] = useActionState(createEvent, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>ACCCOB2 Attendance Tracker</CardTitle>
          <CardDescription>Ang hirap mag-encode ng attendance sa Excel 🥲</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6" autoComplete="on">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input 
                  id="code" 
                  name="code" 
                  placeholder="Specify your own code nbr."
                  required
                  aria-describedby="code-error"
                  className={state?.errors?.code ? 'border-red-500' : ''}
                />
                {state?.errors?.code && (
                  <p id="code-error" className="text-sm text-red-500">
                    {state.errors.code[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Label</Label>
                <Input 
                  id="label" 
                  name="label" 
                  placeholder="Enter event label or notes here."
                  required
                  aria-describedby="name-error"
                  className={state?.errors?.label ? 'border-red-500' : ''}
                />
                {state?.errors?.label && (
                  <p id="name-error" className="text-sm text-red-500">
                    {state.errors.label[0]}
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Creating event...' : 'Create Event'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}