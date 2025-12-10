// Master Prompting System for Enhanced AI Image Generation
// This module provides advanced prompt engineering techniques for better AI results

/**
 * Master prompt templates for different image types
 */
const MASTER_TEMPLATES = {
  storyboard: {
    prefix: "Professional cinematic storyboard frame:",
    qualityModifiers: [
      "8K resolution",
      "professional photography",
      "cinematic lighting",
      "sharp focus",
      "detailed composition"
    ],
    structure: "subject, action, setting, mood, technical"
  },
  
  character: {
    prefix: "Professional character portrait:",
    qualityModifiers: [
      "studio lighting",
      "high resolution",
      "detailed facial features",
      "consistent character design",
      "professional photography"
    ],
    structure: "character, pose, expression, background, lighting"
  },
  
  scene: {
    prefix: "Cinematic scene composition:",
    qualityModifiers: [
      "dramatic lighting",
      "depth of field",
      "atmospheric perspective",
      "professional cinematography",
      "detailed environment"
    ],
    structure: "environment, subjects, action, atmosphere, camera angle"
  }
};

/**
 * Advanced prompt engineering techniques
 */
const PROMPT_TECHNIQUES = {
  // Negative prompts to avoid common AI issues
  negativePrompts: [
    "blurry",
    "low quality",
    "distorted faces",
    "extra limbs",
    "text overlays",
    "watermarks",
    "text",
    "words",
    "letters",
    "captions",
    "subtitles",
    "labels",
    "scene markers",
    "metadata text",
    "timestamp",
    "duplicate subjects",
    "cropped faces"
  ],
  
  // Quality enhancers
  qualityEnhancers: [
    "masterpiece",
    "best quality",
    "ultra detailed",
    "sharp focus",
    "professional grade"
  ],
  
  // Composition guides
  compositionRules: [
    "rule of thirds",
    "balanced composition",
    "leading lines",
    "proper framing"
  ],
  
  // Lighting techniques
  lightingStyles: {
    dramatic: "dramatic lighting, high contrast, chiaroscuro",
    soft: "soft diffused lighting, even illumination",
    natural: "natural daylight, realistic shadows",
    cinematic: "cinematic lighting, three-point lighting setup",
    golden: "golden hour lighting, warm tones"
  }
};

/**
 * Style-specific enhancements
 */
const STYLE_ENHANCEMENTS = {
  realistic: {
    technical: "photorealistic, natural lighting, accurate proportions",
    mood: "authentic, lifelike, believable"
  },
  
  cinematic: {
    technical: "film grain, anamorphic lens, color grading",
    mood: "dramatic, epic, movie-like atmosphere"
  },
  
  artistic: {
    technical: "painterly style, artistic interpretation, creative composition",
    mood: "expressive, stylized, artistic vision"
  },
  
  professional: {
    technical: "corporate photography, clean composition, professional lighting",
    mood: "polished, business-appropriate, refined"
  }
};

/**
 * Build a master-enhanced prompt using advanced techniques
 * @param {Object} options - Prompt building options
 * @returns {string} Enhanced prompt
 */
