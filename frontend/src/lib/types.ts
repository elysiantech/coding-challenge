export interface TranscriptionJob {
    id: string;
    name: string;
    status: "pending" | "processing" | "complete" | "error";
    category: string;
    date: Date;
    progress: number;
    audioBlob: Blob;
    transcription?: string;
    aiProvider: "openai" | "anthropic";
  }
  
  