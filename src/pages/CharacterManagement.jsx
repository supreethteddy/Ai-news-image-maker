import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Upload, Camera, Wand2, User } from 'lucide-react';
import { toast } from 'sonner';

const CharacterManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    imagePrompt: '',
    personality: '',
    appearance: '',
    source: 'upload'
  });

  // Fetch characters
  const fetchCharacters = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/characters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Failed to fetch characters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [isAuthenticated]);

  // Create character
  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCharacters(prev => [data.data, ...prev]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success('Character created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create character');
      }
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  // Update character
  const handleUpdateCharacter = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch(`/api/characters/${editingCharacter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setCharacters(prev => prev.map(char => 
          char.id === editingCharacter.id ? data.data : char
        ));
        setIsEditDialogOpen(false);
        setEditingCharacter(null);
        resetForm();
        toast.success('Character updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update character');
      }
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('Failed to update character');
    } finally {
      setLoading(false);
    }
  };

  // Delete character
  const handleDeleteCharacter = async (characterId) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCharacters(prev => prev.filter(char => char.id !== characterId));
        toast.success('Character deleted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete character');
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character');
    } finally {
      setLoading(false);
    }
  };

  // Generate character from description
  const handleGenerateCharacter = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please provide both name and description');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/characters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          style: 'realistic'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCharacters(prev => [data.data, ...prev]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success('Character generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate character');
      }
    } catch (error) {
      console.error('Error generating character:', error);
      toast.error('Failed to generate character');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      imagePrompt: '',
      personality: '',
      appearance: '',
      source: 'upload'
    });
  };

  const openEditDialog = (character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description: character.description || '',
      imageUrl: character.imageUrl || '',
      imagePrompt: character.imagePrompt || '',
      personality: character.personality || '',
      appearance: character.appearance || '',
      source: character.source || 'upload'
    });
    setIsEditDialogOpen(true);
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'generated': return <Wand2 className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'upload': return 'bg-blue-100 text-blue-800';
      case 'camera': return 'bg-green-100 text-green-800';
      case 'generated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to manage your characters.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Character Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage characters for consistent visual storytelling
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Character</DialogTitle>
              <DialogDescription>
                Create a character that will be used consistently across your storyboards.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateCharacter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Character Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sarah Johnson"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source Type</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upload">Upload Image</SelectItem>
                      <SelectItem value="camera">Take Photo</SelectItem>
                      <SelectItem value="generated">AI Generated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the character's appearance, personality, and key features..."
                  rows={3}
                  required
                />
              </div>

              {formData.source === 'upload' && (
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/character-image.jpg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personality">Personality Traits</Label>
                  <Input
                    id="personality"
                    value={formData.personality}
                    onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                    placeholder="e.g., Confident, Friendly, Professional"
                  />
                </div>
                <div>
                  <Label htmlFor="appearance">Physical Appearance</Label>
                  <Input
                    id="appearance"
                    value={formData.appearance}
                    onChange={(e) => setFormData(prev => ({ ...prev, appearance: e.target.value }))}
                    placeholder="e.g., Tall, Dark hair, Blue eyes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                {formData.source === 'generated' ? (
                  <Button
                    type="button"
                    onClick={handleGenerateCharacter}
                    disabled={loading}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Character
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    Create Character
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Characters Grid */}
      {loading && characters.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading characters...</p>
          </div>
        </div>
      ) : characters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Characters Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first character to start building consistent visual stories.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card key={character.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {character.description?.substring(0, 100)}
                      {character.description?.length > 100 && '...'}
                    </CardDescription>
                  </div>
                  <Badge className={getSourceColor(character.source)}>
                    {getSourceIcon(character.source)}
                    <span className="ml-1 capitalize">{character.source}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {character.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  {character.personality && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Personality:</span>
                      <p className="text-sm text-gray-600">{character.personality}</p>
                    </div>
                  )}
                  {character.appearance && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Appearance:</span>
                      <p className="text-sm text-gray-600">{character.appearance}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(character)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
            <DialogDescription>
              Update your character's information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateCharacter} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Character Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sarah Johnson"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-source">Source Type</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upload">Upload Image</SelectItem>
                    <SelectItem value="camera">Take Photo</SelectItem>
                    <SelectItem value="generated">AI Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the character's appearance, personality, and key features..."
                rows={3}
                required
              />
            </div>

            {formData.source === 'upload' && (
              <div>
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/character-image.jpg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-personality">Personality Traits</Label>
                <Input
                  id="edit-personality"
                  value={formData.personality}
                  onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="e.g., Confident, Friendly, Professional"
                />
              </div>
              <div>
                <Label htmlFor="edit-appearance">Physical Appearance</Label>
                <Input
                  id="edit-appearance"
                  value={formData.appearance}
                  onChange={(e) => setFormData(prev => ({ ...prev, appearance: e.target.value }))}
                  placeholder="e.g., Tall, Dark hair, Blue eyes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Update Character
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharacterManagement;
