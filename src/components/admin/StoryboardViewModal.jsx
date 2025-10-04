import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  FileText, 
  Eye, 
  X,
  Image,
  Clock
} from 'lucide-react';

export default function StoryboardViewModal({ storyboard, isOpen, onClose }) {
  console.log('🎭 StoryboardViewModal rendered:', { storyboard: storyboard?.title, isOpen });
  
  if (!storyboard) {
    console.log('❌ No storyboard data provided to modal');
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  console.log('🎭 Rendering modal with isOpen:', isOpen, 'storyboard:', storyboard?.title);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50 bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Storyboard Details: "{storyboard.title}"
          </DialogTitle>
          <DialogDescription>
            Complete storyboard content and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-medium">{storyboard.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(storyboard.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={getStatusColor(storyboard.status)}>
                  {storyboard.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Original Text */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Original Story Text
            </h3>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 leading-relaxed">
                {storyboard.original_text || 'No original text available'}
              </p>
            </div>
          </div>

          {/* Storyboard Parts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Storyboard Scenes ({storyboard.parts} parts)
            </h3>
            
            {storyboard.storyboard_parts && storyboard.storyboard_parts.length > 0 ? (
              <div className="space-y-4">
                {storyboard.storyboard_parts.map((part, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Scene {part.scene_number || index + 1}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Scene Description</h4>
                        <p className="text-gray-700 text-sm">
                          {part.description || 'No description available'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Image Prompt</h4>
                        <p className="text-gray-600 text-sm italic bg-gray-50 p-2 rounded">
                          {part.image_prompt || 'No image prompt available'}
                        </p>
                      </div>
                      
                      {part.image_url && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Generated Image</h4>
                          <img 
                            src={part.image_url} 
                            alt={`Scene ${part.scene_number || index + 1}`}
                            className="max-w-full h-auto rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No storyboard parts available</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button 
              onClick={() => {
                // Could add functionality to edit or approve/reject
                console.log('Action on storyboard:', storyboard.id);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
