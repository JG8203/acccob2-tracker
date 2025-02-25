import { getAttendance } from "@/actions/tracker";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import CopyToClipboardButton from "@/components/ui/copytoclipboard";
import Image from "next/image";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId: string | string[] }>;
}) {
  const params = await searchParams;

  const query = Array.isArray(params.eventId)
    ? params.eventId[0]
    : params.eventId || "";

  const results = await getAttendance(query);
  const clipboardData = results.map((student) => student.attended).join("\n");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Attendance Results</h1>
      {results.length > 0 ? (
        <Table className="border rounded-lg shadow-sm">
          <TableCaption className="text-sm text-gray-500 mt-2">
            List of students and their attendance status.
          </TableCaption>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Attended</TableHead>
              <TableHead className="font-semibold text-gray-700">Signature</TableHead>
              <TableHead className="font-semibold text-gray-700">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((student) => (
              <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-900">
                  {student.name}
                </TableCell>
                <TableCell>
                  {student.attended ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  {student.attended && student.signatureURL ? (
                    <div className="relative w-32 h-16 border rounded">
                      <Image 
                        src={student.signatureURL} 
                        alt={`${student.name}'s signature`}
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400">No signature</span>
                  )}
                </TableCell>
                <TableCell>
                  {student.attended && student.timestamp ? (
                    <span className="text-sm text-gray-600">
                      {new Date(student.timestamp).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-600">No attendance records found.</p>
      )}
      <CopyToClipboardButton text={clipboardData} />
    </div>
  );
}
