import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import AudioRecorder from "@/components/AudioRecorder";
import TranscriptionJobsTable from "./components/TranscriptionJobsTable";
import TranscriptionModal from "./components/TranscriptionModal";
import Header from "@/components/Header";
import { TranscriptionJob } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import APIService from "@/services/APIService";

function App() {
  const [transcriptionJobs, setTranscriptionJobs] = useState<TranscriptionJob[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [selectedAI, setSelectedAI] = useState<'openai' | 'anthropic'>('openai');

  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);
    APIService.setUserId(storedUserId);
  }, []);

  const addTranscriptionJob = (job: TranscriptionJob) => {
    setTranscriptionJobs((prevJobs) => [...prevJobs, job]);
  };

  const updateTranscriptionJobStatus = (id: string, status: TranscriptionJob['status'], progress?: number) => {
    setTranscriptionJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === id ? { ...job, status, progress: progress ?? job.progress } : job))
    );
  };

  const handleStartTranscription = async (job: TranscriptionJob) => {
    if (job.audioBlob) {
      updateTranscriptionJobStatus(job.id, "processing", 0);
      try {
        const result = await APIService.transcribeAudio(job, (progress) => {
          updateTranscriptionJobStatus(job.id, "processing", progress);
        });
        if (result.data) {
          updateTranscriptionJobStatus(job.id, "complete", 100);
          setTranscriptionJobs((prevJobs) =>
            prevJobs.map((j) => (j.id === job.id ? { ...j, category:result.data.category, transcription: result.data.transcription as string } : j))
          );
        } else {
          updateTranscriptionJobStatus(job.id, "error");
          toast({
            title: "Transcription Failed",
            description: result.error || "An unknown error occurred",
            variant: "destructive",
          });
        }
      } catch (error) {
        updateTranscriptionJobStatus(job.id, "error");
        toast({
          title: "Transcription Error",
          description: "An error occurred during transcription",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewTranscription = (job: TranscriptionJob) => {
    if (job.transcription) {
      setCurrentTranscription(job.transcription);
      setIsModalOpen(true);
    }
  };

  const handleAIChange = (ai: 'openai' | 'anthropic') => {
    setSelectedAI(ai);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header userId={userId} selectedAI={selectedAI} onAIChange={handleAIChange} />
      <main className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="mb-4">
          <AudioRecorder addTranscriptionJob={addTranscriptionJob} selectedAI={selectedAI} />
        </div>
        <div className="flex-grow overflow-auto">
          <TranscriptionJobsTable 
            jobs={transcriptionJobs} 
            onStartTranscription={handleStartTranscription}
            onViewTranscription={handleViewTranscription}
          />
        </div>
        <TranscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transcription={currentTranscription}
        />
      </main>
      <Toaster />
    </div>
  );
}

export default App;

