"use client";

import { useEffect, useState } from "react";
import { getAllEvaluations } from "@/actions/evaluation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Eye, ArrowLeft } from "lucide-react";

interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  signatureURL: string;
  evaluationProofURL: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function EvaluationTracker() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchEvaluations() {
      try {
        setLoading(true);
        const result = await getAllEvaluations();
        
        if (result.success) {
          setEvaluations(result.evaluations);
        } else {
          setError(result.message || "Failed to fetch evaluations");
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchEvaluations();
  }, []);

  const handleViewProof = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evaluation Tracker</CardTitle>
            <CardDescription>
              View all submitted evaluations
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading evaluations...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-8">No evaluations found</div>
          ) : (
            <Table>
              <TableCaption>List of all submitted evaluations</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() => handleViewProof(evaluation.evaluationProofURL)}
                    >
                      {evaluation.studentName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(evaluation.createdAt), "PPP")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(evaluation.updatedAt), "PPP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProof(evaluation.evaluationProofURL)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Proof
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evaluation Proof</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Evaluation Proof" 
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
