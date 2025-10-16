import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Palette, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TemplatesSidebar({ onTemplateSelect, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadTemplates();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const loadTemplates = async () => {
    if (!isAuthenticated || !token) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/styling-templates`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      } else {
        toast.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error('Failed to fetch templates');
    }
    setIsLoading(false);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!isAuthenticated || !token) {
      toast.error('Please log in to delete templates');
      return;
    }

    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/styling-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        loadTemplates(); // Reload the list
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleTemplateSelect = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect({
        visualStyle: template.visual_style,
        colorTheme: template.color_theme,
        logoUrl: template.logo_url,
        description: template.description
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const getStyleColor = (style) => {
    const colors = {
      'realistic': 'bg-green-100 text-green-800 border-green-200',
      'cartoon': 'bg-blue-100 text-blue-800 border-blue-200',
      'anime': 'bg-pink-100 text-pink-800 border-pink-200',
      'watercolor': 'bg-purple-100 text-purple-800 border-purple-200',
      'oil_painting': 'bg-orange-100 text-orange-800 border-orange-200',
      'sketch': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[style] || colors.realistic;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Saved Templates</h2>
                <p className="text-sm text-gray-600">Choose a styling template for your story</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading templates...</p>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
                <p className="text-gray-600 mb-4">Please log in to view your saved templates.</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-4">Create your first styling template to get started.</p>
                <Button
                  onClick={onClose}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                {template.name}
                              </CardTitle>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge className={getStyleColor(template.visual_style)}>
                                  {template.visual_style}
                                </Badge>
                                <Badge variant="outline" className="text-gray-600">
                                  {template.color_theme}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {template.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleTemplateSelect(template)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {templates.length} template{templates.length !== 1 ? 's' : ''} saved
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
