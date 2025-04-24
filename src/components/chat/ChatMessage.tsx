import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: {
    text: string;
    type: 'user' | 'ai';
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAI = message.type === 'ai';

  return (
    <div className={cn(
      "flex gap-3 p-4",
      isAI ? "bg-gray-50" : "bg-white"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={isAI ? "/ai-avatar.png" : "/user-avatar.png"} 
          alt={isAI ? "AI" : "User"} 
        />
        <AvatarFallback className={isAI ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}>
          {isAI ? "AI" : "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className={cn(
          "text-sm font-medium",
          isAI ? "text-purple-600" : "text-gray-600"
        )}>
          {isAI ? "ConsumerAI" : "You"}
        </div>
        <FormattedMessage 
          content={message.text} 
          isAI={isAI} 
        />
      </div>
    </div>
  );
};

export default ChatMessage;
