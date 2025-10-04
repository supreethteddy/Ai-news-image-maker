import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function BrandProfileSelector({ onBrandSelect, onClose, selectedBrand, onCreateBrand }) {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('brandProfiles');
      const profiles = stored ? JSON.parse(stored) : [];
      setBrands(profiles);
    } catch (error) {
      console.error("Error loading brand profiles:", error);
      setBrands([]);
    }
    setIsLoading(false);
  };

  const deleteBrand = (brandId) => {
    if (!confirm('Are you sure you want to delete this brand profile?')) {
      return;
    }

    try {
      const updatedBrands = brands.filter(brand => brand.id !== brandId);
      localStorage.setItem('brandProfiles', JSON.stringify(updatedBrands));
      setBrands(updatedBrands);
      toast.success('Brand profile deleted successfully');
    } catch (error) {
      console.error("Error deleting brand profile:", error);
      toast.error('Failed to delete brand profile');
    }
  };

  const setAsDefault = (brandId) => {
    try {
      const updatedBrands = brands.map(brand => ({
        ...brand,
        is_default: brand.id === brandId
      }));
      localStorage.setItem('brandProfiles', JSON.stringify(updatedBrands));
      setBrands(updatedBrands);
      toast.success('Brand profile set as default');
    } catch (error) {
      console.error("Error setting brand profile as default:", error);
      toast.error('Failed to set brand profile as default');
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Loading Brand Profiles...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Choose Brand Profile
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto">
          {brands.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No brand profiles yet</p>
              <p className="text-sm text-gray-500 mb-6">
                Create your first brand profile to get started.
              </p>
              <Button onClick={() => {
                onClose();
                if (onCreateBrand) onCreateBrand();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Brand Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {brands.length} brand profile{brands.length !== 1 ? 's' : ''} saved
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    onClose();
                    if (onCreateBrand) onCreateBrand();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>

              <div className="grid gap-4">
                {brands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBrand?.id === brand.id ? 'ring-2 ring-purple-500' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex-1"
                            onClick={() => onBrandSelect(brand)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{brand.brand_name}</h3>
                              {brand.is_default && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            
                            {brand.brand_personality && (
                              <p className="text-sm text-gray-600 mb-2">
                                {brand.brand_personality}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              {brand.visual_style_preference && (
                                <Badge variant="outline" className="text-xs">
                                  {brand.visual_style_preference}
                                </Badge>
                              )}
                              {brand.mood_preference && (
                                <Badge variant="outline" className="text-xs">
                                  {brand.mood_preference}
                                </Badge>
                              )}
                            </div>
                            
                            {brand.target_audience && (
                              <p className="text-xs text-gray-500">
                                Target: {brand.target_audience}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {!brand.is_default && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAsDefault(brand.id);
                                }}
                                title="Set as default"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBrand(brand.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                              title="Delete brand profile"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