export function buildMasterPrompt({
  basePrompt = "",
  type = "storyboard", // storyboard, character, scene
  visualStyle = "realistic",
  colorTheme = "modern",
  characterRef = "",
  logoContext = "",
  mood = "neutral",
  cameraAngle = "medium shot",
  lighting = "natural",
  priority = "quality", // quality, speed, creativity
  hasCharacterImage = false,
  forceCharacterInclusion = false,
  maintainClothing = true
}) {
  const template = MASTER_TEMPLATES[type] || MASTER_TEMPLATES.storyboard;
  const styleEnhancement = STYLE_ENHANCEMENTS[visualStyle] || STYLE_ENHANCEMENTS.realistic;
  
  // Start with template prefix
  let prompt = template.prefix + " ";
  
  // Add the core scene description
  prompt += basePrompt.trim();
  
  // Enhanced character consistency for storyboard scenes
  if (characterRef) {
    if (forceCharacterInclusion && type === "storyboard") {
      // ULTRA STRONG character inclusion with maximum consistency enforcement
      prompt += `. PRIMARY SUBJECT - MAIN CHARACTER (REQUIRED IN FRAME): ${characterRef.substring(0, 100)}`;
      if (hasCharacterImage) {
        let characterRequirement = ". ABSOLUTE REQUIREMENT: Character MUST be visible and prominently featured. ";
        characterRequirement += "EXACT same facial features (face structure, eyes, nose, mouth - zero deviation), ";
        characterRequirement += "IDENTICAL hair style and color (no variation), ";
        characterRequirement += "SAME physical build and physique (same body proportions, height, build), ";
        characterRequirement += "SAME personality characteristics and traits (consistent behavior, expressions, mannerisms)";
        if (maintainClothing) {
          characterRequirement += ", same clothing style as reference image";
        } else {
          characterRequirement += ". Clothing may vary if day/setting/time changes, but face, physique, hair, and characteristics MUST remain identical";
        }
        characterRequirement += ". Zero deviation from reference appearance in physical features, face, hair, and physique";
        prompt += characterRequirement;
      } else {
        let characterRequirement = ". ABSOLUTE REQUIREMENT: Character MUST be clearly visible and prominently featured in this scene. ";
        characterRequirement += "Consistent facial features (same face structure across all scenes), ";
        characterRequirement += "same hair style and color (no variation), ";
        characterRequirement += "same body type and physique (consistent physical build), ";
        characterRequirement += "same personality characteristics (consistent traits, behavior, expressions)";
        if (maintainClothing) {
          characterRequirement += ", same clothing/outfit";
        } else {
          characterRequirement += ". Clothing may vary if day/setting/time changes, but face, physique, hair, and characteristics MUST remain identical";
        }
        characterRequirement += " across ALL scenes. Character is the focal point";
        prompt += characterRequirement;
      }
      prompt += ". Character placement: CENTER or PROMINENT POSITION in frame. Character visibility: MANDATORY";
    } else {
      prompt += `. Featured Character: ${characterRef.substring(0, 80)}`;
    }
  }
  
  // Add camera and composition details with character focus
  if (characterRef && forceCharacterInclusion) {
    prompt += `. ${cameraAngle} focusing on character, character-centric composition`;
  } else {
    prompt += `. ${cameraAngle}, ${PROMPT_TECHNIQUES.compositionRules[0]}`;
  }
  
  // Add lighting specification
  const lightingStyle = PROMPT_TECHNIQUES.lightingStyles[lighting] || PROMPT_TECHNIQUES.lightingStyles.natural;
  prompt += `. ${lightingStyle}`;
  
  // Add style-specific enhancements
  prompt += `. ${styleEnhancement.technical}`;
  
  // Add mood and atmosphere
  prompt += `. ${styleEnhancement.mood}`;
  
  // Add logo context if needed
  if (logoContext) {
    prompt += `. ${logoContext}`;
  }
  
  // Add quality modifiers based on priority
  if (priority === "quality") {
    const qualityMods = template.qualityModifiers.slice(0, 3).join(", ");
    prompt += `. ${qualityMods}`;
  }
  
  // Add character consistency reinforcement for character-based storyboards
  if (characterRef && forceCharacterInclusion) {
    let consistencyRules = "CONSISTENCY RULES - ABSOLUTE REQUIREMENTS (NON-NEGOTIABLE): ";
    consistencyRules += "Same person in every frame, IDENTICAL facial features (same face structure, eyes, nose, mouth, expression style), ";
    consistencyRules += "IDENTICAL hair style and color (no variation in hair length, color, or style), ";
    consistencyRules += "SAME body proportions and physique (same height, build, body type, physical characteristics), ";
    consistencyRules += "SAME personality traits and characteristics (consistent behavior, mannerisms, expressions), ";
    
    // Add clothing consistency only if maintainClothing is true
    if (maintainClothing) {
      consistencyRules += "wearing the same outfit/clothing throughout the scene, ";
    } else {
      consistencyRules += "clothing may vary based on day/setting/time changes, but ";
    }
    
    consistencyRules += "recognizable as the EXACT same individual across ALL scenes. ";
    consistencyRules += "NO variation in core physical features, facial structure, hair, or body type. ";
    consistencyRules += "Character identity must be unmistakable and consistent. ";
    consistencyRules += "ONLY clothing can change (if day/setting/time changes), but face, physique, hair, and characteristics MUST remain identical.";
    prompt += `. ${consistencyRules}`;
  }
  
  // Add final quality enhancers
  const enhancers = PROMPT_TECHNIQUES.qualityEnhancers.slice(0, 2).join(", ");
  prompt += `. ${enhancers}`;
  
  return prompt;
}

