import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcription: string | null;
}

const TranscriptionModal: React.FC<TranscriptionModalProps> = ({ isOpen, onClose, transcription }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transcription Result</DialogTitle>
          <DialogDescription>
            Here's the transcription of your audio:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <p>{transcription}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranscriptionModal;

