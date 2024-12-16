import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { TranscriptionJob } from "@/lib/types";
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

interface AudioRecorderProps {
  addTranscriptionJob: (job: TranscriptionJob) => void;
  selectedAI: 'openai' | 'anthropic';
}

const MAX_RECORDING_TIME = 10; // seconds

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  addTranscriptionJob,
  selectedAI,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const id = uuidv4();
        addTranscriptionJob({
          id,
          name: `Recording ${id.slice(0, 8)}`,
          status: "pending",
          category: "Audio",
          date: new Date(),
          progress: 0,
          audioBlob: blob,
          aiProvider: selectedAI,
        });
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
      {isRecording && (
        <div className="w-full max-w-xs">
          <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="w-full" />
          <p className="text-center mt-2">{recordingTime}s / {MAX_RECORDING_TIME}s</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;

