import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, EyeIcon } from 'lucide-react';
import { TranscriptionJob } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TranscriptionJobsTableProps {
  jobs: TranscriptionJob[];
  onStartTranscription: (job: TranscriptionJob) => void;
  onViewTranscription: (job: TranscriptionJob) => void;
}

const TranscriptionJobsTable: React.FC<TranscriptionJobsTableProps> = ({
  jobs,
  onStartTranscription,
  onViewTranscription
}) => {
  return (
    <div className="mt-8 w-full max-w-4xl">
      <h2 className="text-xl font-semibold mb-4">Transcription Jobs</h2>
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>AI</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      job.status === "complete"
                        ? "default" // Use a valid variant like "default"
                        : job.status === "error"
                          ? "destructive"
                          : job.status === "processing"
                            ? "secondary"
                            : "outline" // Provide a fallback that is valid
                    }
                  >
                    {job.status}
                  </Badge>

                </TableCell>
                <TableCell>
                  <Progress value={job.progress} className="w-[60%]" />
                </TableCell>
                <TableCell>{job.category}</TableCell>
                <TableCell>{job.date.toLocaleString()}</TableCell>
                <TableCell>{job.aiProvider}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStartTranscription(job)}
                          disabled={job.status !== "pending"}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate Transcription</p>
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewTranscription(job)}
                      disabled={job.status !== "complete"}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
};

export default TranscriptionJobsTable;

