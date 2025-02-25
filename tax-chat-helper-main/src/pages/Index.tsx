
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeAdjuster } from "@/components/FontSizeAdjuster";
import { VoiceInput } from "@/components/VoiceInput";

const Index = () => {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <FontSizeAdjuster />
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-card/80 border shadow-lg animate-fade-in">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome to TaxHelper AI
              </h1>
              <p className="text-muted-foreground">
                Let's make taxes simple together
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                />
                <VoiceInput onResult={setName} />
              </div>
              <Button type="submit" className="w-full" disabled={!name.trim()}>
                Get Started
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center animate-fade-in">
            <h2 className="text-2xl font-semibold">
              Hello, {name}! 👋
            </h2>
            <p className="text-muted-foreground">
              I'm your AI Tax Assistant, and I'm here to help you navigate your
              taxes with ease. I'll guide you through the process step by step,
              helping you understand your tax situation and find potential savings.
            </p>
            <Button className="w-full" onClick={() => window.location.href = "/income"}>
              Continue to Income Details
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Index;