/**
 * Generate negative prompt for better AI results
 * @param {string} type - Image type
 * @param {boolean} hasCharacter - Whether character consistency is important
 * @returns {string} Negative prompt
 */
export function buildNegativePrompt(type = "storyboard", hasCharacter = false) {
  const baseNegatives = PROMPT_TECHNIQUES.negativePrompts.slice(0, 6);
  
  // Add type-specific negatives
  const typeSpecificNegatives = {
    storyboard: ["inconsistent style", "poor composition"],
    character: ["inconsistent features", "multiple faces"],
    scene: ["cluttered composition", "poor perspective"]
  };
  
  const specificNegatives = typeSpecificNegatives[type] || [];
  
  // Add character consistency negatives if character is present
  const characterNegatives = hasCharacter ? [
    "different face",
    "different hair",
    "changing appearance",
    "inconsistent clothing",
    "multiple characters with same face",
    "face swap",
    "identity change",
    "appearance inconsistency",
    "character variation",
    "different person",
    "altered features",
    "modified appearance",
    "wrong character",
    "character replacement",
    "face morphing",
    "inconsistent facial features",
    "different body type",
    "wrong hairstyle",
    "no character visible",
    "character missing",
    "character hidden",
    "character out of frame",
    "unnatural pose",
    "awkward positioning",
    "unrealistic body angle",
    "facing wrong direction for activity",
    "unnatural posture",
    "stiff pose",
    "forced composition"
  ] : [];
  
  return [...baseNegatives, ...specificNegatives, ...characterNegatives].join(", ");
}

/**
 * Analyze and enhance existing prompts
 * @param {string} originalPrompt - Original prompt to enhance
 * @param {Object} context - Context for enhancement
 * @returns {Object} Enhanced prompt data
 */
export function enhanceExistingPrompt(originalPrompt, context = {}) {
  const {
    type = "storyboard",
    visualStyle = "realistic",
    hasCharacter = false,
    needsLogo = false
  } = context;
  
  // Analyze prompt structure
  const analysis = analyzePrompt(originalPrompt);
  
  // Build enhanced version
  const enhanced = buildMasterPrompt({
    basePrompt: originalPrompt,
    type,
    visualStyle,
    characterRef: hasCharacter ? "consistent character design" : "",
    logoContext: needsLogo ? "company logo placement" : "",
    lighting: analysis.suggestedLighting,
    cameraAngle: analysis.suggestedAngle
  });
  
  return {
    original: originalPrompt,
    enhanced,
    negative: buildNegativePrompt(type),
    improvements: analysis.suggestions,
    confidence: analysis.confidence
  };
}

/**
 * Analyze prompt quality and suggest improvements
 * @param {string} prompt - Prompt to analyze
 * @returns {Object} Analysis results
 */
