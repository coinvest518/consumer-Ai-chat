import { cn } from "@/lib/utils";

interface FormattedMessageProps {
  content: string;
  isAI?: boolean;
}

export const FormattedMessage = ({ content, isAI = false }: FormattedMessageProps) => {
  // Convert markdown-style bold to HTML spans with bold class
  const formatContent = (text: string) => {
    // Split by markdown bold markers
    const parts = text.split(/\*\*(.*?)\*\*/g);
    
    return parts.map((part, index) => {
      // Every odd index is bold text
      if (index % 2 === 1) {
        return <span key={index} className="font-semibold text-purple-600">{part}</span>;
      }
      return part;
    });
  };
  
  return (
    <div className={cn(
      "text-base leading-relaxed whitespace-pre-wrap",
      isAI ? "text-gray-700" : "text-gray-600"
    )}>
      {formatContent(content)}
    </div>
  );
}; 