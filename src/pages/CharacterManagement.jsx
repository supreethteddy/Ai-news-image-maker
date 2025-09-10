import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, User, Eye, Download, X, Upload, Camera, Wand2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import SimpleCharacterCreator from '@/components/SimpleCharacterCreator';

const CharacterManagement = () => {
  const { user, isAuthenticated, token } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);

  // Fetch characters
  const fetchCharacters = async () => {
    if (!isAuthenticated || !token) {
      setCharacters([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/characters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.data || []);
      } else if (response.status === 401) {
        toast.error('Please log in to view your characters');
        setCharacters([]);
      } else {
        toast.error('Failed to fetch characters');
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
  }, [isAuthenticated, token]);

  // Handle character creation
  const handleCharacterCreated = (newCharacter) => {
    setCharacters(prev => [newCharacter, ...prev]);
    fetchCharacters(); // Refresh the list
  };

  // Delete character
  const handleDeleteCharacter = async (characterId) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/characters/${characterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCharacters(prev => prev.filter(char => char.id !== characterId));
        toast.success('Character deleted successfully!');
      } else {
        toast.error('Failed to delete character');
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character');
    } finally {
      setLoading(false);
    }
  };

  // View image in full size
  const handleViewImage = (character) => {
    setSelectedImage(character);
    setIsImageViewOpen(true);
  };

  // Download image
  const handleDownloadImage = async (character) => {
    try {
      // Use backend proxy to avoid CORS issues
      const response = await fetch(`http://localhost:3001/api/characters/${character.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${character.name}-character-image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image: ' + error.message);
    }
  };

  // Get source badge color
  const getSourceBadgeColor = (source) => {
    switch (source) {
      case 'upload': return 'bg-blue-100 text-blue-800';
      case 'camera': return 'bg-green-100 text-green-800';
      case 'generated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!isAuthenticated ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to manage characters</h2>
          <p className="text-slate-600 mb-6">Create and manage your AI characters for consistent storytelling.</p>
          <AuthModal>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <User className="mr-2 h-4 w-4" />
              Sign In / Register
            </Button>
          </AuthModal>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Character Management</h1>
              <p className="text-gray-600 mt-2">
                Create and manage characters for consistent storytelling
              </p>
            </div>
            
            <SimpleCharacterCreator onCharacterCreated={handleCharacterCreated} />
          </div>

          {/* Characters Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : characters.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Characters Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first character to get started with consistent storytelling
                </p>
                <SimpleCharacterCreator onCharacterCreated={handleCharacterCreated} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <Card key={character.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {character.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCharacter(character.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Character Image */}
                    {character.imageUrl ? (
                      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 relative group">
                        <img 
                          src={character.imageUrl} 
                          alt={character.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                          <User className="w-12 h-12" />
                        </div>
                        
                        {/* Image overlay buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewImage(character)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDownloadImage(character)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 mb-4 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                        <User className="w-12 h-12" />
                      </div>
                    )}

                    {/* Character Details */}
                    <div className="space-y-2">
                      {character.personality && (
                        <div>
                          <span className="font-semibold text-xs text-gray-600">Personality:</span>{' '}
                          <span className="text-xs text-gray-500">{character.personality}</span>
                        </div>
                      )}
                      {character.appearance && (
                        <div>
                          <span className="font-semibold text-xs text-gray-600">Appearance:</span>{' '}
                          <span className="text-xs text-gray-500">{character.appearance}</span>
                        </div>
                      )}
                      {character.source && (
                        <Badge className={`mt-2 ${getSourceBadgeColor(character.source)}`}>
                          {character.source === 'upload' && <Upload className="mr-1 h-3 w-3" />}
                          {character.source === 'camera' && <Camera className="mr-1 h-3 w-3" />}
                          {character.source === 'generated' && <Wand2 className="mr-1 h-3 w-3" />}
                          {character.source}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Image View Modal */}
          <Dialog open={isImageViewOpen} onOpenChange={setIsImageViewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>{selectedImage?.name}</DialogTitle>
                    <DialogDescription>
                      Character Image - {selectedImage?.description}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => selectedImage && handleDownloadImage(selectedImage)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsImageViewOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedImage?.imageUrl && (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.name}
                    className="max-w-full max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                    <User className="w-16 h-16" />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default CharacterManagement;