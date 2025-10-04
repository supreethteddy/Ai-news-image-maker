import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CreditRechargeModal from './CreditRechargeModal';

const CreditBalance = ({ showLabel = true, variant = 'default', className = '' }) => {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchCredits = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/credits/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCredits(data.credits);
        }
      } else {
        console.error('Failed to fetch credits');
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

  const getCreditColor = () => {
    if (credits === null) return 'secondary';
    if (credits <= 0) return 'destructive';
    if (credits <= 2) return 'warning';
    return 'default';
  };

  const getCreditIcon = () => {
    if (credits === null || credits <= 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Coins className="h-4 w-4" />;
  };

  if (variant === 'compact') {
    return (
      <Badge variant={getCreditColor()} className={`flex items-center gap-1 ${className}`}>
        {getCreditIcon()}
        <span>{credits ?? 0}</span>
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {getCreditIcon()}
        <span className={`font-medium ${credits <= 2 ? 'text-orange-600' : credits <= 0 ? 'text-red-600' : 'text-foreground'}`}>
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
          {credits === 0 ? 'Recharge Now' : 'Buy Credits'}
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
