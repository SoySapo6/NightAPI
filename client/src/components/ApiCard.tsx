import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CodeBlock from './CodeBlock';
import ApiEndpoint from './ApiEndpoint';

export interface ApiEndpointInfo {
  path: string;
  fullUrl: string;
}

export interface ApiCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  endpoints: ApiEndpointInfo[];
  exampleResponse: string;
}

const ApiCard: FC<ApiCardProps> = ({ 
  icon, 
  title, 
  description, 
  endpoints, 
  exampleResponse 
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <Card className="api-endpoint transition-all duration-300 bg-card/70 backdrop-blur-sm border border-border overflow-hidden shadow-lg hover:border-purple-600 h-full flex flex-col">
      <CardContent className="p-5 flex-grow">
        <div className="flex items-center mb-4">
          <div className="text-purple-600 text-xl mr-3">{icon}</div>
          <h3 className="text-xl font-heading font-semibold">{title}</h3>
        </div>
        
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-md font-semibold mb-2">Endpoints:</h4>
          <ul className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <li key={index}>
                <ApiEndpoint path={endpoint.path} fullUrl={endpoint.fullUrl} />
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="bg-card/70 p-5 border-t border-border block">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Example Response:</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => copyToClipboard(exampleResponse)}
            className="text-muted-foreground hover:text-cyan-500"
          >
            <Copy size={16} />
          </Button>
        </div>
        <CodeBlock code={exampleResponse} language="json" />
      </CardFooter>
    </Card>
  );
};

export default ApiCard;
