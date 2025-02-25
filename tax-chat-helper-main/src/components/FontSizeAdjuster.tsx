
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function FontSizeAdjuster() {
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const adjustFontSize = (amount: number) => {
    setFontSize((prev) => Math.min(Math.max(prev + amount, 12), 24));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => adjustFontSize(-1)}
        className="rounded-full"
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease font size</span>
      </Button>
      <span className="text-sm font-medium">Font Size</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => adjustFontSize(1)}
        className="rounded-full"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase font size</span>
      </Button>
    </div>
  );
}
