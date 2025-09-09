
import React, { useState, useEffect } from "react";
import { BrandProfile } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Palette, Save, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StyleSelector from "./StyleSelector";

export default function SimplifiedCreativeBrief({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [brandProfiles, setBrandProfiles] = useState([]);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState(null);
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [briefData, setBriefData] = useState({
    brand_name: "",
    visual_style: "realistic",
    color_theme: "modern"
  });

  useEffect(() => {
    loadBrandProfiles();
  }, []);

  const loadBrandProfiles = async () => {
    try {
      const profiles = await BrandProfile.list("-created_date");
      setBrandProfiles(profiles);
      
      const defaultProfile = profiles.find(p => p.is_default);
      if (defaultProfile) {
        setSelectedBrandProfile(defaultProfile);
        setBriefData(prev => ({ ...prev, ...defaultProfile }));
      }
    } catch (error) {
      console.error("Error loading brand profiles:", error);
    }
  };

  const handleStyleSelect = (type, value) => {
    setBriefData(prev => ({
      ...prev,
      [type === 'visualStyle' ? 'visual_style' : 'color_theme']: value
    }));
  };

  const saveBrandProfile = async () => {
    // FIX: Defensive check before calling trim()
    if (typeof briefData.brand_name !== 'string' || !briefData.brand_name.trim()) return;
    
    setSaving(true);
    try {
      const profileData = {
        brand_name: briefData.brand_name,
        visual_style: briefData.visual_style,
        color_theme: briefData.color_theme,
        is_default: brandProfiles.length === 0
      };

      const savedProfile = await BrandProfile.create(profileData);
      setBrandProfiles(prev => [savedProfile, ...prev]);
      setSelectedBrandProfile(savedProfile);
      setIsCreatingNewProfile(false);
    } catch (error) {
      console.error("Error saving brand profile:", error);
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    const finalData = {
      brandProfile: selectedBrandProfile,
      visualStyle: briefData.visual_style,
      colorTheme: briefData.color_theme
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
      </div>

      {brandProfiles.length > 0 && !isCreatingNewProfile && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Select Existing Brand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {brandProfiles.map((profile) => (
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
                    <Badge variant="outline" className="capitalize">{profile.visual_style.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className="capitalize">{profile.color_theme}</Badge>
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
