
import React, { useState, useEffect } from "react";
import { Story } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { runwareImageGeneration } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2, BookOpenText, ArrowRight, Info, Palette, Layout, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StoryboardDisplay from "../components/storyboard/StoryboardDisplay";
import SimplifiedCreativeBrief from "../components/creation/SimplifiedCreativeBrief";
import { VISUAL_STYLES, COLOR_THEMES } from "../components/creation/StyleSelector";
import CharacterSelector from "../components/CharacterSelector";
import TemplatesSidebar from "../components/TemplatesSidebar";
import CreateTemplateModal from "../components/CreateTemplateModal";
import BrandProfileSelector from "../components/BrandProfileSelector";
import CreateBrandModal from "../components/CreateBrandModal";
import CreditBalance from "../components/ui/CreditBalance";
import LowCreditWarning from "../components/ui/LowCreditWarning";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function CreateStoryboard() {
  const [originalText, setOriginalText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStoryboard, setCurrentStoryboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreativeBrief, setShowCreativeBrief] = useState(false);
  const [creativeBriefData, setCreativeBriefData] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showBrandProfiles, setShowBrandProfiles] = useState(false);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { isAuthenticated, token, user, logout, credits, refreshCredits } = useAuth();

  // Character consistency helper
  const extractCharacterReference = (characterPersona) => {
    // If a character is selected, use its information
    if (selectedCharacter) {
      let reference = `${selectedCharacter.name}`;
      
      if (selectedCharacter.appearance) {
        reference += `, ${selectedCharacter.appearance}`;
      }
      
      if (selectedCharacter.personality) {
        reference += `, ${selectedCharacter.personality}`;
      }
      
      if (selectedCharacter.description) {
        reference += `. ${selectedCharacter.description}`;
      }
      
      return reference.substring(0, 200);
    }

    // Fallback to original logic if no character selected
    if (!characterPersona || typeof characterPersona !== 'string') return "";

    try {
      const lines = characterPersona.split('\n').filter(line => line && typeof line === 'string' && line.trim());
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
    } catch (error) {
      console.error("Error extracting character reference:", error);
      return "";
    }
  };

  // Smart prompt builder with FIXED length management
  const buildOptimizedPrompt = (scenePrompt, characterRef, visualStyle, colorTheme, logoUrl = null, includeLogo = false) => {
    const MAX_PROMPT_LENGTH = 400; // Increased for better context
    
    // Ensure all inputs are safe strings
    const safeScenePrompt = String(scenePrompt || "").trim();
    const safeCharacterRef = String(characterRef || "").trim();
    const safeVisualStyle = String(visualStyle || "realistic").trim();
    const safeColorTheme = String(colorTheme || "modern").trim();

    if (!safeScenePrompt) {
      return "a detailed scene, high quality, professional";
    }

    // Get style and color modifiers
    const styleData = VISUAL_STYLES.find(s => s.key === safeVisualStyle) || VISUAL_STYLES[0];
    const colorData = COLOR_THEMES.find(c => c.key === safeColorTheme) || COLOR_THEMES[0];

    const styleModifier = (styleData?.prompt || "high quality, detailed");
    const colorModifier = (colorData?.prompt || "balanced colors");
    
    // Add logo context if available and user wants it included
    const logoContext = (logoUrl && includeLogo) ? " with company logo in top-left corner" : "";

    // Build prompt with better structure for context
    let prompt = safeScenePrompt;
    
    // Ensure we have enough room for all modifiers
    const availableLength = MAX_PROMPT_LENGTH - 100; // Reserve space for modifiers
    if (prompt.length > availableLength) {
      prompt = prompt.substring(0, availableLength);
      // Try to end at a word boundary
      const lastSpace = prompt.lastIndexOf(' ');
      if (lastSpace > availableLength - 50) {
        prompt = prompt.substring(0, lastSpace);
      }
    }

    // Add character reference for consistency
    if (safeCharacterRef && prompt.length + safeCharacterRef.length + 100 < MAX_PROMPT_LENGTH) {
      const shortCharRef = safeCharacterRef.substring(0, 60);
      prompt += `. Character: ${shortCharRef}`;
    }

    // Add style and color with better formatting
    prompt += `. Style: ${styleModifier}. Colors: ${colorModifier}${logoContext}`;

    // Final length guard
    if (prompt.length > MAX_PROMPT_LENGTH) {
      prompt = prompt.substring(0, MAX_PROMPT_LENGTH - 10);
      const cut = prompt.lastIndexOf(' ');
      if (cut > MAX_PROMPT_LENGTH - 50) {
        prompt = prompt.substring(0, cut);
      }
    }

    return prompt.trim();
  };

  const handleCreativeBriefComplete = (briefData) => {
    setCreativeBriefData(briefData);
    setShowCreativeBrief(false);
  };

  // Handle template selection
  const handleTemplateSelect = (templateData) => {
    setCreativeBriefData({
      visualStyle: templateData.visual_style || templateData.visualStyle,
      colorTheme: templateData.color_theme || templateData.colorTheme,
      logoUrl: templateData.logo_url || templateData.logoUrl,
      description: templateData.description
    });
    setShowTemplates(false);
    toast.success('Template applied successfully!');
  };

  const handleBrandSelect = (brandData) => {
    setSelectedBrand(brandData);
    setShowBrandProfiles(false);
    toast.success(`Brand profile "${brandData.brand_name}" selected!`);
  };

  const handleBrandCreated = (brandData) => {
    setSelectedBrand(brandData);
    setShowCreateBrand(false);
    setShowBrandProfiles(false);
    toast.success('Brand profile created and selected!');
  };

  // Handle template creation
  const handleTemplateCreated = (template) => {
    toast.success('Template created successfully!');
    setShowCreateTemplate(false);
  };

  // Save storyboard to backend
  const saveStoryboardToBackend = async (storyboardData) => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, skipping backend save');
      return null;
    }

    try {
      const response = await fetch('http://localhost:3001/api/storyboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: storyboardData.title,
          original_text: storyboardData.original_text, // Fixed: Use snake_case
          storyboard_parts: storyboardData.storyboard_parts.map(part => ({
            text: part.text,
            image_prompt: part.image_prompt, // Fixed: Use snake_case
            section_title: part.section_title, // Fixed: Use snake_case
            image_url: part.image_url // Fixed: Use snake_case
          })),
          character_id: selectedCharacter?.id, // Fixed: Use snake_case
          visual_style: creativeBriefData?.visualStyle || 'realistic' // Fixed: Use snake_case
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Storyboard saved successfully!');
        
        // Refresh credits after successful storyboard creation
        if (refreshCredits) {
          refreshCredits();
        }
        
        return data.data;
      } else {
        console.error('Failed to save storyboard:', await response.text());
        toast.error('Failed to save storyboard');
        return null;
      }
    } catch (error) {
      console.error('Error saving storyboard:', error);
      toast.error('Failed to save storyboard');
      return null;
    }
  };

  const handleSubmit = async () => {
    // Only authenticated users with credits can create storyboards
    if (!isAuthenticated || !token || !user) {
      setErrorMessage("Please log in to create storyboards. Only registered users with credits can create stories.");
      return;
    }

    // Safe string validation
    const textToProcess = String(originalText || "").trim();
    if (!textToProcess) {
      setErrorMessage("Please enter a story to generate a storyboard.");
      return;
    }

    if (!creativeBriefData) {
      setErrorMessage("Please select a visual style first by clicking 'Start Styling' above.");
      return;
    }

    // Check if user has sufficient credits
    if (credits !== null && credits < 1) {
      setErrorMessage("You don't have enough credits to generate a storyboard. You need 1 credit per storyboard.");
      toast.error("Insufficient credits! You need 1 credit to generate a storyboard.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setCurrentStoryboard(null);

    let createdStory = null;

    try {
      console.log("Starting story analysis...");

      // Step 1: AI analysis
      const llmResponse = await InvokeLLM({
        prompt: `
          Analyze this story and create 6 compelling visual scenes that tell the complete story.

          Break down the story into 6 distinct scenes that capture the key moments, characters, and narrative flow.

          For each scene, provide:
          1. text: 2-3 sentences describing what happens in this scene
          2. section_title: Short engaging title (3-5 words)
          3. image_prompt: Detailed visual description for image generation

          Create detailed character descriptions if characters exist, and ensure character consistency across all scenes.

          Story: ${textToProcess}
        `,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            character_persona: { type: "string" },
            storyboard_parts: {
              type: "array",
              minItems: 6,
              maxItems: 6,
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  image_prompt: { type: "string" },
                  section_title: { type: "string" }
                },
                required: ["text", "image_prompt", "section_title"]
              }
            }
          },
          required: ["title", "character_persona", "storyboard_parts"]
        }
      });

      console.log("LLM Response received:", llmResponse);

      if (!llmResponse || !llmResponse.storyboard_parts || llmResponse.storyboard_parts.length === 0) {
        throw new Error("AI could not process your story. Please try a different approach.");
      }

      // Ensure we have exactly 6 parts
      if (llmResponse.storyboard_parts.length < 6) {
        console.warn(`Only got ${llmResponse.storyboard_parts.length} parts instead of 6. Padding with additional scenes.`);
        // Add placeholder parts if we got fewer than 6
        while (llmResponse.storyboard_parts.length < 6) {
          const partIndex = llmResponse.storyboard_parts.length + 1;
          llmResponse.storyboard_parts.push({
            text: `Scene ${partIndex}: Additional scene to complete the story.`,
            image_prompt: `Scene ${partIndex} of the story, continuing the narrative.`,
            section_title: `Scene ${partIndex}`
          });
        }
      }

      // Create story record
      const initialStoryboardData = {
        original_text: textToProcess,
        title: String(llmResponse.title || "Untitled Story"),
        character_persona: String(llmResponse.character_persona || ""),
        visual_style: String(creativeBriefData?.visualStyle || "realistic"),
        color_theme: String(creativeBriefData?.colorTheme || "modern"),
        storyboard_parts: llmResponse.storyboard_parts.map(part => ({
          text: String(part.text || ""),
          image_prompt: String(part.image_prompt || ""),
          section_title: String(part.section_title || ""),
          image_url: null
        })),
        status: "processing"
      };

      console.log("Creating story record...");
      
      try {
        createdStory = await Story.create(initialStoryboardData);
        setCurrentStoryboard(createdStory);
      } catch (authError) {
        console.log("Not authenticated, creating local storyboard...");
        // Create a local storyboard without saving to database
        createdStory = {
          id: `local_${Date.now()}`,
          ...initialStoryboardData,
          created_at: new Date().toISOString(),
          status: "processing"
        };
        setCurrentStoryboard(createdStory);
      }

      console.log("Story created, starting image generation...");

      // Extract character reference
      const characterRef = extractCharacterReference(llmResponse.character_persona);

      // Generate images
      const updatedParts = [...llmResponse.storyboard_parts];

      // Generate images for all storyboard parts
      for (let i = 0; i < updatedParts.length; i++) {
        let imageGenerated = false;
        let retryCount = 0;
        const maxRetries = 2;

        while (!imageGenerated && retryCount <= maxRetries) {
          try {
            console.log(`Generating image for part ${i + 1} (attempt ${retryCount + 1})...`);

            const optimizedPrompt = buildOptimizedPrompt(
              updatedParts[i].image_prompt,
              characterRef,
              creativeBriefData?.visualStyle || "realistic",
              creativeBriefData?.colorTheme || "modern",
              creativeBriefData?.logoUrl,
              creativeBriefData?.includeLogo
            );

            console.log(`Optimized prompt: ${optimizedPrompt}`);

            // Prepare character reference images: handle snake_case as well
            const referenceUrl = 
              selectedCharacter?.referenceImageUrl ||
              selectedCharacter?.reference_image_url ||
              selectedCharacter?.imageUrl ||
              selectedCharacter?.image_url ||
              null;
            const characterReferenceImages = referenceUrl ? [referenceUrl] : [];

          const imageResult = await runwareImageGeneration({ 
            prompt: optimizedPrompt,
            visualStyle: creativeBriefData?.visualStyle || 'realistic',
            colorTheme: creativeBriefData?.colorTheme || 'modern',
            options: {
              visualStyle: creativeBriefData?.visualStyle || 'realistic',
              colorTheme: creativeBriefData?.colorTheme || 'modern',
              storyboardId: createdStory?.id || null,
              sceneIndex: i
            },
            characterReferenceImages: characterReferenceImages,
            logoUrl: creativeBriefData?.logoUrl || undefined,
            includeLogo: Boolean(creativeBriefData?.includeLogo)
          });

            console.log(`Image result for part ${i + 1}:`, imageResult);

            if (imageResult.data && imageResult.data.url) {
              updatedParts[i].image_url = imageResult.data.url;
              console.log(`Successfully generated image for part ${i + 1}`);
              imageGenerated = true;
            } else {
              console.error(`Failed to generate image for part ${i + 1}:`, imageResult);
              updatedParts[i].image_url = null;
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`Retrying image generation for part ${i + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
              }
            }

            // Update display in real-time
            if (createdStory?.id) {
              const tempStoryboard = { 
                ...createdStory, 
                storyboard_parts: updatedParts.map(part => ({
                  text: String(part.text || ""),
                  image_prompt: String(part.image_prompt || ""),
                  section_title: String(part.section_title || ""),
                  image_url: part.image_url
                }))
              };
              setCurrentStoryboard(tempStoryboard);
              
              // Only update database if authenticated
              if (!createdStory.id.startsWith('local_')) {
                try {
                  await Story.update(createdStory.id, { storyboard_parts: tempStoryboard.storyboard_parts });
                } catch (updateError) {
                  console.log("Could not update story in database:", updateError.message);
                }
              }
            }

          } catch (imageError) {
            console.error(`Error generating image for part ${i + 1}:`, imageError);
            updatedParts[i].image_url = null;
            retryCount++;

            if (imageError.message && imageError.message.includes('402')) {
              setErrorMessage("Image generation limit reached. Please check your account credits.");
              break; // Stop trying if we hit rate limits
            } else if (imageError.message && imageError.message.includes('timeout')) {
              console.log(`Timeout for part ${i + 1}, will retry...`);
              if (retryCount <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } else {
              console.error(`Failed to generate image for part ${i + 1}:`, imageError.message);
              if (retryCount <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
        }
      }

      // Mark as completed and save to backend
      if (createdStory?.id) {
        const finalStoryboard = {
          ...createdStory,
          status: "completed",
          storyboard_parts: updatedParts.map(part => ({
            text: String(part.text || ""),
            image_prompt: String(part.image_prompt || ""),
            section_title: String(part.section_title || ""),
            image_url: part.image_url
          }))
        };
        setCurrentStoryboard(finalStoryboard);
        
        // Only update database if authenticated (don't create a new storyboard)
        if (!createdStory.id.startsWith('local_')) {
          try {
            await Story.update(createdStory.id, {
              status: "completed",
              storyboard_parts: finalStoryboard.storyboard_parts
            });
            toast.success('Storyboard saved successfully!');
          } catch (updateError) {
            console.log("Could not update story completion in database:", updateError.message);
          }
        }
      }

      console.log("Story generation completed successfully");

    } catch (error) {
      console.error("Error generating storyboard:", error);
      setErrorMessage(String(error.message || "Failed to generate storyboard. Please try again."));

      if (createdStory?.id && !createdStory.id.startsWith('local_')) {
        try {
          await Story.update(createdStory.id, {
            status: "failed",
            error_message: String(error.message || "Unknown error")
          });
        } catch (updateError) {
          console.log("Could not update story error in database:", updateError.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryboardUpdate = (updatedStoryboard) => {
    setCurrentStoryboard(updatedStoryboard);
  };

  if (showCreativeBrief) {
    return (
      <div className="min-h-screen gradient-bg">
        <SimplifiedCreativeBrief
          onComplete={handleCreativeBriefComplete}
          onSkip={() => setShowCreativeBrief(false)}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen gradient-bg p-3 md:p-4 lg:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12 px-2"
        >
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">NewsPlay</span>
            </h1>
          </div>
          {user && user.name && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg md:text-xl font-semibold text-slate-700">
                Welcome back, <span className="text-purple-600">{user.name}</span>! 👋
              </p>
              <div className="flex items-center gap-4">
                <CreditBalance showLabel={true} />
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
          {!user && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Please login to access your dashboard</strong><br />
                Your user profile will be fetched from the database after authentication.
              </p>
            </div>
          )}
          <p className="text-slate-600 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Transform any story into a captivating visual experience with AI-generated storyboards and custom imagery.
          </p>
        </motion.div>

        {/* Low Credit Warning */}
        {isAuthenticated && (
          <LowCreditWarning 
            threshold={3} 
            variant="banner" 
            className="mb-6"
          />
        )}

        {/* Creative Brief Banner */}
        {!creativeBriefData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">🎨 Want better, more consistent results?</h3>
                    <p className="text-slate-600 text-sm md:text-base">
                      Choose from saved templates or create a new styling configuration for consistent results.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
{/* <Button
                      onClick={() => setShowTemplates(true)}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Layout className="w-4 h-4 mr-2" />
                      Use Template
                    </Button> */}
{/* <Button
                      onClick={() => setShowBrandProfiles(true)}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Brand Profile
                    </Button> */}
                    <Button
                      onClick={() => setShowCreativeBrief(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Custom Style
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Brief Summary */}
        {creativeBriefData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">✅ Style Applied</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm bg-white px-2 py-1 rounded border capitalize">
                        Style: {String(creativeBriefData.visualStyle || "realistic").replace('_', ' ')}
                      </span>
                      <span className="text-sm bg-white px-2 py-1 rounded border capitalize">
                        Color Theme: {String(creativeBriefData.colorTheme || "modern")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreativeBrief(true)}
                    className="ml-4"
                  >
                    Edit Style
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="card-gradient border-slate-200/60 shadow-xl mb-8 md:mb-12">
            <CardHeader className="border-b border-slate-200/60 pb-4 md:pb-6 p-4 md:p-6">
              <CardTitle className="flex items-center gap-3 text-slate-800 text-xl md:text-2xl">
                <div className="w-6 md:w-8 h-6 md:h-8 bg-white border border-blue-600 shadow-md rounded-lg flex items-center justify-center">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/fbbdafa46_1.png" alt="Story Input" className="w-3 md:w-5 h-3 md:h-5" />
                </div>
                Your Story Input
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 md:pt-8 space-y-4 md:space-y-6 p-4 md:p-6">
              <div className="space-y-3">
                <Label htmlFor="story-input" className="text-slate-700 font-semibold text-base md:text-lg">
                  Paste your article, news story, or any narrative:
                </Label>
                <Textarea
                  id="story-input"
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Example: 'Scientists at MIT have developed a revolutionary new battery technology that could change electric vehicles forever. The breakthrough came after five years of research into lithium-ion alternatives...'"
                  className="min-h-[200px] md:min-h-[250px] border-slate-300 focus:border-purple-500 focus:ring-purple-500 text-sm md:text-base p-4 md:p-6 leading-relaxed resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs md:text-sm text-slate-500 px-1">
                  💡 Tip: Longer, more detailed stories create richer visual storyboards! Every scene will be visualized.
                </p>
              </div>

              {/* Character Selection */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-semibold text-base md:text-lg">
                  Character Selection (Optional)
                </Label>
                <CharacterSelector
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={setSelectedCharacter}
                  onCharacterChange={() => setSelectedCharacter(null)}
                />
                <p className="text-xs md:text-sm text-slate-500 px-1">
                  🎭 Select a character to ensure consistent visual appearance across all storyboard images.
                </p>
              </div>

              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-700 font-medium text-sm md:text-base">
                        Demo Mode
                      </p>
                      <p className="text-blue-600 text-xs md:text-sm mt-1">
                        You're creating a local storyboard. Login to save your storyboards permanently.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4"
                >
                  <p className="text-red-700 font-medium text-sm md:text-base">{errorMessage}</p>
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-base md:text-lg px-4 md:px-6 py-3 md:py-4 font-semibold min-h-[48px] touch-manipulation"
                disabled={isLoading || !String(originalText || "").trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 md:mr-3 h-4 md:h-5 w-4 md:w-5 animate-spin" />
                    Creating Your Visual Story...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 md:mr-3 h-4 md:h-5 w-4 md:w-5" />
                    Generate Visual Storyboard
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storyboard Display */}
        {(currentStoryboard || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StoryboardDisplay
              storyboard={currentStoryboard}
              isLoading={isLoading}
              onStoryboardUpdate={handleStoryboardUpdate}
            />
          </motion.div>
        )}

        {/* Template Modals */}
        {showTemplates && (
          <TemplatesSidebar
            onTemplateSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {showCreateTemplate && (
          <CreateTemplateModal
            onTemplateCreated={handleTemplateCreated}
            onClose={() => setShowCreateTemplate(false)}
          />
        )}

        {showBrandProfiles && (
          <BrandProfileSelector
            onBrandSelect={handleBrandSelect}
            onClose={() => setShowBrandProfiles(false)}
            selectedBrand={selectedBrand}
            onCreateBrand={() => setShowCreateBrand(true)}
          />
        )}

        {showCreateBrand && (
          <CreateBrandModal
            onBrandCreated={handleBrandCreated}
            onClose={() => setShowCreateBrand(false)}
          />
        )}
      </div>
    </motion.div>
  );
}
