import React, { useState, useEffect } from "react";
// BrandProfile import removed - using user profiles only
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, X, Palette, Target, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function CreativeBrief({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [brandProfiles, setBrandProfiles] = useState([]);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState(null);
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [creativeBrief, setCreativeBrief] = useState({
    brand_name: "",
    core_colors: [],
    brand_personality: "",
    visual_style_preference: "photorealistic",
    mood_preference: "professional",
    target_audience: "",
    design_language_notes: "",
    reference_images: [],
    target_audience_brief: "",
    key_message: "",
    emotional_tone: "",
    specific_requirements: ""
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
        setCreativeBrief(prev => ({ ...prev, ...defaultProfile }));
      }
    } catch (error) {
      console.error("Error loading brand profiles:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setCreativeBrief(prev => ({
        ...prev,
        reference_images: [...prev.reference_images, file_url]
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setUploading(false);
  };

  const removeReferenceImage = (index) => {
    setCreativeBrief(prev => ({
      ...prev,
      reference_images: prev.reference_images.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    const color = document.getElementById('color-input').value;
    if (color && !creativeBrief.core_colors.includes(color)) {
      setCreativeBrief(prev => ({
        ...prev,
        core_colors: [...prev.core_colors, color]
      }));
      document.getElementById('color-input').value = '';
    }
  };

  const removeColor = (colorToRemove) => {
    setCreativeBrief(prev => ({
      ...prev,
      core_colors: prev.core_colors.filter(color => color !== colorToRemove)
    }));
  };

  const saveBrandProfile = async () => {
    try {
      const profileData = {
        brand_name: creativeBrief.brand_name,
        core_colors: creativeBrief.core_colors,
        brand_personality: creativeBrief.brand_personality,
        visual_style_preference: creativeBrief.visual_style_preference,
        mood_preference: creativeBrief.mood_preference,
        target_audience: creativeBrief.target_audience,
        design_language_notes: creativeBrief.design_language_notes,
        reference_images: creativeBrief.reference_images,
        is_default: brandProfiles.length === 0
      };

      const savedProfile = await BrandProfile.create(profileData);
      setBrandProfiles(prev => [savedProfile, ...prev]);
      setSelectedBrandProfile(savedProfile);
    } catch (error) {
      console.error("Error saving brand profile:", error);
    }
  };

  const handleComplete = async () => {
    if (isCreatingNewProfile && creativeBrief.brand_name) {
      await saveBrandProfile();
    }

    const briefData = {
      brandProfile: selectedBrandProfile,
      creativeBrief: {
        target_audience: creativeBrief.target_audience_brief,
        key_message: creativeBrief.key_message,
        emotional_tone: creativeBrief.emotional_tone,
        specific_requirements: creativeBrief.specific_requirements
      },
      visualStyle: creativeBrief.visual_style_preference,
      moodTreatment: creativeBrief.mood_preference,
      referenceImages: creativeBrief.reference_images
    };

    onComplete(briefData);
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Palette className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Brand & Style Setup</h2>
        <p className="text-slate-600">Let's understand your brand to create consistent, on-brand visuals</p>
      </div>

      {brandProfiles.length > 0 && !isCreatingNewProfile && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Select Existing Brand Profile</CardTitle>
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
                    setCreativeBrief(prev => ({ ...prev, ...profile }));
                  }}
                >
                  <h3 className="font-semibold text-slate-800">{profile.brand_name}</h3>
                  <p className="text-sm text-slate-600">{profile.brand_personality}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{profile.visual_style_preference}</Badge>
                    <Badge variant="outline">{profile.mood_preference}</Badge>
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
            <CardTitle className="text-lg">Create Brand Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Brand/Project Name *</Label>
              <Input
                id="brand-name"
                value={creativeBrief.brand_name}
                onChange={(e) => setCreativeBrief(prev => ({ ...prev, brand_name: e.target.value }))}
                placeholder="e.g., My Company, Tech Startup, Personal Blog"
              />
            </div>

            <div>
              <Label htmlFor="brand-personality">Brand Personality (3 words) *</Label>
              <Input
                id="brand-personality"
                value={creativeBrief.brand_personality}
                onChange={(e) => setCreativeBrief(prev => ({ ...prev, brand_personality: e.target.value }))}
                placeholder="e.g., Modern, Bold, Trustworthy"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Visual Style Preference</Label>
                <Select
                  value={creativeBrief.visual_style_preference}
                  onValueChange={(value) => setCreativeBrief(prev => ({ ...prev, visual_style_preference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="illustrated">Illustrated</SelectItem>
                    <SelectItem value="comic_book">Comic Book</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="sketch">Sketch</SelectItem>
                    <SelectItem value="3d_rendered">3D Rendered</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood Preference</Label>
                <Select
                  value={creativeBrief.mood_preference}
                  onValueChange={(value) => setCreativeBrief(prev => ({ ...prev, mood_preference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="dramatic">Dramatic</SelectItem>
                    <SelectItem value="serene">Serene</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="sophisticated">Sophisticated</SelectItem>
                    <SelectItem value="rustic">Rustic</SelectItem>
                    <SelectItem value="futuristic">Futuristic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Core Brand Colors</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="color-input"
                  placeholder="e.g., #3B82F6, Blue, RGB(59,130,246)"
                  onKeyPress={(e) => e.key === 'Enter' && addColor()}
                />
                <Button onClick={addColor} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {creativeBrief.core_colors.map((color, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {color}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeColor(color)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="target-audience">Target Audience</Label>
              <Textarea
                id="target-audience"
                value={creativeBrief.target_audience}
                onChange={(e) => setCreativeBrief(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="Describe your target audience demographics, interests, and preferences"
                className="h-20"
              />
            </div>

            <div>
              <Label htmlFor="design-notes">Design Language Notes</Label>
              <Textarea
                id="design-notes"
                value={creativeBrief.design_language_notes}
                onChange={(e) => setCreativeBrief(prev => ({ ...prev, design_language_notes: e.target.value }))}
                placeholder="Any specific design preferences, style guides, or visual requirements"
                className="h-20"
              />
            </div>

            <div>
              <Label>Reference Images/Mood Board</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">
                    {uploading ? "Uploading..." : "Click to upload reference images"}
                  </p>
                </label>
              </div>
              {creativeBrief.reference_images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {creativeBrief.reference_images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => removeReferenceImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
        <MessageSquare className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Creative Brief</h2>
        <p className="text-slate-600">Help us understand your specific goals for this storyboard</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="key-message">Key Message *</Label>
            <Textarea
              id="key-message"
              value={creativeBrief.key_message}
              onChange={(e) => setCreativeBrief(prev => ({ ...prev, key_message: e.target.value }))}
              placeholder="What's the main message or story you want to convey?"
              className="h-20"
            />
          </div>

          <div>
            <Label htmlFor="emotional-tone">Desired Emotional Tone</Label>
            <Input
              id="emotional-tone"
              value={creativeBrief.emotional_tone}
              onChange={(e) => setCreativeBrief(prev => ({ ...prev, emotional_tone: e.target.value }))}
              placeholder="e.g., Inspiring, Educational, Urgent, Celebratory"
            />
          </div>

          <div>
            <Label htmlFor="target-audience-brief">Target Audience for This Story</Label>
            <Textarea
              id="target-audience-brief"
              value={creativeBrief.target_audience_brief}
              onChange={(e) => setCreativeBrief(prev => ({ ...prev, target_audience_brief: e.target.value }))}
              placeholder="Who specifically should this storyboard resonate with?"
              className="h-20"
            />
          </div>

          <div>
            <Label htmlFor="specific-requirements">Specific Visual Requirements</Label>
            <Textarea
              id="specific-requirements"
              value={creativeBrief.specific_requirements}
              onChange={(e) => setCreativeBrief(prev => ({ ...prev, specific_requirements: e.target.value }))}
              placeholder="Any specific visual elements, scenes, or details that must be included?"
              className="h-20"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-slate-800">Creative Brief</h1>
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
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        )}
        <div className="ml-auto">
          {step < 2 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!creativeBrief.brand_name && !selectedBrandProfile}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!creativeBrief.key_message}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Complete Brief & Create Storyboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}