import { Button } from "./button";

interface ChatBubbleUserProps {
  content: string;
}

interface ChatBubbleAIProps {
  content: string;
  citation?: string;
  actions?: string[];
}

export function ChatBubbleUser({ content }: ChatBubbleUserProps) {
  return (
    <div className="bg-primary p-3 rounded-lg chat-bubble-user shadow-sm text-white max-w-[80%]">
      <p className="text-sm">{content}</p>
    </div>
  );
}

export function ChatBubbleAI({ content, citation, actions }: ChatBubbleAIProps) {
  return (
    <div className="bg-white p-3 rounded-lg chat-bubble-ai shadow-sm max-w-[80%]">
      <p className="text-sm">{content}</p>
      
      {citation && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-primary">
          <p className="font-semibold">Legal Reference:</p>
          <p>{citation}</p>
        </div>
      )}
      
      {actions && actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200"
            >
              {action}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