function analyzePrompt(prompt) {
  const words = prompt.toLowerCase().split(/\s+/);
  const analysis = {
    length: words.length,
    hasLighting: words.some(w => ['lighting', 'light', 'shadow', 'bright', 'dark'].includes(w)),
    hasComposition: words.some(w => ['composition', 'frame', 'angle', 'shot'].includes(w)),
    hasQuality: words.some(w => ['quality', 'detailed', 'sharp', 'clear'].includes(w)),
    hasAction: words.some(w => ['action', 'moving', 'dynamic', 'gesture'].includes(w)),
    suggestions: [],
    confidence: 0.7
  };
  
  // Generate suggestions
  if (!analysis.hasLighting) {
    analysis.suggestions.push("Add lighting description");
  }
  if (!analysis.hasComposition) {
    analysis.suggestions.push("Specify camera angle or composition");
  }
  if (!analysis.hasQuality) {
    analysis.suggestions.push("Include quality modifiers");
  }
  if (analysis.length < 10) {
    analysis.suggestions.push("Add more descriptive details");
  }
  
  // Calculate confidence based on completeness
  analysis.confidence = Math.min(0.9, 0.5 + (analysis.length / 20) + 
    (analysis.hasLighting ? 0.1 : 0) +
    (analysis.hasComposition ? 0.1 : 0) +
    (analysis.hasQuality ? 0.1 : 0));
  
  // Suggest lighting and angle based on content
  analysis.suggestedLighting = words.some(w => ['dramatic', 'intense', 'action'].includes(w)) ? 
    'dramatic' : 'natural';
  analysis.suggestedAngle = words.some(w => ['close', 'face', 'portrait'].includes(w)) ? 
    'close-up' : 'medium shot';
  
  return analysis;
}

/**
 * Get prompt templates for different scenarios
 * @param {string} scenario - Scenario type
 * @returns {Object} Template data
 */
export function getPromptTemplate(scenario) {
  const templates = {
    newsStory: {
      structure: "Professional news photography: [subject] [action] in [setting]. Journalistic style, natural lighting, documentary approach.",
      example: "Professional news photography: business executive announcing quarterly results in modern conference room. Journalistic style, natural lighting, documentary approach."
    },
    
    characterIntroduction: {
      structure: "Character introduction shot: [character description] [pose/expression] in [environment]. Cinematic lighting, character focus, detailed features.",
      example: "Character introduction shot: confident female CEO in navy suit standing in glass office. Cinematic lighting, character focus, detailed features."
    },
    
    actionScene: {
      structure: "Dynamic action scene: [characters] [action] in [location]. High energy, dramatic lighting, motion blur effects, cinematic composition.",
      example: "Dynamic action scene: team of developers collaborating intensely around computer screens in modern office. High energy, dramatic lighting, motion blur effects, cinematic composition."
    },
    
    establishingShot: {
      structure: "Establishing shot: [wide view of location] showing [key elements]. Atmospheric perspective, environmental storytelling, cinematic framing.",
      example: "Establishing shot: wide view of bustling tech startup office showing open workspace and collaboration areas. Atmospheric perspective, environmental storytelling, cinematic framing."
    }
  };
  
  return templates[scenario] || templates.newsStory;
}

/**
 * Enhance scene prompt to force character inclusion and consistency
 * @param {string} scenePrompt - Original scene prompt
 * @param {Object} character - Character information
 * @param {Object} options - Enhancement options
 * @returns {string} Enhanced scene prompt with character focus
 */
