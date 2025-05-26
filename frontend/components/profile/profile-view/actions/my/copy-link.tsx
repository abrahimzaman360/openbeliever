import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InteractiveCopyButtonProps {
  textToCopy: string;
}

export function InteractiveCopyButton({
  textToCopy,
}: InteractiveCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="px-2 relative"
          onClick={handleCopy}>
          <motion.div initial={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
            {isCopied ? (
              <Check className="h-6 w-6 text-blue-600" />
            ) : (
              <Copy className="h-6 w-6 text-gray-600" />
            )}
          </motion.div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy Profile Link</TooltipContent>
    </Tooltip>
  );
}
