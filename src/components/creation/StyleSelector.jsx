import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Only expose styles supported by Ideogram style_type
const VISUAL_STYLES = [
  { 
    key: "general", 
    name: "General", 
    description: "Balanced, default Ideogram look", 
    prompt: "balanced, high quality, detailed",
    icon: "✨",
    bgGradient: "from-slate-200 to-slate-400"
  },
  { 
    key: "realistic", 
    name: "Realistic", 
    description: "Photorealistic, professional photography", 
    prompt: "photorealistic, professional photography, high resolution, sharp focus",
    icon: "📸",
    bgGradient: "from-blue-600 to-blue-400"
  },
  { 
    key: "illustration", 
    name: "Illustration", 
    description: "Digital illustration, clean artwork", 
    prompt: "digital illustration, clean artwork, vibrant colors, smooth rendering",
    icon: "🖼️",
    bgGradient: "from-purple-500 to-pink-400"
  },
  { 
    key: "comic", 
    name: "Comic", 
    description: "Comic book style, bold outlines", 
    prompt: "comic book style, bold outlines, flat colors, pop art aesthetic",
    icon: "💥",
    bgGradient: "from-red-500 to-yellow-400"
  },
  { 
    key: "sketch", 
    name: "Sketch", 
    description: "Hand-drawn, pencil lines", 
    prompt: "pencil sketch, hand-drawn, artistic lines, monochrome sketch style",
    icon: "✏️",
    bgGradient: "from-gray-600 to-gray-400"
  },
  { 
    key: "watercolor", 
    name: "Watercolor", 
    description: "Soft textures, brushstrokes", 
    prompt: "watercolor painting, soft brush strokes, artistic texture, painted style",
    icon: "🎨",
    bgGradient: "from-pink-400 to-purple-300"
  },
  { 
    key: "vector", 
    name: "Vector", 
    description: "Clean, geometric, flat colors", 
    prompt: "vector art, clean lines, flat colors, geometric shapes, no noise, sharp edges",
    icon: "📐",
    bgGradient: "from-green-500 to-teal-400"
  }
];

const COLOR_THEMES = [
  { 
    key: "minimalistic", 
    name: "Minimalistic", 
    description: "Clean whites, soft grays, minimal palette",
    colors: ["#FFFFFF", "#F8F9FA", "#E9ECEF", "#DEE2E6"],
    prompt: "soft white and light gray color palette, minimalist aesthetic, clean whites, subtle grays"
  },
  { 
    key: "playful", 
    name: "Playful", 
    description: "Bright, cheerful, energetic colors",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
    prompt: "bright playful colors, coral pink, turquoise, sky blue, vibrant and energetic palette"
  },
  { 
    key: "modern", 
    name: "Modern", 
    description: "Contemporary, balanced, professional",
    colors: ["#2C3E50", "#3498DB", "#E74C3C", "#F39C12"],
    prompt: "modern color scheme, navy blue, bright blue, red accents, professional contemporary palette"
  },
  { 
    key: "futuristic", 
    name: "Futuristic", 
    description: "High-tech, cool tones, sleek",
    colors: ["#667EEA", "#764BA2", "#00D4AA", "#17A2B8"],
    prompt: "futuristic color palette, electric blue, purple, cyan, high-tech cool tones, sleek aesthetic"
  },
  { 
    key: "elegant", 
    name: "Elegant", 
    description: "Sophisticated, refined, luxury",
    colors: ["#2C2C54", "#40407A", "#D63031", "#F8F9FA"],
    prompt: "elegant color scheme, deep navy, rich purple, burgundy red, luxury sophisticated palette"
  },
  { 
    key: "rustic", 
    name: "Rustic", 
    description: "Natural, warm, organic tones",
    colors: ["#8B4513", "#228B22", "#CD853F", "#DEB887"],
    prompt: "rustic color palette, warm browns, forest green, golden tan, natural earth tones"
  },
  { 
    key: "vibrant", 
    name: "Vibrant", 
    description: "Bold, high contrast, dynamic",
    colors: ["#FF1744", "#FF9800", "#4CAF50", "#2196F3"],
    prompt: "vibrant color palette, bright red, orange, green, blue, bold contrasts, dynamic colors"
  },
  { 
    key: "monochrome", 
    name: "Monochrome", 
    description: "Black, white, grayscale tones",
    colors: ["#000000", "#424242", "#757575", "#FFFFFF"],
    prompt: "monochrome palette, black and white, grayscale tones, high contrast"
  }
];

export default function StyleSelector({ onStyleSelect, selectedStyle, selectedColorTheme }) {
  return (
    <div className="space-y-8">
      {/* Visual Style Selection */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Choose Visual Style</h3>
        <p className="text-xs text-slate-500 mb-4">Only styles supported by Ideogram are shown. Note: when using a character reference, Ideogram applies Realistic.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VISUAL_STYLES.map((style) => (
            <motion.div
              key={style.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedStyle === style.key 
                    ? 'ring-2 ring-purple-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onStyleSelect('visualStyle', style.key)}
              >
                <CardContent className="p-4">
                  <div className={`aspect-square bg-gradient-to-br ${style.bgGradient} rounded-lg mb-3 flex items-center justify-center`}>
                    <span className="text-3xl md:text-4xl">{style.icon}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 mb-1">{style.name}</h4>
                  <p className="text-xs text-slate-600 leading-tight">{style.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Color Theme Selection */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Choose Color Theme</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COLOR_THEMES.map((theme) => (
            <motion.div
              key={theme.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedColorTheme === theme.key 
                    ? 'ring-2 ring-purple-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onStyleSelect('colorTheme', theme.key)}
              >
                <CardContent className="p-4">
                  {/* Actual Color Preview */}
                  <div className="flex gap-1 mb-3 h-12 rounded-lg overflow-hidden">
                    {theme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 mb-1">{theme.name}</h4>
                  <p className="text-xs text-slate-600 leading-tight">{theme.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export the style data for use in other components
export { VISUAL_STYLES, COLOR_THEMES };