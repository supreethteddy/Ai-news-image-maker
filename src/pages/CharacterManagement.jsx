import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, User } from 'lucide-react';
import { toast } from 'sonner';
import SimpleCharacterCreator from '@/components/SimpleCharacterCreator';

const CharacterManagement = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE'
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
                  <Badge className={getSourceBadgeColor(character.source)}>
                    {character.source}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Character Image */}
                {character.imageUrl ? (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
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
                  </div>
                ) : (
                  <div className="w-full h-48 mb-4 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                    <User className="w-12 h-12" />
                  </div>
                )}

                {/* Character Details */}
                <div className="space-y-2 mb-4">
                  {character.personality && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Personality:</span>
                      <p className="text-sm text-gray-800">{character.personality}</p>
                    </div>
                  )}
                  
                  {character.appearance && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Appearance:</span>
                      <p className="text-sm text-gray-800">{character.appearance}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterManagement;