
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, BookOpenText, RefreshCw, Sparkles, Pencil, Check, X, Image, Download, Share2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { runwareImageGeneration } from "@/api/functions"; // Updated import
import { InvokeLLM } from "@/api/integrations";
import { Story } from "@/api/entities";
import { VISUAL_STYLES, COLOR_THEMES } from "../creation/StyleSelector";
import { useAuth } from "@/contexts/AuthContext";
import { buildMasterPrompt, buildNegativePrompt, enhanceSceneForCharacter } from "@/utils/masterPrompting";
import { toast } from "sonner";

export default function StoryboardDisplay({ storyboard, isLoading, onStoryboardUpdate, isPublicView = false }) {
  const { isAuthenticated, token } = useAuth();
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [regeneratingText, setRegeneratingText] = useState(null);
  const [editingTextIndex, setEditingTextIndex] = useState(null);
  const [editedTextContent, setEditedTextContent] = useState('');
  const [editingTitleIndex, setEditingTitleIndex] = useState(null);
  const [editedTitleContent, setEditedTitleContent] = useState('');
  const [editingPromptIndex, setEditingPromptIndex] = useState(null);
  const [editedPromptContent, setEditedPromptContent] = useState('');
  const [showSharePopover, setShowSharePopover] = useState(false);

  // Share storyboard handler
  const handleShareStoryboard = () => {
    // Use clean slug-based URL if available, otherwise fallback to ID
    const shareUrl = storyboard.slug 
      ? `${window.location.origin}/${storyboard.slug}`
      : `${window.location.origin}/viewstoryboard?id=${storyboard.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
    setShowSharePopover(false);
  };

  // Character consistency helper
  const extractCharacterReference = (characterPersona) => {
    if (!characterPersona) return "";
    
    const lines = characterPersona.split('\n').filter(line => line.trim());
    let reference = "";
    
    for (const line of lines) {
      if (line.includes('**') && (line.toLowerCase().includes('character') || line.includes(':'))) {
        const characterInfo = line.replace(/\*\*/g, '').trim();
        if (reference.length + characterInfo.length < 120) {
          reference += characterInfo + ". ";
        }
      }
    }
    
    return reference.trim().substring(0, 150);
  };

  // Enhanced master prompt builder for regeneration with character focus
  const buildOptimizedPrompt = (scenePrompt, characterRef, visualStyle, colorTheme) => {
    // Ensure safe inputs
    const safeScenePrompt = String(scenePrompt || "").trim();
    const safeCharacterRef = String(characterRef || "").trim();
    const safeVisualStyle = String(visualStyle || "realistic").trim();
    const safeColorTheme = String(colorTheme || "modern").trim();

    if (!safeScenePrompt) {
      return buildMasterPrompt({
        basePrompt: "detailed professional scene",
        type: "storyboard",
        visualStyle: safeVisualStyle,
        colorTheme: safeColorTheme
      });
    }

    // Check if storyboard has character information for character-focused prompting
    const hasCharacter = safeCharacterRef && safeCharacterRef.length > 0;
    const characterFromPersona = storyboard?.character_persona;

    // If we have character information, use character-focused prompting
    if (hasCharacter && characterFromPersona) {
      console.log("Using character-focused regeneration prompting");
      
      // Try to parse character from persona for enhanced prompting
      let characterObj = null;
      try {
        // Extract character name and details from character_persona
        const personaLines = characterFromPersona.split('\n').filter(line => line.trim());
        let characterName = "";
        let characterAppearance = "";
        
        for (const line of personaLines) {
          if (line.toLowerCase().includes('character:') || line.includes('**')) {
            const cleaned = line.replace(/\*\*/g, '').replace(/character:/i, '').trim();
            if (!characterName && cleaned.length > 0) {
              characterName = cleaned.split(',')[0] || cleaned.split('.')[0];
            }
            if (cleaned.includes('appearance') || cleaned.includes('hair') || cleaned.includes('eyes')) {
              characterAppearance += cleaned + ". ";
            }
          }
        }
        
        if (characterName) {
          characterObj = {
            name: characterName.trim(),
            appearance: characterAppearance.trim(),
            description: characterFromPersona.substring(0, 200)
          };
        }
      } catch (error) {
        console.log("Could not parse character from persona:", error);
      }

      // Use character scene enhancement if we have character data
      if (characterObj) {
        return enhanceSceneForCharacter(
          safeScenePrompt,
          characterObj,
          {
            visualStyle: safeVisualStyle,
            colorTheme: safeColorTheme,
            lighting: {
              warm: "golden",
              cool: "natural", 
              vibrant: "dramatic",
              muted: "soft",
              monochrome: "dramatic",
              modern: "natural"
            }[safeColorTheme] || "natural"
          }
        );
      }
    }

    // Fallback to standard master prompting
    const lightingMap = {
      warm: "golden",
      cool: "natural", 
      vibrant: "dramatic",
      muted: "soft",
      monochrome: "dramatic",
      modern: "natural"
    };
    
    const lighting = lightingMap[safeColorTheme] || "natural";
    const mood = safeScenePrompt.toLowerCase().includes('action') ? "dramatic" : "professional";

    // Use standard master prompting system for regeneration
    return buildMasterPrompt({
      basePrompt: safeScenePrompt,
      type: "storyboard",
      visualStyle: safeVisualStyle,
      colorTheme: safeColorTheme,
      characterRef: safeCharacterRef,
      mood: mood,
      cameraAngle: "medium shot",
      lighting: lighting,
      priority: "quality",
      forceCharacterInclusion: hasCharacter
    });
  };

  // These functions are no longer used for image generation but kept for completeness
  const getStylePromptModifier = (visualStyle) => {
    const styleModifiers = {
      photorealistic: "photorealistic, professional photography",
      illustrated: "digital illustration, artistic style",
      comic_book: "comic book style, bold lines",
      watercolor: "watercolor painting, soft textures",
      sketch: "pencil sketch, hand-drawn",
      "3d_rendered": "3D rendered, computer graphics",
      minimalist: "minimalist design, clean lines",
      cinematic: "cinematic still, movie-like quality"
    };
    return styleModifiers[visualStyle] || styleModifiers.photorealistic;
  };

  const getMoodPromptModifier = (mood) => {
    const moodModifiers = {
      professional: "professional atmosphere, clean",
      playful: "playful and fun, bright colors",
      dramatic: "dramatic lighting, intense atmosphere",
      serene: "calm and peaceful, soft lighting",
      energetic: "dynamic and energetic, vibrant",
      sophisticated: "elegant and refined, luxury aesthetic",
      rustic: "natural and rustic, organic textures",
      futuristic: "futuristic and modern, sleek design"
    };
    return moodModifiers[mood] || moodModifiers.professional;
  };

  const regenerateImage = async (partIndex, promptOverride = null) => {
    if (!storyboard || !storyboard.storyboard_parts[partIndex]) return;

    setRegeneratingIndex(partIndex);
    setEditingPromptIndex(null);
    setEditedPromptContent('');
    
    try {
      const part = storyboard.storyboard_parts[partIndex];
      const imagePrompt = promptOverride ?? part.image_prompt;

      // Extract character reference for consistency
      const characterRef = extractCharacterReference(storyboard.character_persona);
      
      // Build optimized prompt
      const optimizedPrompt = buildOptimizedPrompt(
        imagePrompt,
        characterRef,
        storyboard.visual_style || "realistic",
        storyboard.color_theme || "modern"
      );

      console.log(`Regenerating image with prompt: ${optimizedPrompt}`); // Debug logging

      // Generate negative prompt for better results, enhanced for character consistency
      const hasCharacterInStoryboard = Boolean(characterRef || storyboard?.character_persona);
      const negativePrompt = buildNegativePrompt("storyboard", hasCharacterInStoryboard);

      // Changed from GenerateImage to runwareImageGeneration with master prompting
      const imageResult = await runwareImageGeneration({ 
        prompt: optimizedPrompt,
        negativePrompt: negativePrompt,
        options: {
          negativePrompt: negativePrompt
        }
      });

      if (imageResult.data && imageResult.data.url) {
        // Update the storyboard
        const updatedParts = [...storyboard.storyboard_parts];
        if (promptOverride) {
          updatedParts[partIndex] = { ...part, image_prompt: promptOverride, image_url: imageResult.data.url };
        } else {
          updatedParts[partIndex] = { ...part, image_url: imageResult.data.url };
        }

        const updatedStoryboard = { ...storyboard, storyboard_parts: updatedParts };

        // Update in database only if not a local storyboard
        if (!storyboard.id.startsWith('local_')) {
          try {
            await Story.update(storyboard.id, { storyboard_parts: updatedParts });
          } catch (updateError) {
            console.log("Could not update storyboard in database:", updateError.message);
          }
        }

        // Update parent component
        if (onStoryboardUpdate) {
          onStoryboardUpdate(updatedStoryboard);
        }
      } else {
        throw new Error('Failed to generate image with Runware API: No URL in response.');
      }
    } catch (error) {
      console.error("Error regenerating image:", error);
    }
    setRegeneratingIndex(null);
  };

  const regenerateText = async (partIndex) => {
    if (!storyboard || !storyboard.storyboard_parts[partIndex]) return;

    setRegeneratingText(partIndex);
    try {
      const allParts = storyboard.storyboard_parts;
      const contextBefore = allParts.slice(Math.max(0, partIndex - 1), partIndex).map(p => p.text).join(' ');
      const contextAfter = allParts.slice(partIndex + 1, Math.min(allParts.length, partIndex + 2)).map(p => p.text).join(' ');

      const llmResponse = await InvokeLLM({
        prompt: `
          Based on the original story context, rewrite this section to be more engaging and vivid while maintaining the same core information and story flow. The new text should be short and concise (e.g., 2-3 sentences).

          Context before: ${contextBefore}
          Current section: ${allParts[partIndex].text}
          Context after: ${contextAfter}

          Original full story for reference: ${storyboard.original_text}

          Return a rewritten version that is short and compelling, and also create a new short, catchy one-liner title for this rewritten section.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            rewritten_text: { type: "string" },
            section_title: { type: "string", description: "A short, catchy one-liner that summarizes this section" }
          },
          required: ["rewritten_text", "section_title"]
        }
      });

      // Update the storyboard part
      const updatedParts = [...storyboard.storyboard_parts];
      updatedParts[partIndex] = {
        ...updatedParts[partIndex],
        text: llmResponse.rewritten_text,
        section_title: llmResponse.section_title,
      };

      const updatedStoryboard = { ...storyboard, storyboard_parts: updatedParts };

      // Update in database
      await Story.update(storyboard.id, { storyboard_parts: updatedParts });

      // Update parent component
      if (onStoryboardUpdate) {
        onStoryboardUpdate(updatedStoryboard);
      }
    } catch (error) {
      console.error("Error regenerating text:", error);
    }
    setRegeneratingText(null);
  };

  const handleEditClick = (index, currentText) => {
    setEditingTextIndex(index);
    setEditedTextContent(currentText || ''); // Ensure it's always a string
  };

  const handleCancelEdit = () => {
    setEditingTextIndex(null);
    setEditedTextContent('');
  };

  const handleSaveText = async (partIndex) => {
    if (!storyboard) return;

    const updatedParts = [...storyboard.storyboard_parts];
    updatedParts[partIndex] = { ...updatedParts[partIndex], text: editedTextContent };

    const updatedStoryboard = { ...storyboard, storyboard_parts: updatedParts };

    await Story.update(storyboard.id, { storyboard_parts: updatedParts });

    if (onStoryboardUpdate) {
      onStoryboardUpdate(updatedStoryboard);
    }

    handleCancelEdit();
  };

  const handleEditTitleClick = (index, currentTitle) => {
    setEditingTitleIndex(index);
    setEditedTitleContent(currentTitle || ''); // Ensure it's always a string
  };

  const handleCancelEditTitle = () => {
    setEditingTitleIndex(null);
    setEditedTitleContent('');
  };

  const handleSaveTitle = async (partIndex) => {
    if (!storyboard) return;

    const updatedParts = [...storyboard.storyboard_parts];
    updatedParts[partIndex] = { ...updatedParts[partIndex], section_title: editedTitleContent };

    const updatedStoryboard = { ...storyboard, storyboard_parts: updatedParts };

    await Story.update(storyboard.id, { storyboard_parts: updatedParts });

    if (onStoryboardUpdate) {
      onStoryboardUpdate(updatedStoryboard);
    }

    handleCancelEditTitle();
  };

  const handleEditPromptClick = (index, currentPrompt) => {
    setEditingPromptIndex(index);
    setEditedPromptContent(currentPrompt || ''); // Ensure it's always a string
  };

  const handleCancelEditPrompt = () => {
    setEditingPromptIndex(null);
    setEditedPromptContent('');
  };

  const handleSaveAndRegenerateImage = (partIndex) => {
    regenerateImage(partIndex, editedPromptContent);
  };

  // Download image function
  const handleDownloadImage = async (partIndex) => {
    if (!storyboard || !storyboard.storyboard_parts[partIndex] || !storyboard.storyboard_parts[partIndex].image_url) {
      return;
    }

    const imageUrl = storyboard.storyboard_parts[partIndex].image_url;
    
    try {
      // If authenticated, use backend proxy for download
      if (isAuthenticated && token && storyboard.id && !storyboard.id.startsWith('local_')) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storyboards/${storyboard.id}/images/${partIndex}/download`, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${storyboard.title || 'storyboard'}-scene-${partIndex + 1}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          throw new Error('Download failed');
        }
      } else {
        // Fallback: direct download (may have CORS issues)
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${storyboard.title || 'storyboard'}-scene-${partIndex + 1}.jpg`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback to opening in new tab
      window.open(imageUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f145ce9d6_3.png" alt="Loading" className="w-10 md:w-12 h-10 md:h-12 mb-4 animate-spin" />
        <h2 className="text-lg md:text-xl font-semibold text-slate-700 text-center">Creating your visual story...</h2>
        <p className="text-slate-500 mt-2 text-center text-sm md:text-base leading-relaxed">
          AI is analyzing your story and generating beautiful images. This may take a moment.
        </p>
      </div>
    );
  }

  if (!storyboard || !storyboard.storyboard_parts || storyboard.storyboard_parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/85bd47c69_4.png" alt="No Storyboard" className="w-12 md:w-16 h-12 md:h-16 mb-4" />
        <h2 className="text-lg md:text-xl font-semibold text-slate-700 text-center">No Storyboard to Display</h2>
        <p className="text-slate-500 mt-2 text-sm md:text-base text-center">Enter a story above to begin creating your visual narrative!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="text-center mb-8 md:mb-12 px-2">
        <div className="flex items-center justify-center gap-4 mb-3 md:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            {storyboard.title || "Your Visual Story"}
          </h1>
          
          {/* Share Button - Only show for authenticated users, not public view */}
          {!isPublicView && storyboard.id && !storyboard.id.startsWith('local_') && (
            <Popover open={showSharePopover} onOpenChange={setShowSharePopover}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Share this storyboard</h4>
                    <p className="text-xs text-slate-600 mb-3">
                      Anyone with this link can view and download this storyboard
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={storyboard.slug 
                        ? `${window.location.origin}/${storyboard.slug}`
                        : `${window.location.origin}/viewstoryboard?id=${storyboard.id}`
                      }
                      className="text-xs"
                    />
                    <Button onClick={handleShareStoryboard} size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        <div className="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full"></div>
        
        {/* Style and Mood indicators */}
        {(storyboard.visual_style || storyboard.mood_treatment || storyboard.color_theme) && (
          <div className="flex justify-center gap-2 mt-4">
            {storyboard.visual_style && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                {storyboard.visual_style.replace('_', ' ')}
              </span>
            )}
            {storyboard.mood_treatment && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {storyboard.mood_treatment}
              </span>
            )}
            {storyboard.color_theme && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium capitalize">
                {storyboard.color_theme.replace('_', ' ')}
              </span>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {storyboard.storyboard_parts.map((part, index) => (
          <motion.div
            key={`part-${index}-${part.section_title || index}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="card-gradient border-slate-200/60 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardContent className={`p-0 grid grid-cols-1 lg:grid-cols-2 min-h-[300px] md:min-h-[400px]`}>
                {/* Text Section */}
                <div className={`p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col justify-center ${index % 2 === 0 ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}`}>
                  <div className="space-y-4 md:space-y-6 max-w-lg">
                    <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs md:text-sm">{index + 1}</span>
                        </div>
                        {editingTitleIndex === index ? (
                          <div className="flex items-center gap-2 w-full">
                            <Input
                              value={editedTitleContent}
                              onChange={(e) => setEditedTitleContent(e.target.value)}
                              className="w-full text-sm md:text-base"
                              autoFocus
                            />
                            <Button onClick={handleCancelEditTitle} variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><X className="w-4 h-4" /></Button>
                            <Button onClick={() => handleSaveTitle(index)} size="icon" className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 h-8 w-8 flex-shrink-0"><Check className="w-4 h-4" /></Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 min-w-0">
                            <h3 className="text-sm md:text-lg font-bold text-slate-800 leading-tight truncate">
                              {part.section_title || `Section ${index + 1}`}
                            </h3>
                            {!isPublicView && (
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 h-8 w-8 flex-shrink-0" onClick={() => handleEditTitleClick(index, part.section_title)}>
                                  <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Regenerate Text button - Only show for authenticated users, not public view */}
                      {!isPublicView && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateText(index)}
                            disabled={regeneratingText === index || editingTextIndex === index || editingTitleIndex === index}
                            className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 p-1 md:p-2 min-h-[36px] touch-manipulation disabled:opacity-50 text-xs"
                          >
                            {regeneratingText === index ? (
                              <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Regenerate Text</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingTextIndex === index ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editedTextContent}
                          onChange={(e) => setEditedTextContent(e.target.value)}
                          className="w-full min-h-[120px] border-slate-300 focus:border-purple-500 focus:ring-purple-500 text-sm md:text-base leading-relaxed"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                           <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="min-h-[36px]">
                            <X className="w-4 h-4 mr-1" /> Cancel
                           </Button>
                           <Button onClick={() => handleSaveText(index)} size="sm" className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 min-h-[36px]">
                            <Check className="w-4 h-4 mr-1" /> Save
                           </Button>
                        </div>
                      </div>
                    ) : (
                       <div className="flex items-start gap-3">
                         <p className="flex-1 text-slate-700 leading-relaxed text-sm md:text-base lg:text-lg font-medium">
                           {part.text}
                         </p>
                         {!isPublicView && (
                           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 h-8 w-8" onClick={() => handleEditClick(index, part.text)}>
                              <Pencil className="w-4 h-4" />
                           </Button>
                         )}
                       </div>
                    )}
                  </div>
                </div>

                {/* Image Section */}
                <div className={`relative min-h-[250px] md:min-h-[300px] lg:min-h-[400px] bg-slate-100 flex items-center justify-center overflow-hidden ${index % 2 === 0 ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}`}>
                  {regeneratingIndex === index ? (
                    <div className="flex flex-col items-center text-slate-400">
                      <Loader2 className="w-8 md:w-10 h-8 md:h-10 animate-spin mb-2 md:mb-3" />
                      <p className="text-sm md:text-base font-medium">Generating new image...</p>
                    </div>
                  ) : part.image_url ? (
                    <div className="relative w-full h-full group">
                      <motion.img
                        src={part.image_url}
                        alt={`Visual for ${part.section_title || `Section ${index + 1}`}`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                      {/* Action buttons - Only show for authenticated users, not public view */}
                      {!isPublicView && (
                        <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => regenerateImage(index)}
                              disabled={regeneratingIndex === index}
                              className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 min-h-[36px] touch-manipulation"
                            >
                              <RefreshCw className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                              Regenerate Image
                            </Button>
                            
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDownloadImage(index)}
                              className="bg-white text-slate-900 border border-green-600 shadow-md hover:shadow-lg hover:bg-green-50 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 min-h-[36px] touch-manipulation"
                            >
                              <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                              Download
                            </Button>
                            
                            <Popover open={editingPromptIndex === index} onOpenChange={(open) => setEditingPromptIndex(open ? index : null)}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleEditPromptClick(index, part.image_prompt)}
                                  disabled={regeneratingIndex === index}
                                  className="bg-white text-slate-900 border border-purple-600 shadow-md hover:shadow-lg hover:bg-purple-50 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 min-h-[36px] touch-manipulation"
                                >
                                  <Pencil className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                                  Edit Image Prompt
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-4">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm">Edit Complete Image Prompt</h4>
                                  <p className="text-xs text-slate-600">Modify the base prompt below to change the generated image. Be descriptive for best results.</p>
                                  <Textarea
                                    value={editedPromptContent}
                                    onChange={(e) => setEditedPromptContent(e.target.value)}
                                    placeholder="e.g., 'A scientist in a futuristic lab looking at a glowing blue liquid...'"
                                    className="w-full min-h-[120px] text-sm"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={handleCancelEditPrompt}
                                      className="text-xs"
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSaveAndRegenerateImage(index)}
                                      disabled={!editedPromptContent || !editedPromptContent.trim() || regeneratingIndex === index}
                                      className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-xs"
                                    >
                                      Save & Regenerate
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Loader2 className="w-8 md:w-10 h-8 md:h-10 animate-spin mb-2 md:mb-3" />
                      <p className="text-sm md:text-base font-medium text-center">Generating image...</p>
                      <p className="text-xs md:text-sm mt-1 text-center">This may take a few moments</p>
                    </div>
                  )}
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
              </CardContent>
            </Card>
            {index < storyboard.storyboard_parts.length - 1 && (
              <div className="flex justify-center my-6 md:my-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <Separator className="w-12 md:w-16 bg-gradient-to-r from-purple-300 to-blue-300 h-0.5" />
                  <div className="w-2 md:w-3 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"></div>
                  <Separator className="w-12 md:w-16 bg-gradient-to-r from-blue-300 to-purple-300 h-0.5" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="text-center pt-8 md:pt-12 pb-6 md:pb-8">
        <div className="w-12 md:w-16 h-0.5 md:h-1 bg-gradient-to-r from-purple-500 to-blue-600 mx-auto rounded-full mb-3 md:mb-4"></div>
        <p className="text-slate-500 text-base md:text-lg">End of Story</p>
      </div>
    </motion.div>
  );
}
