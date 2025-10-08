
import React, { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, FileText, Loader2, BookOpenText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MyStoryboards() {
  const [storyboards, setStoryboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadStoryboards();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const loadStoryboards = async () => {
    if (!isAuthenticated || !token) {
      setStoryboards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://ai-news-image-maker.onrender.com/api/storyboards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoryboards(data.data || []);
      } else if (response.status === 401) {
        toast.error('Please log in to view your storyboards');
        setStoryboards([]);
      } else {
        toast.error('Failed to fetch storyboards');
      }
    } catch (error) {
      console.error("Error loading storyboards:", error);
      toast.error('Failed to fetch storyboards');
    }
    setIsLoading(false);
  };

  const handleDeleteStoryboard = async (storyboardId) => {
    if (!isAuthenticated || !token) {
      toast.error('Please log in to delete storyboards');
      return;
    }

    if (!confirm('Are you sure you want to delete this storyboard?')) {
      return;
    }

    try {
      const response = await fetch(`https://ai-news-image-maker.onrender.com/api/storyboards/${storyboardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Storyboard deleted successfully');
        loadStoryboards(); // Reload the list
      } else {
        toast.error('Failed to delete storyboard');
      }
    } catch (error) {
      console.error('Error deleting storyboard:', error);
      toast.error('Failed to delete storyboard');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':return 'bg-red-100 text-red-800 border-red-200';
      default:return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-3 md:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4 px-2">

          <div className="w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 md:mb-3 flex items-center gap-2 md:gap-3 tracking-tight">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/63d7a612c_POWEREDBYSTAIBLTECHLogo.png" alt="NewsPlay Studio" className="w-8 md:w-10 h-8 md:h-10" />
              <span className="leading-tight">NewsPlay Studio</span>
            </h1>
            {user && user.name && (
              <p className="text-lg md:text-xl font-semibold text-slate-700 mb-2">
                Welcome back, <span className="text-purple-600">{user.name}</span>! 👋
              </p>
            )}
            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              Manage your AI-powered visual stories, crafted with NewsPlay
            </p>
          </div>
          <Link to={createPageUrl("CreateStoryboard")} className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-base md:text-lg px-4 md:px-6 py-3 min-h-[48px] touch-manipulation">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/fbbdafa46_1.png" alt="Create" className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              Create New Story
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {isLoading ?
        <div className="flex justify-center items-center py-16 md:py-20">
            <div className="text-center">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f145ce9d6_3.png" alt="Loading" className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 text-base md:text-lg">Loading your stories...</p>
            </div>
          </div> :
        !isAuthenticated ? (
        /* Not Authenticated State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 md:py-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-20 md:w-24 h-20 md:h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/85bd47c69_4.png" alt="Sign In" className="w-10 md:w-12 h-10 md:h-12" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-3 md:mb-4">
              Sign in to view your storyboards
            </h2>
            <p className="text-slate-500 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Please log in to access your saved visual stories and create new ones.
            </p>
            <Link to={createPageUrl("CreateStoryboard")}>
              <Button className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-base md:text-lg px-6 md:px-8 py-3 min-h-[48px] touch-manipulation">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f145ce9d6_3.png" alt="Create" className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                Create Your First Story
              </Button>
            </Link>
          </div>
        </motion.div>) :
        storyboards.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 md:py-20 px-4">

            <div className="max-w-md mx-auto">
              <div className="w-20 md:w-24 h-20 md:h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/85bd47c69_4.png" alt="No Stories" className="w-10 md:w-12 h-10 md:h-12" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-3 md:mb-4">
                No stories created yet
              </h2>
              <p className="text-slate-500 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                Transform your first article or story into a beautiful visual narrative with AI-generated images.
              </p>
              <Link to={createPageUrl("CreateStoryboard")}>
                <Button className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-base md:text-lg px-6 md:px-8 py-3 min-h-[48px] touch-manipulation">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f145ce9d6_3.png" alt="Create" className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
            </div>
          </motion.div>) : (

        /* Storyboards Grid */
        <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {storyboards.map((storyboard, index) =>
            <motion.div
              key={storyboard.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}>

                  <Card className="card-gradient border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden group">
                    {/* Cover Image */}
                    <div className="relative h-40 md:h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {storyboard.storyboard_parts &&
                  storyboard.storyboard_parts.length > 0 &&
                  storyboard.storyboard_parts[0].image_url ?
                  <img
                    src={storyboard.storyboard_parts[0].image_url}
                    alt="Story cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> :


                  <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <BookOpenText className="w-10 md:w-12 h-10 md:h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs md:text-sm text-slate-500">No image available</p>
                          </div>
                        </div>
                  }
                      
                      {/* Delete Button */}
                      <div className="absolute top-2 md:top-3 left-2 md:left-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStoryboard(storyboard.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
                      <CardTitle className="text-slate-900 text-base md:text-xl font-bold line-clamp-2 leading-tight">
                        {storyboard.title || "Untitled Story"}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-grow flex flex-col justify-between p-3 md:p-4 pt-0">
                      {/* Preview Text */}
                      {storyboard.storyboard_parts && storyboard.storyboard_parts.length > 0 &&
                  <p className="text-slate-600 text-xs md:text-sm line-clamp-3 leading-relaxed mb-3 md:mb-4">
                          {storyboard.storyboard_parts[0].text}
                        </p>
                  }
                      
                      {/* Metadata */}
                      <div className="space-y-3 mt-auto">
                        <div className="text-slate-500 my-5 text-xs flex items-center justify-between md:text-sm">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 md:w-4 h-3 md:h-4" />
                            <span>{storyboard.storyboard_parts?.length || 0} scenes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 md:w-4 h-3 md:h-4" />
                            <span>{new Date(storyboard.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {/* View Button */}
                        <Link to={createPageUrl(`ViewStoryboard?id=${storyboard.id}`)}>
                          <Button className="w-full bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 text-sm md:text-base py-2 md:py-3 min-h-[44px] touch-manipulation">
                            <Eye className="w-3 md:w-4 h-3 md:h-4 mr-2" />
                            View Story
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
            )}
            </AnimatePresence>
          </div>)
        }

        {/* Results Count */}
        {!isLoading && storyboards.length > 0 &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 md:mt-12 text-slate-600 text-sm md:text-base">

            Showing {storyboards.length} visual {storyboards.length === 1 ? 'story' : 'stories'}
          </motion.div>
        }
      </div>
    </div>);

}