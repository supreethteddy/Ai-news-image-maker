import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VISUAL_STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'classic', label: 'Classic', description: 'Timeless, traditional style' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, uncluttered design' },
  { value: 'bold', label: 'Bold', description: 'Strong, impactful visuals' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated, refined style' },
  { value: 'playful', label: 'Playful', description: 'Fun, creative approach' }
];

const MOOD_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Business-focused, serious' },
  { value: 'friendly', label: 'Friendly', description: 'Approachable, warm' },
  { value: 'energetic', label: 'Energetic', description: 'Dynamic, exciting' },
  { value: 'calm', label: 'Calm', description: 'Peaceful, relaxed' },
  { value: 'innovative', label: 'Innovative', description: 'Cutting-edge, forward-thinking' },
  { value: 'trustworthy', label: 'Trustworthy', description: 'Reliable, dependable' }
];

export default function CreateBrandModal({ onBrandCreated, onClose }) {
  const [formData, setFormData] = useState({
    brand_name: '',
    brand_personality: '',
    visual_style_preference: '',
    mood_preference: '',
    target_audience: '',
    design_language_notes: '',
    core_colors: [],
    is_default: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.brand_name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    setIsLoading(true);
    try {
      // Get existing profiles from localStorage
      const stored = localStorage.getItem('brandProfiles');
      const existingProfiles = stored ? JSON.parse(stored) : [];

      // Create new profile
      const newProfile = {
        id: `brand-${Date.now()}`,
        ...formData,
        is_default: existingProfiles.length === 0, // First profile is default
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      const updatedProfiles = [...existingProfiles, newProfile];
      localStorage.setItem('brandProfiles', JSON.stringify(updatedProfiles));

      toast.success('Brand profile created successfully!');
      onBrandCreated(newProfile);
      onClose();
    } catch (error) {
      console.error('Error creating brand profile:', error);
      toast.error('Failed to create brand profile');
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Brand Profile
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name *</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Enter your brand name"
                required
              />
            </div>

            {/* Brand Personality */}
            <div className="space-y-2">
              <Label htmlFor="brand_personality">Brand Personality</Label>
              <Textarea
                id="brand_personality"
                value={formData.brand_personality}
                onChange={(e) => handleInputChange('brand_personality', e.target.value)}
                placeholder="Describe your brand's personality and values..."
                rows={3}
              />
            </div>

            {/* Visual Style Preference */}
            <div className="space-y-2">
              <Label>Visual Style Preference</Label>
              <Select 
                value={formData.visual_style_preference} 
                onValueChange={(value) => handleInputChange('visual_style_preference', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a visual style" />
                </SelectTrigger>
                <SelectContent>
                  {VISUAL_STYLE_OPTIONS.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-gray-500">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mood Preference */}
            <div className="space-y-2">
              <Label>Mood Preference</Label>
              <Select 
                value={formData.mood_preference} 
                onValueChange={(value) => handleInputChange('mood_preference', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      <div>
                        <div className="font-medium">{mood.label}</div>
                        <div className="text-sm text-gray-500">{mood.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="e.g., Young professionals, Tech enthusiasts, Small businesses"
              />
            </div>

            {/* Design Language Notes */}
            <div className="space-y-2">
              <Label htmlFor="design_language_notes">Design Language Notes</Label>
              <Textarea
                id="design_language_notes"
                value={formData.design_language_notes}
                onChange={(e) => handleInputChange('design_language_notes', e.target.value)}
                placeholder="Any specific design requirements, preferences, or guidelines..."
                rows={3}
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => handleInputChange('is_default', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="is_default" className="text-sm">
                Set as default brand profile
              </Label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Brand Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
