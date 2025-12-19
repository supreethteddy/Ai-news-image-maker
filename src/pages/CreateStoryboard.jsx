
import React, { useState, useEffect } from "react";
import { Story } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { runwareImageGeneration } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { buildMasterPrompt, buildNegativePrompt, enhanceSceneForCharacter } from "@/utils/masterPrompting";

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
  const [sceneCount, setSceneCount] = useState(4); // Fixed to 4 images per story
  const { isAuthenticated, token, user, logout, credits, refreshCredits } = useAuth();

  // Character consistency helper - extract single character (legacy)
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

  // NEW: Extract multiple characters from character_persona
  const extractMultipleCharacters = (characterPersona) => {
    const characters = [];
    
    if (!characterPersona || typeof characterPersona !== 'string') {
      return characters;
    }

    try {
      // Split by lines and look for character definitions
      const lines = characterPersona.split('\n').filter(line => line && line.trim());
      
      // Pattern 1: "Character Name: description" or "**Character Name**: description"
      // Pattern 2: "Character Name - description"
      // Pattern 3: Lines starting with character names followed by colon or dash
      
      let currentCharacter = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check for character name patterns (name followed by : or -)
        const colonMatch = trimmedLine.match(/^[*]*\s*([A-Z][a-zA-Z\s]+?)\s*[:]\s*(.+)$/);
        const dashMatch = trimmedLine.match(/^[*]*\s*([A-Z][a-zA-Z\s]+?)\s*[-]\s*(.+)$/);
        const boldMatch = trimmedLine.match(/\*\*([A-Z][a-zA-Z\s]+?)\*\*[:]\s*(.+)$/);
        
        if (colonMatch || dashMatch || boldMatch) {
          // Save previous character if exists
          if (currentCharacter) {
            characters.push(currentCharacter);
          }
          
          // Start new character
          const match = colonMatch || dashMatch || boldMatch;
          const name = (match[1] || '').trim().replace(/\*\*/g, '');
          const description = (match[2] || '').trim();
          
          if (name && name.length > 0 && name.length < 50) {
            currentCharacter = {
              name: name,
              description: description,
              fullDescription: `${name}: ${description}`
            };
          }
        } else if (currentCharacter && trimmedLine.length > 0) {
          // Continue adding to current character description
          currentCharacter.description += ' ' + trimmedLine;
          currentCharacter.fullDescription += ' ' + trimmedLine;
        }
      }
      
      // Add last character
      if (currentCharacter) {
        characters.push(currentCharacter);
      }
      
      // If no structured characters found, try to extract from text
      if (characters.length === 0) {
        // Look for common patterns like "Arun is..." or "Nina is..."
        const namePattern = /\b([A-Z][a-z]+)\s+(?:is|was|has|had|sits|sitting|stands|standing|walks|walking)\b/gi;
        const foundNames = new Set();
        let match;
        
        while ((match = namePattern.exec(characterPersona)) !== null) {
          const name = match[1];
          if (name && name.length > 2 && name.length < 20 && !foundNames.has(name)) {
            foundNames.add(name);
            // Extract description for this character
            const nameIndex = characterPersona.indexOf(name);
            const nextSentence = characterPersona.substring(nameIndex, nameIndex + 200);
            characters.push({
              name: name,
              description: nextSentence.substring(0, 150),
              fullDescription: nextSentence.substring(0, 200)
            });
          }
        }
      }
      
      // Limit to max 5 characters to avoid too many anchors
      return characters.slice(0, 5);
    } catch (error) {
      console.error("Error extracting multiple characters:", error);
      return [];
    }
  };

  // NEW: Detect which character(s) are mentioned in a scene (improved accuracy)
  const detectCharactersInScene = (sceneText, characters) => {
    if (!sceneText || !characters || characters.length === 0) {
      return [];
    }
    
    const sceneLower = sceneText.toLowerCase();
    const mentionedCharacters = [];
    const characterScores = new Map(); // Track how strongly each character is mentioned
    
    for (const char of characters) {
      const charNameLower = char.name.toLowerCase();
      let score = 0;
      
      // Pattern 1: Direct name mention (highest priority)
      // "Arun is", "Arun sits", "Arun's", "Arun,", etc.
      const directPattern = new RegExp(`\\b${charNameLower}\\s+(?:is|was|sits|sitting|stands|standing|walks|walking|runs|running|says|said|does|did|has|had|looks|looking|feels|feeling|thinks|thinking|goes|went|comes|came|takes|took|gives|gave|makes|made|sees|saw|knows|knew|wants|wanted|needs|needed|tries|tried|starts|started|stops|stopped|continues|continued|begins|began|ends|ended|decides|decided|chooses|chose|helps|helped|asks|asked|tells|told|shows|showed|finds|found|gets|got|puts|put|leaves|left|stays|stayed|moves|moved|turns|turned|opens|opened|closes|closed|breaks|broke|fixes|fixed|builds|built|creates|created|destroys|destroyed|saves|saved|loses|lost|wins|won|fights|fought|plays|played|works|worked|studies|studied|learns|learned|teaches|taught|writes|wrote|reads|read|sings|sang|dances|danced|paints|painted|draws|drew|cooks|cooked|eats|ate|drinks|drank|sleeps|slept|wakes|woke|wakes up|woke up|falls|fell|rises|rose|jumps|jumped|climbs|climbed|flies|flew|swims|swam|drives|drove|rides|rode|walks|walked|runs|ran|sits|sat|stands|stood|lies|lay|lays|laid|kneels|knelt|squats|squatted|bends|bent|stretches|stretched|reaches|reached|grabs|grabbed|holds|held|drops|dropped|throws|threw|catches|caught|hits|hit|kicks|kicked|pushes|pushed|pulls|pulled|lifts|lifted|carries|carried|brings|brought|takes|took|gives|gave|sends|sent|receives|received|buys|bought|sells|sold|pays|paid|costs|cost|spends|spent|earns|earned|loses|lost|wins|won|fights|fought|plays|played|works|worked|studies|studied|learns|learned|teaches|taught|writes|wrote|reads|read|sings|sang|dances|danced|paints|painted|draws|drew|cooks|cooked|eats|ate|drinks|drank|sleeps|slept|wakes|woke|wakes up|woke up|falls|fell|rises|rose|jumps|jumped|climbs|climbed|flies|flew|swims|swam|drives|drove|rides|rode|walks|walked|runs|ran|sits|sat|stands|stood|lies|lay|lays|laid|kneels|knelt|squats|squatted|bends|bent|stretches|stretched|reaches|reached|grabs|grabbed|holds|held|drops|dropped|throws|threw|catches|caught|hits|hit|kicks|kicked|pushes|pushed|pulls|pulled|lifts|lifted|carries|carried|brings|brought|takes|took|gives|gave|sends|sent|receives|received|buys|bought|sells|sold|pays|paid|costs|cost|spends|spent|earns|earned|'s|,)`, 'gi');
      if (directPattern.test(sceneText)) {
        score += 10; // High score for direct mention
      }
      
      // Pattern 2: Name at start of sentence (very high priority)
      const startPattern = new RegExp(`^${charNameLower}\\s+`, 'i');
      if (startPattern.test(sceneText.trim())) {
        score += 15; // Very high score
      }
      
      // Pattern 3: Name in quotes or emphasized
      if (sceneLower.includes(`"${charNameLower}"`) || sceneLower.includes(`'${charNameLower}'`)) {
        score += 8;
      }
      
      // Pattern 4: Name with action verbs (strong indication)
      const actionPattern = new RegExp(`${charNameLower}\\s+(?:is|was|sits|sitting|stands|standing|walks|walking|runs|running|does|did|has|had|looks|looking|feels|feeling|thinks|thinking|goes|went|comes|came|takes|took|gives|gave|makes|made|sees|saw|knows|knew|wants|wanted|needs|needed|tries|tried|starts|started|stops|stopped|continues|continued|begins|began|ends|ended|decides|decided|chooses|chose|helps|helped|asks|asked|tells|told|shows|showed|finds|found|gets|got|puts|put|leaves|left|stays|stayed|moves|moved|turns|turned|opens|opened|closes|closed|breaks|broke|fixes|fixed|builds|built|creates|created|destroys|destroyed|saves|saved|loses|lost|wins|won|fights|fought|plays|played|works|worked|studies|studied|learns|learned|teaches|taught|writes|wrote|reads|read|sings|sang|dances|danced|paints|painted|draws|drew|cooks|cooked|eats|ate|drinks|drank|sleeps|slept|wakes|woke|wakes up|woke up|falls|fell|rises|rose|jumps|jumped|climbs|climbed|flies|flew|swims|swam|drives|drove|rides|rode|walks|walked|runs|ran|sits|sat|stands|stood|lies|lay|lays|laid|kneels|knelt|squats|squatted|bends|bent|stretches|stretched|reaches|reached|grabs|grabbed|holds|held|drops|dropped|throws|threw|catches|caught|hits|hit|kicks|kicked|pushes|pushed|pulls|pulled|lifts|lifted|carries|carried|brings|brought|takes|took|gives|gave|sends|sent|receives|received|buys|bought|sells|sold|pays|paid|costs|cost|spends|spent|earns|earned)`, 'gi');
      if (actionPattern.test(sceneText)) {
        score += 12; // Very high score for action verbs
      }
      
      // Pattern 5: Simple name mention (lower priority)
      if (sceneLower.includes(charNameLower)) {
        score += 3;
      }
      
      if (score > 0) {
        characterScores.set(char, score);
      }
    }
    
    // Sort by score (highest first)
    const sortedCharacters = Array.from(characterScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // If characters detected, return only the highest scoring one (most relevant)
    if (sortedCharacters.length > 0) {
      return [sortedCharacters[0]]; // Return only the most relevant character
    }
    
    // If no characters detected, return the first character as default
    if (characters.length > 0) {
      return [characters[0]];
    }
    
    return [];
  };

  // Enhanced master prompt builder with character-focused approach
  const buildOptimizedPrompt = (scenePrompt, characterRef, visualStyle, colorTheme, logoUrl = null, includeLogo = false) => {
    // Ensure all inputs are safe strings
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

    // If a character is selected, use character-focused prompting
    if (selectedCharacter) {
      //console.log("Using character-focused prompting for:", selectedCharacter.name);
      
      // Build logo context
      const logoContext = (logoUrl && includeLogo) ? "company logo in bottom-right corner" : "";
      
      // Use specialized character scene enhancement
      const characterPrompt = enhanceSceneForCharacter(
        safeScenePrompt,
        selectedCharacter,
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

      // Add logo context if needed
      if (logoContext) {
        return `${characterPrompt}. ${logoContext}`;
      }
      
      return characterPrompt;
    }

    // Fallback to standard master prompting for non-character scenes
    const lightingMap = {
      warm: "golden",
      cool: "natural", 
      vibrant: "dramatic",
      muted: "soft",
      monochrome: "dramatic",
      modern: "natural"
    };
    
    const lighting = lightingMap[safeColorTheme] || "natural";
    
    // Determine mood based on content
    const mood = safeScenePrompt.toLowerCase().includes('action') || 
                 safeScenePrompt.toLowerCase().includes('dramatic') ? 
                 "dramatic" : "professional";

    // Build logo context
    const logoContext = (logoUrl && includeLogo) ? "company logo in bottom-right corner" : "";

    // Use standard master prompting system
    const masterPrompt = buildMasterPrompt({
      basePrompt: safeScenePrompt,
      type: "storyboard",
      visualStyle: safeVisualStyle,
      colorTheme: safeColorTheme,
      characterRef: safeCharacterRef,
      logoContext: logoContext,
      mood: mood,
      cameraAngle: "medium shot",
      lighting: lighting,
      priority: "quality"
    });

    return masterPrompt;
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
      includeLogo: Boolean(templateData.logo_url || templateData.logoUrl),
      description: templateData.description
    });
    setShowTemplates(false);
    toast.success('Template applied successfully!');
  };

  const handleBrandSelect = (brandData) => {
    setSelectedBrand(brandData);
    // If no logo set from brief, use brand's logo by default and include it
    setCreativeBriefData(prev => ({
      ...(prev || {}),
      logoUrl: (prev?.logoUrl) ? prev.logoUrl : (brandData.logo_url || brandData.logoUrl || prev?.logoUrl || null),
      includeLogo: (prev?.includeLogo !== undefined) ? prev.includeLogo : Boolean(brandData.logo_url || brandData.logoUrl)
    }));
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
      //console.log('Not authenticated, skipping backend save');
      return null;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storyboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
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
          visual_style: creativeBriefData?.visualStyle || 'realistic', // Fixed: Use snake_case
          scene_count: sceneCount // Add scene count to backend
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
        //console.error('Failed to save storyboard:', await response.text());
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

    // Note: Credit check is now done on backend considering 2 free stories per account
    // First 2 stories are FREE, from 3rd story onwards user needs credits

    setIsLoading(true);
    setErrorMessage("");
    setCurrentStoryboard(null);

    let createdStory = null;

    try {
      //console.log("Starting story analysis...");

      // Step 1: AI analysis with ULTRA STRONG character focus
      const characterInstruction = selectedCharacter ? 
        `
          ⚠️ ABSOLUTE MANDATORY CHARACTER REQUIREMENT - NON-NEGOTIABLE ⚠️
          
          Selected Character: ${selectedCharacter.name}
          Physical Description: ${selectedCharacter.appearance || 'Consistent visual identity required'}
          Personality: ${selectedCharacter.personality || 'professional'}
          
          STRICT RULES - NO EXCEPTIONS:
          1. ${selectedCharacter.name} MUST be the PRIMARY SUBJECT in ALL ${sceneCount} scenes - NO EXCEPTIONS
          2. ${selectedCharacter.name} MUST be VISIBLE, IN FOCUS, and PROMINENTLY PLACED in EVERY SINGLE image_prompt
          3. EVERY image_prompt MUST start by mentioning ${selectedCharacter.name} as the main subject
          4. ${selectedCharacter.name} must maintain IDENTICAL appearance across all ${sceneCount} scenes
          5. NO scene can exclude ${selectedCharacter.name} - character visibility is MANDATORY
          6. ${selectedCharacter.name} should be in the CENTER or FOREGROUND of every composition
          7. Each image_prompt must explicitly state "${selectedCharacter.name} is prominently featured"
          
          FORMAT REQUIREMENT for image_prompt:
          Start each image_prompt with: "${selectedCharacter.name} as the main character [doing action/in setting]..."
          
          If you generate ANY scene without ${selectedCharacter.name} as the central focus, the entire storyboard is INVALID.
        ` : 
        'Create detailed character descriptions if characters exist, and ensure character consistency across all scenes.';

      const llmResponse = await InvokeLLM({
        prompt: `
          Analyze this story and create ${sceneCount} compelling visual scenes that tell the complete story.

          ${characterInstruction}

          Break down the story into ${sceneCount} distinct scenes that capture the key moments, characters, and narrative flow.

          For each scene, provide:
          1. text: 2-3 sentences describing what happens in this scene
          2. section_title: Short engaging title (3-5 words)  
          3. image_prompt: MUST start with character name and detailed visual description for image generation

          ${selectedCharacter ? `
          ⚠️ REMINDER: Every single image_prompt must begin with "${selectedCharacter.name} as the main character" followed by the scene description.
          Example format: "${selectedCharacter.name} as the main character standing confidently in a modern office..."
          
          Character MUST be in EVERY scene. Character MUST be PROMINENT. Character MUST be CONSISTENT.
          ` : ''}

          Story: ${textToProcess}
        `,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            character_persona: { type: "string" },
            storyboard_parts: {
              type: "array",
              minItems: sceneCount,
              maxItems: sceneCount,
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

      //console.log("LLM Response received:", llmResponse);

      if (!llmResponse || !llmResponse.storyboard_parts || llmResponse.storyboard_parts.length === 0) {
        throw new Error("AI could not process your story. Please try a different approach.");
      }

      // Ensure we have exactly the requested number of parts
      if (llmResponse.storyboard_parts.length < sceneCount) {
        //console.warn(`Only got ${llmResponse.storyboard_parts.length} parts instead of ${sceneCount}. Padding with additional scenes.`);
        // Add placeholder parts if we got fewer than requested
        while (llmResponse.storyboard_parts.length < sceneCount) {
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
        scene_count: sceneCount, // Add scene count to local data
        storyboard_parts: llmResponse.storyboard_parts.map(part => ({
          text: String(part.text || ""),
          image_prompt: String(part.image_prompt || ""),
          section_title: String(part.section_title || ""),
          image_url: null
        })),
        status: "processing"
      };

      //console.log("Creating story record...");
      
      try {
        createdStory = await Story.create(initialStoryboardData);
        setCurrentStoryboard(createdStory);
        
        // Immediately refresh credits/free stories count to update UI in real-time
        if (refreshCredits) {
          refreshCredits();
        }
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

      //console.log("Story created, starting image generation...");

      // STEP 1: Extract multiple characters from story
      const extractedCharacters = extractMultipleCharacters(llmResponse.character_persona);
      
      // AUTO-GENERATE character if not described in story
      let charactersToProcess = extractedCharacters;
      if (charactersToProcess.length === 0) {
        //console.log("🎭 No character described, auto-generating based on story...");
        const storyContext = llmResponse.title || "protagonist";
        charactersToProcess = [{
          name: "Main Character",
          description: `Main character for the story "${storyContext}" - photorealistic, detailed facial features, appropriate age and appearance for the story context`,
          fullDescription: `Main character for the story "${storyContext}" - photorealistic, detailed facial features, appropriate age and appearance for the story context`
        }];
      }

      // STEP 2: Generate character anchor images for each character
      const characterAnchors = new Map(); // Map character name -> { base64, url, description }
      
      // Check if user selected an uploaded character
      const uploadedCharacterUrl = 
        selectedCharacter?.referenceImageUrl ||
        selectedCharacter?.reference_image_url ||
        selectedCharacter?.imageUrl ||
        selectedCharacter?.image_url ||
        null;

      if (uploadedCharacterUrl && charactersToProcess.length > 0) {
        // Use uploaded character image as anchor for the first character
        try {
          const imageResponse = await fetch(uploadedCharacterUrl);
          const imageBlob = await imageResponse.blob();
          const reader = new FileReader();
          
          await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const base64String = reader.result.split(',')[1];
              const firstChar = charactersToProcess[0];
              characterAnchors.set(firstChar.name, {
                base64: base64String,
                url: uploadedCharacterUrl,
                description: firstChar.fullDescription
              });
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
          });
        } catch (conversionError) {
          console.error("⚠️ Failed to convert uploaded character:", conversionError);
        }
      }

      // Generate anchor images for all characters that don't have one yet
      for (const char of charactersToProcess) {
        if (!characterAnchors.has(char.name)) {
          try {
            //console.log(`🎭 Generating character anchor for ${char.name}...`);
            
            const anchorResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/ai/generate-character-anchor`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                characterDescription: char.fullDescription,
                userId: user?.id,
                storyboardId: createdStory?.id
              })
            });

            if (anchorResponse.ok) {
              const anchorData = await anchorResponse.json();
              if (anchorData.success && anchorData.base64) {
                characterAnchors.set(char.name, {
                  base64: anchorData.base64,
                  url: anchorData.url,
                  description: char.fullDescription
                });
                //console.log(`✅ Character anchor created for ${char.name}`);
              }
            }
          } catch (anchorError) {
            console.error(`⚠️ Failed to create character anchor for ${char.name}:`, anchorError);
            // Continue without anchor for this character
          }
        }
      }

      // Legacy single character ref for backward compatibility
      let characterRef = charactersToProcess.length > 0 
        ? charactersToProcess[0].fullDescription 
        : extractCharacterReference(llmResponse.character_persona);

      // Generate images
      const updatedParts = [...llmResponse.storyboard_parts];

      // Generate images for all storyboard parts
      for (let i = 0; i < updatedParts.length; i++) {
        let imageGenerated = false;
        let retryCount = 0;
        const maxRetries = 2;

        while (!imageGenerated && retryCount <= maxRetries) {
          try {
            //console.log(`Generating image for part ${i + 1} (attempt ${retryCount + 1})...`);

            // STEP 3: Detect which character(s) are in this scene
            const sceneText = `${updatedParts[i].image_prompt} ${updatedParts[i].text} ${updatedParts[i].section_title}`;
            const sceneCharacters = detectCharactersInScene(sceneText, charactersToProcess);
            
            // Use the first detected character (or first character if none detected)
            const sceneCharacter = sceneCharacters.length > 0 ? sceneCharacters[0] : charactersToProcess[0];
            const sceneCharacterRef = sceneCharacter ? sceneCharacter.fullDescription : characterRef;
            
            // Get the correct character anchor for this scene
            let sceneCharacterAnchorBase64 = null;
            if (sceneCharacter && characterAnchors.has(sceneCharacter.name)) {
              sceneCharacterAnchorBase64 = characterAnchors.get(sceneCharacter.name).base64;
              //console.log(`✅ Using character anchor for ${sceneCharacter.name} in scene ${i + 1}`);
            } else if (characterAnchors.size > 0) {
              // Fallback to first available anchor
              const firstAnchor = Array.from(characterAnchors.values())[0];
              sceneCharacterAnchorBase64 = firstAnchor.base64;
            }

            const optimizedPrompt = buildOptimizedPrompt(
              updatedParts[i].image_prompt,
              sceneCharacterRef,
              creativeBriefData?.visualStyle || "realistic",
              creativeBriefData?.colorTheme || "modern",
              // Prefer brief logo; fallback to selected brand logo
              (creativeBriefData?.logoUrl || selectedBrand?.logo_url || selectedBrand?.logoUrl),
              (creativeBriefData?.includeLogo ?? Boolean(selectedBrand?.logo_url || selectedBrand?.logoUrl))
            );

            //console.log(`Optimized prompt: ${optimizedPrompt}`);

            // Prepare character reference images: handle snake_case as well
            const referenceUrl = 
              selectedCharacter?.referenceImageUrl ||
              selectedCharacter?.reference_image_url ||
              selectedCharacter?.imageUrl ||
              selectedCharacter?.image_url ||
              null;
            const characterReferenceImages = referenceUrl ? [referenceUrl] : [];

          // Generate negative prompt for better results, enhanced for character consistency
          const negativePrompt = buildNegativePrompt("storyboard", Boolean(selectedCharacter || sceneCharacterAnchorBase64));

          const imageResult = await runwareImageGeneration({ 
            prompt: optimizedPrompt,
            negativePrompt: negativePrompt,
            visualStyle: creativeBriefData?.visualStyle || 'realistic',
            colorTheme: creativeBriefData?.colorTheme || 'modern',
            options: {
              visualStyle: creativeBriefData?.visualStyle || 'realistic',
              colorTheme: creativeBriefData?.colorTheme || 'modern',
              storyboardId: createdStory?.id || null,
              sceneIndex: i,
              negativePrompt: negativePrompt,
              characterReferenceBase64: sceneCharacterAnchorBase64 // Use correct character anchor for this scene
            },
            characterReferenceImages: characterReferenceImages,
            // FIXED WATERMARK: Always use StaiblTech logo (not custom logo)
            // StaiblTech logo watermark - using full URL
            logoUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png', // Fixed StaiblTech logo watermark
            includeLogo: true // Always apply StaiblTech watermark to every image
          });

            //console.log(`Image result for part ${i + 1}:`, imageResult);

            if (imageResult.data && imageResult.data.url) {
              updatedParts[i].image_url = imageResult.data.url;
              //console.log(`Successfully generated image for part ${i + 1}`);
              imageGenerated = true;
            } else {
              //console.error(`Failed to generate image for part ${i + 1}:`, imageResult);
              updatedParts[i].image_url = null;
              retryCount++;
              if (retryCount <= maxRetries) {
                //console.log(`Retrying image generation for part ${i + 1}...`);
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
              //console.log(`Timeout for part ${i + 1}, will retry...`);
              if (retryCount <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } else {
              //console.error(`Failed to generate image for part ${i + 1}:`, imageError.message);
              if (retryCount <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
        }
      }

      // Mark as completed and save to backend
      if (createdStory?.id) {
        // Convert character anchors Map to serializable format for storage
        const characterAnchorsData = Array.from(characterAnchors.entries()).map(([name, data]) => ({
          name: name,
          base64: data.base64,
          url: data.url,
          description: data.description
        }));

        const finalStoryboard = {
          ...createdStory,
          status: "completed",
          character_anchors: characterAnchorsData, // Store character anchors for regeneration
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
            const updateResponse = await Story.update(createdStory.id, {
              status: "completed",
              storyboard_parts: finalStoryboard.storyboard_parts,
              character_anchors: characterAnchorsData // Save character anchors to database
            });
            
            // Check if this was a free story or paid story
            if (updateResponse?.isFreeStory) {
              const remaining = updateResponse.freeStoriesRemaining || 0;
              toast.success(`Storyboard saved! Free story used. ${remaining} free stor${remaining === 1 ? 'y' : 'ies'} remaining.`);
            } else {
              toast.success('Storyboard saved successfully!');
            }
            
            // Refresh credits immediately after story completion
            await refreshCredits();
          } catch (updateError) {
            console.log("Could not update story completion in database:", updateError.message);
          }
        }
      }

      //console.log("Story generation completed successfully");

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

              {/* Scene Count Selection - DISABLED: Fixed to 4 images per story */}
              {/* <div className="space-y-3">
                <Label className="text-slate-700 font-semibold text-base md:text-lg">
                  Number of Scenes <span className="text-slate-500 font-normal">(Optional)</span>
                </Label>
                <Select value={sceneCount.toString()} onValueChange={(value) => setSceneCount(parseInt(value))}>
                  <SelectTrigger className="w-full border-slate-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select number of scenes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Scenes - Quick Overview</SelectItem>
                    <SelectItem value="4">4 Scenes - Standard Story</SelectItem>
                    <SelectItem value="5">5 Scenes - Detailed Narrative</SelectItem>
                    <SelectItem value="6">
                      <div className="flex items-center gap-2">
                        6 Scenes - Comprehensive
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Recommended</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="8">8 Scenes - In-Depth Analysis</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs md:text-sm text-slate-500 px-1">
                  📊 Choose how many visual scenes to create from your story. More scenes = more detailed storytelling. Each scene costs 1 credit. Default is 6 scenes.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-700 font-medium">
                        Will create {sceneCount} scene{sceneCount !== 1 ? 's' : ''} from your story
                      </span>
                    </div>
                    {isAuthenticated && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-600">Cost:</span>
                        <span className="text-sm font-semibold text-blue-800">
                          {sceneCount} credit{sceneCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div> */}
              
              {/* Fixed Scene Count Display */}
              {/* <div className="space-y-3">
                <Label className="text-slate-700 font-semibold text-base md:text-lg">
                  Number of Scenes
                </Label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-700 font-medium">
                        Will create 4 scenes from your story
                      </span>
                    </div>
                    {isAuthenticated && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-600">Cost:</span>
                        <span className="text-sm font-semibold text-blue-800">
                          4 credits
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-500 px-1">
                  📊 Each storyboard includes 4 visual scenes. Each scene costs 1 credit.
                </p>
              </div> */}

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
