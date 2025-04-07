import { FC, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: FC<CodeBlockProps> = ({ code, language }) => {
  const preRef = useRef<HTMLPreElement>(null);
  
  // Format JSON for display
  const formatJson = (jsonString: string) => {
    try {
      const json = JSON.parse(jsonString);
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  // Add syntax highlighting for JSON
  const highlightJson = (jsonString: string) => {
    return jsonString
      .replace(/"([^"]+)":/g, '<span class="text-blue-300">"$1"</span>:')
      .replace(/"([^"]+)"/g, '<span class="text-cyan-300">"$1"</span>')
      .replace(/\b(true|false)\b/g, '<span class="text-pink-400">$1</span>')
      .replace(/\b(null)\b/g, '<span class="text-red-400">$1</span>')
      .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-purple-400">$1</span>');
  };

  const formattedCode = language === 'json' ? formatJson(code) : code;
  
  return (
    <pre 
      ref={preRef}
      className="font-mono text-xs overflow-x-auto p-3 bg-background rounded-lg"
      dangerouslySetInnerHTML={{
        __html: language === 'json' ? highlightJson(formattedCode) : formattedCode
      }}
    />
  );
};

export default CodeBlock;
