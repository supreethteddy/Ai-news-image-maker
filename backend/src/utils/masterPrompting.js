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
      // Character description first
      prompt += `. MAIN CHARACTER: ${characterRef.substring(0, 100)}`;
      
      // IMMEDIATE consistency enforcement - right after character description
      let consistencyRules = ". CONSISTENCY: Same exact person in every scene - identical face, identical hair, identical body, identical age, same facial features";
      if (maintainClothing) {
        consistencyRules += ", same clothing";
      }
      consistencyRules += ". Character must be prominently visible and recognizable as the exact same individual";
      prompt += consistencyRules;
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
