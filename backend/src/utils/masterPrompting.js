// Backend Master Prompting System for Enhanced AI Image Generation

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
    ]
  },
  
  character: {
    prefix: "Professional character portrait:",
    qualityModifiers: [
      "studio lighting",
      "high resolution",
      "detailed facial features",
      "consistent character design",
      "professional photography"
    ]
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
    "cropped faces",
    "poor composition",
    "artifacts"
  ],
  
  // Quality enhancers
  qualityEnhancers: [
    "masterpiece",
    "best quality",
    "ultra detailed",
    "sharp focus",
    "professional grade",
    "high resolution"
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
  type = "storyboard",
  visualStyle = "realistic", 
  characterRef = "",
  lighting = "natural",
  priority = "quality",
  hasCharacterImage = false,
  forceCharacterInclusion = false,
  cameraAngle = "medium shot",
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
        let characterRequirement = ". ABSOLUTE REQUIREMENT: Character MUST be visible and prominently featured. Exact same facial features, identical hair style and color, same physical build";
        if (maintainClothing) {
          characterRequirement += ", same clothing style as reference image";
        }
        characterRequirement += ". Zero deviation from reference appearance";
        prompt += characterRequirement;
      } else {
        let characterRequirement = ". ABSOLUTE REQUIREMENT: Character MUST be clearly visible and prominently featured in this scene. Consistent facial features, hair, body type";
        if (maintainClothing) {
          characterRequirement += ", same clothing/outfit";
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
  }
  
  // Add lighting specification
  const lightingStyle = PROMPT_TECHNIQUES.lightingStyles[lighting] || PROMPT_TECHNIQUES.lightingStyles.natural;
  prompt += `. ${lightingStyle}`;
  
  // Add style-specific enhancements
  prompt += `. ${styleEnhancement.technical}`;
  
  // Add mood and atmosphere
  prompt += `. ${styleEnhancement.mood}`;
  
  // Add quality modifiers based on priority
  if (priority === "quality") {
    const qualityMods = template.qualityModifiers.slice(0, 3).join(", ");
    prompt += `. ${qualityMods}`;
  }
  
  // Add character consistency reinforcement for character-based storyboards
  if (characterRef && forceCharacterInclusion) {
    let consistencyRules = "CONSISTENCY RULES: Same person in every frame, identical face, same hairstyle, same body proportions";
    
    // Add clothing consistency only if maintainClothing is true
    if (maintainClothing) {
      consistencyRules += ", wearing the same outfit/clothing throughout the scene";
    }
    
    consistencyRules += ", recognizable as the exact same individual, no variation in core features, character identity must be unmistakable";
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
  const baseNegatives = PROMPT_TECHNIQUES.negativePrompts.slice(0, 8);
  
  // Add type-specific negatives
  const typeSpecificNegatives = {
    storyboard: ["inconsistent style", "poor framing"],
    character: ["inconsistent features", "multiple faces"]
  };
  
  const specificNegatives = typeSpecificNegatives[type] || [];
  
  // Add character consistency negatives if character is present
  const characterNegatives = hasCharacter ? [
    "different face",
    "different facial structure",
    "different eyes",
    "different nose",
    "different hair",
    "different hair color",
    "different hair length",
    "different hairstyle",
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
    "different body proportions",
    "different height",
    "different build",
    "different physique",
    "wrong hairstyle",
    "no character visible",
    "character missing",
    "character hidden",
    "character out of frame",
    "mismatched scene description",
    "inaccurate scene depiction",
    "wrong scene elements"
  ] : [];
  
  return [...baseNegatives, ...specificNegatives, ...characterNegatives].join(", ");
}

/**
 * Enhance existing prompts with master techniques
 * @param {string} originalPrompt - Original prompt to enhance
 * @param {Object} context - Context for enhancement
 * @returns {Object} Enhanced prompt data
 */
export function enhanceExistingPrompt(originalPrompt, context = {}) {
  const {
    type = "storyboard",
    visualStyle = "realistic",
    hasCharacter = false
  } = context;
  
  // Build enhanced version
  const enhanced = buildMasterPrompt({
    basePrompt: originalPrompt,
    type,
    visualStyle,
    characterRef: hasCharacter ? "consistent character design" : "",
    lighting: "natural",
    priority: "quality"
  });
  
  return {
    original: originalPrompt,
    enhanced,
    negative: buildNegativePrompt(type)
  };
}

export default {
  buildMasterPrompt,
  buildNegativePrompt,
  enhanceExistingPrompt,
  MASTER_TEMPLATES,
  PROMPT_TECHNIQUES,
  STYLE_ENHANCEMENTS
};
