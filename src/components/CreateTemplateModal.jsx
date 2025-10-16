import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VISUAL_STYLES = [
  { value: 'general', label: 'General', description: 'Balanced, default Ideogram look' },
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic, professional photography' },
  { value: 'stylized', label: 'Stylized', description: 'Artistic, creative interpretation' },
  { value: 'design', label: 'Design', description: 'Clean, modern design aesthetic' },
  { value: 'fiction', label: 'Fiction', description: 'Fantasy and sci-fi themes' },
  { value: 'auto', label: 'Auto', description: 'Let AI choose the best style' }
];

const COLOR_THEMES = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary colors' },
  { value: 'vintage', label: 'Vintage', description: 'Retro, aged color palette' },
  { value: 'vibrant', label: 'Vibrant', description: 'Bright, energetic colors' },
  { value: 'monochrome', label: 'Monochrome', description: 'Black and white, grayscale' },
  { value: 'pastel', label: 'Pastel', description: 'Soft, muted colors' },
  { value: 'earth', label: 'Earth', description: 'Natural, organic tones' }
];

export default function CreateTemplateModal({ onTemplateCreated, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    visual_style: '',
    color_theme: '',
    logo_url: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast.error('Please log in to create templates');
      return;
    }

    if (!formData.name || !formData.visual_style || !formData.color_theme) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/styling-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Template created successfully!');
        if (onTemplateCreated) {
          onTemplateCreated(data.data);
        }
        if (onClose) {
          onClose();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Template</h2>
                <p className="text-sm text-gray-600">Save your styling preferences for future use</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Template Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., My Brand Style"
                  className="mt-1"
                  required
                />
              </div>

              {/* Visual Style */}
              <div>
                <Label htmlFor="visual_style" className="text-sm font-medium text-gray-700">
                  Visual Style *
                </Label>
                <Select
                  value={formData.visual_style}
                  onValueChange={(value) => handleInputChange('visual_style', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a visual style" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISUAL_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Theme */}
              <div>
                <Label htmlFor="color_theme" className="text-sm font-medium text-gray-700">
                  Color Theme *
                </Label>
                <Select
                  value={formData.color_theme}
                  onValueChange={(value) => handleInputChange('color_theme', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a color theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_THEMES.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div>
                          <div className="font-medium">{theme.label}</div>
                          <div className="text-xs text-gray-500">{theme.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logo URL */}
              <div>
                <Label htmlFor="logo_url" className="text-sm font-medium text-gray-700">
                  Logo URL (Optional)
                </Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this template's use case..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !formData.name || !formData.visual_style || !formData.color_theme}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
