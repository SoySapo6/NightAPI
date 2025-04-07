import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApiEndpointProps {
  path: string;
  fullUrl: string;
}

const ApiEndpoint: FC<ApiEndpointProps> = ({ path, fullUrl }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-cyan-500 font-mono text-sm">{path}</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => copyToClipboard(fullUrl)}
        className="text-muted-foreground hover:text-cyan-500"
      >
        <Copy size={16} />
      </Button>
    </div>
  );
};

export default ApiEndpoint;
