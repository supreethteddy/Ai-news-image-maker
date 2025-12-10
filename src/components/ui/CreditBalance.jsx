import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CreditRechargeModal from './CreditRechargeModal';

const CreditBalance = ({ showLabel = true, variant = 'default', className = '' }) => {
  const [credits, setCredits] = useState(null);
  const [storyCount, setStoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchCredits = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch credits
      const creditsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/credits/balance`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (creditsResponse.ok) {
        const data = await creditsResponse.json();
        if (data.success) {
          setCredits(data.credits);
        }
      }

      // Fetch storyboard count to determine free stories remaining
      const storyboardsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storyboards`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (storyboardsResponse.ok) {
        const storyData = await storyboardsResponse.json();
        if (storyData.success && storyData.data) {
          setStoryCount(storyData.data.length);
        }
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [isAuthenticated, token]);

  // Refresh credits function that can be called from parent components
  const refreshCredits = () => {
    setLoading(true);
    fetchCredits();
  };

  // Remove the useImperativeHandle as it's not being used correctly
  // If parent components need to refresh credits, they can use the refreshCredits from useAuth context

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showLabel && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    );
  }

  const getFreeStoriesRemaining = () => {
    return Math.max(0, 2 - storyCount);
  };

  const getCreditColor = () => {
    if (credits === null) return 'secondary';
    // If user has 0 credits but free stories left, show success color
    if (credits === 0 && getFreeStoriesRemaining() > 0) return 'default';
    if (credits <= 0) return 'destructive';
    if (credits <= 2) return 'warning';
    return 'default';
  };

  const getCreditIcon = () => {
    // If user has 0 credits, show alert
    if (credits === null || credits <= 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Coins className="h-4 w-4" />;
  };

  if (variant === 'compact') {
    const freeStoriesLeft = getFreeStoriesRemaining();
    // If 0 credits and 0 free stories, show "0 credits", otherwise show free stories
    const displayText = credits === 0 
      ? (freeStoriesLeft === 0 ? '0 credits' : `${freeStoriesLeft} free`)
      : credits;
    
    return (
      <Badge variant={getCreditColor()} className={`flex items-center gap-1 ${className}`}>
        {getCreditIcon()}
        <span>{displayText}</span>
      </Badge>
    );
  }

  // If user has 0 credits, check free stories remaining
  if (credits === 0) {
    const freeStoriesLeft = getFreeStoriesRemaining();
    
    // If NO free stories left (0), show "0 credits" (revert to traditional credit system)
    if (freeStoriesLeft === 0) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-600">
              0
            </span>
            {showLabel && (
              <span className="text-sm text-muted-foreground">
                credits
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRechargeModal(true)}
            className="text-xs"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Recharge Now
          </Button>
          <CreditRechargeModal
            isOpen={showRechargeModal}
            onClose={() => setShowRechargeModal(false)}
            onSuccess={() => {
              refreshCredits();
              setShowRechargeModal(false);
            }}
          />
        </div>
      );
    }
    
    // If free stories remaining (1 or 2), show free stories count
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-600">
            {freeStoriesLeft}
          </span>
          {showLabel && (
            <span className="text-sm text-muted-foreground">
              {freeStoriesLeft === 1 ? 'free story' : 'free stories'}
            </span>
          )}
        </div>
        <CreditRechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={() => {
            refreshCredits();
            setShowRechargeModal(false);
          }}
        />
      </div>
    );
  }

  // If user has credits, show credits
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {getCreditIcon()}
        <span className={`font-medium ${credits <= 2 ? 'text-orange-600' : 'text-foreground'}`}>
          {credits ?? 0}
        </span>
        {showLabel && (
          <span className="text-sm text-muted-foreground">
            {credits === 1 ? 'credit' : 'credits'}
          </span>
        )}
      </div>
      
      {credits <= 5 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRechargeModal(true)}
          className="text-xs"
        >
          <CreditCard className="h-3 w-3 mr-1" />
          Buy Credits
        </Button>
      )}
      <CreditRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onSuccess={() => {
          refreshCredits();
          setShowRechargeModal(false);
        }}
      />
    </div>
  );
};

export default CreditBalance;
