import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";

interface ChatMessageProps {
  message: {
    text: string;
    type: 'user' | 'ai' | 'email';
    emailMetadata?: {
      subject: string;
      body: string;
      sender?: string;
      recipients?: string[];
    };
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';
  const isEmail = message.type === 'email';

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4 rounded-lg",
        isUser ? "bg-primary/10" : "bg-white"
      )}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarImage src="/user-avatar.png" />
            <AvatarFallback>U</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/ai-avatar.png" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        )}
      </Avatar>

      <div className="flex-1 space-y-2">
        {isEmail && message.emailMetadata ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span>Email Analysis</span>
            </div>
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="font-medium">Subject: {message.emailMetadata.subject}</div>
              <div className="mt-2 text-sm text-gray-600">{message.emailMetadata.body}</div>
            </div>
          </div>
        ) : (
          <FormattedMessage content={message.text} isAI={!isUser} />
        )}
      </div>
    </div>
  );
}
