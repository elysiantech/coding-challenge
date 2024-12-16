import React from 'react';
import { UserCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check } from 'lucide-react';

interface HeaderProps {
  userId: string;
  selectedAI: 'openai' | 'anthropic';
  onAIChange: (ai: 'openai' | 'anthropic') => void;
}

const Header: React.FC<HeaderProps> = ({ userId, selectedAI, onAIChange }) => {
  return (
    <header className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audio Transcription Demo</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <UserCircle className="h-8 w-8 text-primary" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onAIChange('openai')}>
                    {selectedAI === 'openai' && <Check className="mr-2 h-4 w-4" />}
                    OpenAI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAIChange('anthropic')}>
                    {selectedAI === 'anthropic' && <Check className="mr-2 h-4 w-4" />}
                    anthropic
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>User ID: {userId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;