export function enhanceSceneForCharacter(scenePrompt, character, options = {}) {
  const {
    visualStyle = "realistic",
    colorTheme = "modern",
    lighting = "natural",
    cameraAngle = "medium shot"
  } = options;

  // Build comprehensive character reference
  let characterRef = "";
  if (character) {
    characterRef = character.name || "";
    if (character.appearance) characterRef += `, ${character.appearance}`;
    if (character.personality) characterRef += `, personality: ${character.personality}`;
    if (character.description) characterRef += `. ${character.description}`;
  }

  // Analyze scene to determine best character integration
  const sceneWords = scenePrompt.toLowerCase();
  const isActionScene = sceneWords.includes('action') || sceneWords.includes('moving') || sceneWords.includes('running');
  const isDialogScene = sceneWords.includes('speaking') || sceneWords.includes('talking') || sceneWords.includes('conversation');
  const isEmotionalScene = sceneWords.includes('sad') || sceneWords.includes('happy') || sceneWords.includes('angry');
  
  // Detect if scene prompt mentions changing clothes OR day/setting changes (for clothing consistency)
  // Check for explicit clothing change mentions
  const explicitClothingChange = sceneWords.includes('change clothes') || 
                                sceneWords.includes('different outfit') || 
                                sceneWords.includes('new clothes') ||
                                sceneWords.includes('wearing different') ||
                                sceneWords.includes('changed outfit') ||
                                sceneWords.includes('switched clothes');
  
  // Check for day/night transitions (clothing can change when day changes)
  const dayKeywords = ['day', 'morning', 'afternoon', 'dawn', 'sunrise', 'daylight', 'sunny day'];
  const nightKeywords = ['night', 'evening', 'dusk', 'sunset', 'midnight', 'dark', 'nighttime', 'late night'];
  const timeKeywords = ['next day', 'following day', 'later that day', 'the next morning', 'that evening'];
  
  // Extract time indicators from the prompt
  const hasDayTime = dayKeywords.some(keyword => sceneWords.includes(keyword));
  const hasNightTime = nightKeywords.some(keyword => sceneWords.includes(keyword));
  const hasTimeTransition = timeKeywords.some(keyword => sceneWords.includes(keyword));
  
  // Check for major setting changes that might warrant clothing change
  const settingChangeKeywords = ['different location', 'new setting', 'another place', 'different venue', 
                                  'indoor', 'outdoor', 'inside', 'outside', 'at home', 'at office', 
                                  'at work', 'at event', 'at party', 'formal event', 'casual setting'];
  const hasSettingChange = settingChangeKeywords.some(keyword => sceneWords.includes(keyword));
  
  // Allow clothing change if:
  // 1. Explicitly mentioned, OR
  // 2. Day/night transition detected, OR
  // 3. Time transition mentioned, OR
  // 4. Major setting change with context
  const allowClothingChange = explicitClothingChange || 
                               hasTimeTransition || 
                               (hasDayTime && hasNightTime) || // Both day and night mentioned
                               (hasSettingChange && (hasDayTime || hasNightTime || hasTimeTransition));
  
  const maintainClothing = !allowClothingChange; // Maintain clothing unless change is justified
  
  // Detect activity-specific camera angles and positioning for natural composition
  const activityComposition = {
    // Working/Computer activities - should be from side or over shoulder
    coding: sceneWords.match(/\b(cod(e|ing)|programming|typing|laptop|computer|keyboard|screen)\b/i),
    writing: sceneWords.match(/\b(writ(e|ing)|typing|document|paper|note)\b/i),
    reading: sceneWords.match(/\b(read(ing)?|book|newspaper|magazine|document)\b/i),
    
    // Eating/Drinking - can be front or side
    eating: sceneWords.match(/\b(eat(ing)?|meal|food|dinner|lunch|breakfast)\b/i),
    drinking: sceneWords.match(/\b(drink(ing)?|coffee|tea|water|beverage)\b/i),
    
    // Talking/Communication - should face camera or another person
    talking: sceneWords.match(/\b(talk(ing)?|speak(ing)?|conversation|discuss|phone|call)\b/i),
    
    // Movement - dynamic angles
    walking: sceneWords.match(/\b(walk(ing)?|stroll|stride|step)\b/i),
    running: sceneWords.match(/\b(run(ning)?|jog(ging)?|sprint)\b/i),
    
    // Thinking/Contemplating - can be profile or 3/4 view
    thinking: sceneWords.match(/\b(think(ing)?|contemplat(e|ing)|ponder|reflect)\b/i)
  };
  
  // Determine natural camera angle based on activity
  let naturalComposition = "";
  if (activityComposition.coding || activityComposition.writing) {
    naturalComposition = "over-the-shoulder view or side profile showing the person engaged with the laptop/screen, NOT facing camera directly";
  } else if (activityComposition.reading) {
    naturalComposition = "side view or 3/4 angle showing person focused on reading material, natural reading posture";
  } else if (activityComposition.eating || activityComposition.drinking) {
    naturalComposition = "natural eating/drinking posture, can be front view or side angle";
  } else if (activityComposition.talking) {
    naturalComposition = "facing camera or another person, engaged in conversation, natural speaking posture";
  } else if (activityComposition.walking || activityComposition.running) {
    naturalComposition = "dynamic movement captured from side or 3/4 angle, showing motion and direction";
  } else if (activityComposition.thinking) {
    naturalComposition = "contemplative pose, profile or 3/4 view, thoughtful expression";
  }

  // Modify scene prompt to FORCE character inclusion
  let enhancedScene = scenePrompt;
  
  // ALWAYS inject character name at the start for maximum visibility
  if (character?.name) {
    const characterName = character.name;
    const lowerScene = sceneWords;
    
    // Check if character is already mentioned
    if (!lowerScene.includes(characterName.toLowerCase())) {
      // Force character at the beginning of every scene
      if (isActionScene) {
        enhancedScene = `${characterName} is the main subject actively ${scenePrompt}`;
      } else if (isDialogScene) {
        enhancedScene = `${characterName} prominently featured ${scenePrompt}`;
      } else if (isEmotionalScene) {
        enhancedScene = `Close focus on ${characterName} as protagonist: ${scenePrompt}`;
      } else {
        enhancedScene = `${characterName} as central character in scene: ${scenePrompt}`;
      }
    } else {
      // Character mentioned but reinforce their importance
      enhancedScene = `PRIMARY FOCUS: ${scenePrompt}`;
    }
    
    // Add explicit instruction to ensure character visibility AND natural composition
    enhancedScene += `. ${characterName} must be clearly visible, in focus, and prominently placed in the composition`;
    
    // Add natural camera angle for the activity
    if (naturalComposition) {
      enhancedScene += `. Camera angle: ${naturalComposition}. Realistic and natural body positioning appropriate for the activity`;
    }
  }

  // Use master prompting with character focus
  return buildMasterPrompt({
    basePrompt: enhancedScene,
    type: "storyboard",
    visualStyle,
    colorTheme,
    characterRef,
    lighting,
    cameraAngle,
    priority: "quality",
    hasCharacterImage: Boolean(character?.imageUrl || character?.image_url),
    forceCharacterInclusion: true,
    maintainClothing: maintainClothing // Maintain clothing unless day/setting changes or explicitly mentioned
  });
}

/**
 * Build character consistency prompt for all scenes in a storyboard
 * @param {Array} scenes - Array of scene objects
 * @param {Object} character - Character information
 * @param {Object} globalOptions - Global styling options
 * @returns {Array} Enhanced scene prompts
 */
export function buildCharacterConsistentScenes(scenes, character, globalOptions = {}) {
  if (!character || !scenes?.length) return scenes;

  return scenes.map((scene, index) => ({
    ...scene,
    enhanced_prompt: enhanceSceneForCharacter(
      scene.image_prompt || scene.text || "",
      character,
      {
        ...globalOptions,
        sceneIndex: index,
        totalScenes: scenes.length
      }
    )
  }));
}

export default {
  buildMasterPrompt,
  buildNegativePrompt,
  enhanceExistingPrompt,
  getPromptTemplate,
  enhanceSceneForCharacter,
  buildCharacterConsistentScenes,
  MASTER_TEMPLATES,
  PROMPT_TECHNIQUES,
  STYLE_ENHANCEMENTS
};
