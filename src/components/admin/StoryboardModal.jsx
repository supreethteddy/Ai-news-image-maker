import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { Story } from '@/api/entities';
import StoryboardDisplay from '../storyboard/StoryboardDisplay';

export default function StoryboardModal({ isOpen, onClose, storyboardId }) {
  const [storyboard, setStoryboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && storyboardId) {
      loadStoryboard();
    }
  }, [isOpen, storyboardId]);

  const loadStoryboard = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Loading storyboard with ID:', storyboardId);
      const story = await Story.get(storyboardId);
      console.log('Storyboard loaded successfully:', story);
      setStoryboard(story);
    } catch (error) {
      console.error('Error loading storyboard:', error);
      setError('Failed to load storyboard. Please check if the storyboard exists and you have permission to view it.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryboardUpdate = (updatedStoryboard) => {
    setStoryboard(updatedStoryboard);
  };

  const handleClose = () => {
    setStoryboard(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Storyboard Details
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading storyboard...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-600 mb-4">
                <X className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={loadStoryboard} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : storyboard ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <StoryboardDisplay 
                storyboard={storyboard} 
                isLoading={false}
                onStoryboardUpdate={handleStoryboardUpdate}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
