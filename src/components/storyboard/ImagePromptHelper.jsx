import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvokeLLM } from "@/api/integrations";
import { Lightbulb, Wand2, Loader2 } from "lucide-react";

export default function ImagePromptHelper({ originalPrompt, onPromptUpdate, characterPersona }) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  const enhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      const response = await InvokeLLM({
        prompt: `
          You are a professional image prompt engineer. Take this basic image description and make it much more specific and visual for AI image generation.

          Character consistency reference: ${characterPersona || "No specific characters"}

          Original prompt: ${originalPrompt}

          Make it more specific by adding:
          1. Exact character positions and actions
          2. Specific lighting and atmosphere
          3. Camera angle/perspective details
          4. Key props and background elements
          5. Facial expressions and body language

          Return only the enhanced prompt, nothing else.
        `
      });

      setEnhancedPrompt(response);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
    }
    setIsEnhancing(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Image Prompt Helper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Original Prompt:</label>
          <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{originalPrompt}</p>
        </div>
        
        <Button 
          onClick={enhancePrompt} 
          disabled={isEnhancing}
          className="w-full"
        >
          {isEnhancing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enhancing...</>
          ) : (
            <><Wand2 className="w-4 h-4 mr-2" /> Enhance Prompt</>
          )}
        </Button>

        {enhancedPrompt && (
          <div>
            <label className="text-sm font-medium">Enhanced Prompt:</label>
            <Textarea
              value={enhancedPrompt}
              onChange={(e) => setEnhancedPrompt(e.target.value)}
              className="mt-2"
              rows={4}
            />
            <Button 
              onClick={() => onPromptUpdate(enhancedPrompt)}
              className="mt-2 w-full"
            >
              Use Enhanced Prompt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}