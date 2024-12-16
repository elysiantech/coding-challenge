
import { TranscriptionJob } from "@/lib/types";

interface APIResponse<T> {
  data?: T;
  error?: string;
  version?: string;
}

class APIService {
  private baseUrl: string = "http://localhost:8000";
  private currentVersion: string = "1.0.0";
  private userId: string | null = null;

  setUserId(id: string) {
    this.userId = id;
  }

  // Generic request handler
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: FormData | object
  ): Promise<APIResponse<T>> {
    try {
      const headers: HeadersInit = {
        "X-User-ID": this.userId || "",
        "X-API-Version": this.currentVersion,
      };

      // Add Content-Type header if body is a plain object (not FormData)
      if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : JSON.stringify(body),
      };

      // Simulate API call
      console.log(`Making ${method} request to ${endpoint} with user ID: ${this.userId}`);
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        requestOptions
      );
      const data = await response.json();
      return { data: data };
    } catch (error) {
      return { error: `Request failed: ${error}` };
    }
  }

  async transcribeAudio(
    job: TranscriptionJob,
    onProgress: (progress: number) => void
  ): Promise<APIResponse<TranscriptionJob>> {
    const { id, audioBlob, aiProvider } = job;
  
    try {
      // Step 1: Start the transcription task
      const formData = new FormData();
      formData.append("id", id);
      formData.append("audio", audioBlob);
      formData.append("aiProvider", aiProvider);
  
      const startResponse = await this.makeRequest<{ taskId: string }>("/transcribe", "POST", formData);
  
      if (startResponse.error || !startResponse.data?.taskId) {
        return { error: startResponse.error || "Failed to initiate transcription." };
      }
  
      const { taskId } = startResponse.data;
  
      // Step 2: Poll for task completion
      return new Promise<APIResponse<TranscriptionJob>>((resolve) => {
        let interval: NodeJS.Timeout;
  
        const pollStatus = async () => {
          const statusResponse = await this.makeRequest<{
            status: "pending" | "processing" | "complete" | "error";
            progress: number;
            transcription?: string;
          }>(`/transcribe/status/${taskId}`, "GET");
  
          if (statusResponse.error) {
            clearInterval(interval);
            resolve({ error: statusResponse.error });
            return;
          }
  
          const { status, progress, transcription } = statusResponse.data || {};
  
          // Update progress and job status
          job.status = status;
          job.progress = progress || 0;
          onProgress(job.progress);
  
          if (status === "complete") {
            clearInterval(interval);
            job.transcription = transcription || "";
            job.progress = 100; // Ensure progress shows 100% on completion
            resolve({ data: job });
          } else if (status === "error") {
            clearInterval(interval);
            resolve({ error: "Transcription task failed." });
          }
        };
  
        // Poll every 2 seconds
        interval = setInterval(pollStatus, 2000);
        pollStatus(); // Trigger immediately to minimize initial delay
      });
    } catch (error) {
      return { error: `Unexpected error: ${error}` };
    }
  }
}

export default new APIService();

