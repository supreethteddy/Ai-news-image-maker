import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RecentStoryboards() {
  const [storyboards, setStoryboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchRecentStoryboards();
  }, []);

  const fetchRecentStoryboards = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/content/storyboards?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoryboards(data.data || []);
      } else {
        console.error('Failed to fetch recent storyboards');
      }
    } catch (error) {
      console.error('Error fetching recent storyboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Less than 1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (storyboards.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No recent storyboards found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {storyboards.map((storyboard) => (
        <div key={storyboard.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">"{storyboard.title}"</p>
            <p className="text-sm text-gray-600">
              by {storyboard.author} • {formatTimeAgo(storyboard.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.success(`Approved "${storyboard.title}"`);
                fetchRecentStoryboards();
              }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // Open storyboard in new tab or modal
                window.open(`/storyboard/${storyboard.id}`, '_blank');
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
