import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Upload, Camera, Wand2, Check } from 'lucide-react';
import { toast } from 'sonner';

const CharacterSelector = ({ selectedCharacter, onCharacterSelect, onCharacterChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch characters
  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/characters');
      
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
  }, []);

  const handleCharacterSelect = (character) => {
    onCharacterSelect(character);
    setIsDialogOpen(false);
    toast.success(`Selected character: ${character.name}`);
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


  return (
    <div className="space-y-4">
      {/* Selected Character Display */}
      {selectedCharacter ? (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedCharacter.imageUrl && (
                  <img
                    src={selectedCharacter.imageUrl}
                    alt={selectedCharacter.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-purple-900">{selectedCharacter.name}</h4>
                  <p className="text-sm text-purple-700">
                    {selectedCharacter.description?.substring(0, 60)}
                    {selectedCharacter.description?.length > 60 && '...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getSourceColor(selectedCharacter.source)}>
                  {getSourceIcon(selectedCharacter.source)}
                  <span className="ml-1 capitalize">{selectedCharacter.source}</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Character Selected</h3>
            <p className="text-gray-600 mb-4">
              Select a character to ensure consistent visual storytelling across your storyboard.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Select Character
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select a Character</DialogTitle>
                  <DialogDescription>
                    Choose a character to maintain consistency across your storyboard images.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading characters...</p>
                    </div>
                  ) : characters.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No Characters Available</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first character to start building consistent visual stories.
                      </p>
                      <Button onClick={() => window.location.href = '/charactermanagement'}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Character
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {characters.map((character) => (
                        <Card
                          key={character.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCharacter?.id === character.id ? 'ring-2 ring-purple-500' : ''
                          }`}
                          onClick={() => handleCharacterSelect(character)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{character.name}</CardTitle>
                                <CardDescription className="mt-1">
                                  {character.description?.substring(0, 80)}
                                  {character.description?.length > 80 && '...'}
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
                              <div className="mb-3">
                                <img
                                  src={character.imageUrl}
                                  alt={character.name}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                              </div>
                            )}
                            
                            <div className="space-y-2">
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

                            {selectedCharacter?.id === character.id && (
                              <div className="mt-3 flex items-center text-green-600">
                                <Check className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">Selected</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CharacterSelector;
