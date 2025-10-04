import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Palette, 
  Eye, 
  X,
  Code,
  Star,
  Settings
} from 'lucide-react';

export default function TemplateViewModal({ template, isOpen, onClose }) {
  if (!template) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStyles = (styles) => {
    if (!styles) return 'No styles defined';
    
    if (typeof styles === 'string') {
      try {
        return JSON.stringify(JSON.parse(styles), null, 2);
      } catch {
        return styles;
      }
    }
    
    if (typeof styles === 'object') {
      return JSON.stringify(styles, null, 2);
    }
    
    return String(styles);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Template Details: "{template.name}"
          </DialogTitle>
          <DialogDescription>
            Complete template configuration and styling information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-medium">{template.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(template.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(template.status)}>
                    {template.status}
                  </Badge>
                  {template.public && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {template.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Description
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>
          )}

          {/* Template Styles */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Code className="h-5 w-5" />
              Template Styles & Configuration
            </h3>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">
                <code>{formatStyles(template.styles)}</code>
              </pre>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Usage Statistics</h4>
              <p className="text-2xl font-bold text-purple-700">{template.usage || 0}</p>
              <p className="text-sm text-purple-600">Times used</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Template Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Public</span>
                  <span className="text-sm font-medium text-green-800">
                    {template.public ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Status</span>
                  <span className="text-sm font-medium text-green-800">
                    {template.status}
                  </span>
                </div>
              </div>
            </div>
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
                console.log('Action on template:', template.id);
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
