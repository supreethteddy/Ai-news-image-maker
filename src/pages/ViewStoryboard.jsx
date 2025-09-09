
import React, { useState, useEffect } from "react";
import { Story } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import StoryboardDisplay from "../components/storyboard/StoryboardDisplay";

export default function ViewStoryboard() {
  const [storyboard, setStoryboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id');
    
    if (storyId) {
      loadStoryboard(storyId);
    } else {
      setError("No story ID provided");
      setIsLoading(false);
    }
  }, []);

  const loadStoryboard = async (id) => {
    setIsLoading(true);
    try {
      const story = await Story.get(id);
      setStoryboard(story);
    } catch (error) {
      console.error("Error loading storyboard:", error);
      setError("Story not found or failed to load");
    }
    setIsLoading(false);
  };

  const handleStoryboardUpdate = (updatedStoryboard) => {
    setStoryboard(updatedStoryboard);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 md:w-12 h-10 md:h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-base md:text-lg">Loading your story...</p>
        </div>
      </div>
    );
  }

  if (error || !storyboard) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-3 md:mb-4">Story Not Found</h2>
          <p className="text-slate-500 mb-4 md:mb-6 text-sm md:text-base">{error || "The requested story could not be found."}</p>
          <Link to={createPageUrl("MyStoryboards")}>
            <Button className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 min-h-[44px] touch-manipulation">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Stories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-8 py-3 md:py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to={createPageUrl("MyStoryboards")}>
              <Button className="bg-white text-slate-900 border border-blue-600 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 min-h-[44px] touch-manipulation">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm md:text-base">Back to My Stories</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-8 py-6 md:py-8">
        <StoryboardDisplay 
          storyboard={storyboard} 
          isLoading={false}
          onStoryboardUpdate={handleStoryboardUpdate}
        />
      </div>
    </div>
  );
}
