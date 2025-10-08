
import React, { useState, useEffect } from "react";
// BrandProfile import removed - using user profiles only
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Palette, Save, Check, Loader2, Upload, Image, Trash2, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import StyleSelector from "./StyleSelector";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SimplifiedCreativeBrief({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [brandProfiles, setBrandProfiles] = useState([]);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState(null);
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stylingTemplates, setStylingTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { isAuthenticated, token } = useAuth();
  
  const [briefData, setBriefData] = useState({
    brand_name: "",
    visual_style: "realistic",
    color_theme: "modern",
    logoUrl: null,
    includeLogo: false,
    description: ""
  });

  useEffect(() => {
    loadBrandProfiles();
    if (isAuthenticated) {
      loadStylingTemplates();
    }
  }, [isAuthenticated, token]);

  // Auto-load the default template or most recent template if available
  useEffect(() => {
    if (stylingTemplates.length > 0 && !selectedTemplate) {
      // First try to find a default template
      const defaultTemplate = stylingTemplates.find(t => t.isDefault);
      const templateToLoad = defaultTemplate || stylingTemplates[0]; // Fallback to most recent
      loadTemplate(templateToLoad);
    }
  }, [stylingTemplates, selectedTemplate]);

  const loadBrandProfiles = () => {
    try {
      const stored = localStorage.getItem('brandProfiles');
      const profiles = stored ? JSON.parse(stored) : [];
      setBrandProfiles(profiles);
      
      const defaultProfile = profiles.find(p => p.is_default);
      if (defaultProfile) {
        setSelectedBrandProfile(defaultProfile);
        setBriefData(prev => ({ ...prev, ...defaultProfile }));
      }
    } catch (error) {
      console.error("Error loading brand profiles:", error);
      setBrandProfiles([]);
    }
  };

  const loadStylingTemplates = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch('https://ai-news-image-maker.onrender.com/api/styling-templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStylingTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Error loading styling templates:", error);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    if (!isAuthenticated || !token) {
      toast.error('Please log in to upload logos');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://ai-news-image-maker.onrender.com/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setBriefData(prev => ({ ...prev, logoUrl: data.data.logoUrl }));
        setLogoPreview(URL.createObjectURL(file));
        toast.success('Logo uploaded successfully!');
      } else {
        const errorData = await response.json();
        toast.error('Failed to upload logo: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
    setUploadingLogo(false);
  };

  const saveStylingTemplate = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Please log in to save templates');
      return;
    }

    if (!briefData.brand_name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('https://ai-news-image-maker.onrender.com/api/styling-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: briefData.brand_name,
          visualStyle: briefData.visual_style,
          colorTheme: briefData.color_theme,
          logoUrl: briefData.logoUrl || undefined,
          includeLogo: briefData.includeLogo,
          description: briefData.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStylingTemplates(prev => [data.data, ...prev]);
        toast.success('Template saved successfully!');
      } else {
        toast.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
    setSaving(false);
  };

  const loadTemplate = (template) => {
    setSelectedTemplate(template);
    setBriefData(prev => ({
      ...prev,
      brand_name: template.name,
      visual_style: template.visualStyle,
      color_theme: template.colorTheme,
      logoUrl: template.logoUrl,
      includeLogo: template.includeLogo || false,
      description: template.description
    }));
    if (template.logoUrl) {
      setLogoPreview(template.logoUrl);
    }
  };

  const setAsDefault = async (template) => {
    if (!isAuthenticated || !token) return;
    
    try {
      const response = await fetch(`https://ai-news-image-maker.onrender.com/api/styling-templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isDefault: true
        })
      });

      if (response.ok) {
        toast.success('Template set as default!');
        loadStylingTemplates(); // Reload to update the list
      } else {
        toast.error('Failed to set as default');
      }
    } catch (error) {
      console.error('Error setting default template:', error);
      toast.error('Failed to set as default');
    }
  };

  const handleStyleSelect = (type, value) => {
    setBriefData(prev => ({
      ...prev,
      [type === 'visualStyle' ? 'visual_style' : 'color_theme']: value
    }));
  };

  const saveBrandProfile = () => {
    // FIX: Defensive check before calling trim()
    if (typeof briefData.brand_name !== 'string' || !briefData.brand_name.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    
    setSaving(true);
    try {
      const profileData = {
        id: `brand-${Date.now()}`,
        brand_name: briefData.brand_name,
        core_colors: briefData.core_colors || [],
        brand_personality: briefData.brand_personality || '',
        visual_style_preference: briefData.visual_style || '',
        mood_preference: briefData.mood_preference || '',
        target_audience: briefData.target_audience || '',
        design_language_notes: briefData.design_language_notes || '',
        reference_images: briefData.reference_images || [],
        is_default: brandProfiles.length === 0, // First profile is default
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedProfiles = [...brandProfiles, profileData];
      localStorage.setItem('brandProfiles', JSON.stringify(updatedProfiles));
      setBrandProfiles(updatedProfiles);
      setSelectedBrandProfile(profileData);
      setIsCreatingNewProfile(false);
      toast.success('Brand profile saved successfully!');
    } catch (error) {
      console.error("Error saving brand profile:", error);
      toast.error('Failed to save brand profile');
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    const finalData = {
      brandProfile: selectedBrandProfile,
      visualStyle: briefData.visual_style,
      colorTheme: briefData.color_theme,
      logoUrl: briefData.logoUrl,
      includeLogo: briefData.includeLogo,
      templateName: briefData.brand_name
    };

    onComplete(finalData);
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Palette className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Brand Style Setup</h2>
        <p className="text-slate-600">Choose your brand and visual preferences for consistent storyboards</p>
        
        {/* Quick Start Button */}
        {isAuthenticated && stylingTemplates.length > 0 && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                const defaultTemplate = stylingTemplates.find(t => t.isDefault);
                const templateToUse = defaultTemplate || stylingTemplates[0];
                loadTemplate(templateToUse);
                handleComplete();
              }}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Quick Start with {stylingTemplates.find(t => t.isDefault) ? 'Default' : 'Last'} Template
            </Button>
          </div>
        )}
      </div>

      {/* Saved Templates Section */}
      {isAuthenticated && stylingTemplates.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Load Saved Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {stylingTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{template.name}</h3>
                        {template.isDefault && (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {template.visualStyle && (
                          <Badge variant="outline" className="capitalize">{template.visualStyle.replace('_', ' ')}</Badge>
                        )}
                        {template.colorTheme && (
                          <Badge variant="outline" className="capitalize">{template.colorTheme}</Badge>
                        )}
                        {template.logoUrl && <Badge variant="outline">With Logo</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!template.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsDefault(template);
                          }}
                          className="text-xs"
                        >
                          Set Default
                        </Button>
                      )}
                      {template.logoUrl && (
                        <img src={template.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {brandProfiles.length > 0 && !isCreatingNewProfile && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Select Existing Brand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {(brandProfiles || []).map((profile) => (
                <div
                  key={profile.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedBrandProfile?.id === profile.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                  onClick={() => {
                    setSelectedBrandProfile(profile);
                    setBriefData(prev => ({ ...prev, ...profile }));
                  }}
                >
                  <h3 className="font-semibold text-slate-800">{profile.brand_name}</h3>
                  <div className="flex gap-2 mt-2">
                    {(profile.visual_style || profile.visual_style_preference) && (
                      <Badge variant="outline" className="capitalize">
                        {(profile.visual_style || profile.visual_style_preference).replace('_', ' ')}
                      </Badge>
                    )}
                    {profile.color_theme && (
                      <Badge variant="outline" className="capitalize">{profile.color_theme}</Badge>
                    )}
                    {profile.core_colors && profile.core_colors.length > 0 && (
                      <Badge variant="outline">
                        {profile.core_colors.length} color{profile.core_colors.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {profile.brand_personality && (
                      <Badge variant="outline" className="capitalize">{profile.brand_personality}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsCreatingNewProfile(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Brand Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {(brandProfiles.length === 0 || isCreatingNewProfile) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Brand Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Brand/Project Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="brand-name"
                  value={briefData.brand_name || ''}
                  onChange={(e) => setBriefData(prev => ({ ...prev, brand_name: e.target.value }))}
                  placeholder="e.g., My Company, Tech Startup"
                  className="flex-1"
                />
                <Button
                  onClick={saveBrandProfile}
                  disabled={!briefData.brand_name || !briefData.brand_name.trim() || saving}
                  size="icon"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
               <p className="text-xs text-slate-500 mt-2">Save this brand to reuse its style settings in the future.</p>
            </div>

            {/* Logo Upload Section */}
            <div>
              <Label>Company Logo (Optional)</Label>
              <div className="mt-2">
                {logoPreview ? (
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Logo uploaded successfully</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoPreview(null);
                          setBriefData(prev => ({ ...prev, logoUrl: null }));
                        }}
                        className="mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Logo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleLogoUpload(file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-2">Upload your company logo</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                )}
                {uploadingLogo && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-slate-600">Uploading logo...</span>
                  </div>
                )}
              </div>
              
              {/* Logo Consent Checkbox */}
              {briefData.logoUrl && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="include-logo"
                      checked={briefData.includeLogo}
                      onChange={(e) => setBriefData(prev => ({ ...prev, includeLogo: e.target.checked }))}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor="include-logo" className="text-sm font-medium text-blue-900 cursor-pointer">
                        Include logo in generated images
                      </label>
                      <p className="text-xs text-blue-700 mt-1">
                        Your logo will be placed in the top-left corner of all generated storyboard images
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={briefData.description || ''}
                onChange={(e) => setBriefData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your brand or project..."
                className="mt-2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose Your Style</h2>
        <p className="text-slate-600">Select a visual style and color theme for this storyboard.</p>
      </div>

      <StyleSelector
        onStyleSelect={handleStyleSelect}
        selectedStyle={briefData.visual_style}
        selectedColorTheme={briefData.color_theme}
      />

      {/* Save Template Section */}
      {isAuthenticated && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save as Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Save this styling configuration as a template to reuse in future storyboards.
            </p>
            <Button
              onClick={saveStylingTemplate}
              disabled={!briefData.brand_name || !briefData.brand_name.trim() || saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Template
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-slate-800">Style Selection</h1>
          <Button variant="ghost" onClick={onSkip} className="text-slate-600">
            Skip for now
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-500 text-white' : 'bg-slate-200'}`}>1</div>
          <div className={`flex-1 h-1 ${step >= 2 ? 'bg-purple-500' : 'bg-slate-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-500 text-white' : 'bg-slate-200'}`}>2</div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        ) : <div />}
        <div className="ml-auto">
          {step < 2 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={(!briefData.brand_name && !selectedBrandProfile) || isCreatingNewProfile}
            >
              Next: Choose Style
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Style & Create Story
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
