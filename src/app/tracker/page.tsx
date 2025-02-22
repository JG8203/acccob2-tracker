// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableFooter,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import Form from "next/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SearchAttendance() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Search Attendance</CardTitle>
          <CardDescription>Look for attendance records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form action="/search">
            <Input
              required
              name="eventId"
              placeholder="Enter event ID to look for."
            />
            <div className="pt-5">
              <Button type="submit" className="w-full">
                Search
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
