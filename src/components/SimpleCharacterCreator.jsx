import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, Image as ImageIcon, Loader2, Plus, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const SimpleCharacterCreator = ({ onCharacterCreated }) => {
  const { token, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    style: 'realistic',
    imageFile: null,
    imageUrl: ''
  });
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imageUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setFormData(prev => ({ ...prev, imageFile: file }));
        setFormData(prev => ({ ...prev, imageUrl: canvas.toDataURL() }));
        stopCamera();
        toast.success('Photo captured successfully!');
      }, 'image/jpeg', 0.8);
    }
  };

  const uploadImage = async () => {
    if (!formData.imageFile) return null;

    const uploadFormData = new FormData();
    uploadFormData.append('image', formData.imageFile);

    try {
      const response = await fetch('http://localhost:3001/api/upload/character-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.imageUrl;
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
      return null;
    }
  };

  const generateCharacter = async () => {
    if (!formData.name || !formData.prompt) {
      toast.error('Please fill in character name and prompt');
      return;
    }

    console.log('Starting character generation with data:', formData);
    setLoading(true);
    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (formData.imageFile) {
        console.log('Uploading image...');
        imageUrl = await uploadImage();
        console.log('Image uploaded, URL:', imageUrl);
      }

      // Generate character with Ideogram API
      console.log('Calling character generation API...');
      const requestData = {
        name: formData.name,
        prompt: formData.prompt,
        style: formData.style,
        imageUrl: imageUrl // This will be used as character_reference_images
      };
      console.log('Request data:', requestData);

      const response = await fetch('http://localhost:3001/api/characters/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Character created successfully:', data);
        toast.success('Character created successfully!');
        onCharacterCreated?.(data.data);
        setIsOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        toast.error(`Failed to create character: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      prompt: '',
      style: 'realistic',
      imageFile: null,
      imageUrl: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create New Character
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Character</DialogTitle>
          <DialogDescription>
            Upload a photo, take a picture, or generate a character with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Character Image</Label>
            
            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Character preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            {/* Upload Options */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              
              <Button
                variant="outline"
                onClick={startCamera}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Take Photo</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-200 rounded-lg mb-4"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3">
                  <Button onClick={capturePhoto} className="flex-1">
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Character Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Character Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Sarah Johnson"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prompt">Character Description *</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                placeholder={formData.imageUrl ? 
                  "Describe the setting and pose: A professional journalist in a modern office, wearing a navy blazer, confident pose..." : 
                  "Describe your character: A professional journalist with dark hair and blue eyes, wearing a navy blazer..."
                }
                className="mt-1 min-h-[100px]"
              />
              {formData.imageUrl && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                  💡 <strong>Tip:</strong> Since you're using a face reference image, focus your prompt on the setting, clothing, and pose rather than facial features. The face will come from your uploaded image.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={generateCharacter}
              disabled={loading || !formData.name || !formData.prompt}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Character...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Character
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCharacterCreator;
