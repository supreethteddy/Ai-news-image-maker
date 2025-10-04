import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Badge } from './badge';
import { 
  AlertTriangle, 
  Coins, 
  CreditCard, 
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CreditRechargeModal from './CreditRechargeModal';

const LowCreditWarning = ({ 
  threshold = 3, 
  showOnZero = true, 
  className = '',
  variant = 'default' // 'default', 'banner', 'compact'
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const { credits, isAuthenticated, token } = useAuth();

  // Check if warning should be shown
  useEffect(() => {
    if (!isAuthenticated || credits === null) {
      setShouldShow(false);
      return;
    }

    const shouldWarn = credits <= threshold && (showOnZero || credits > 0);
    setShouldShow(shouldWarn && !dismissed);
  }, [credits, threshold, showOnZero, dismissed, isAuthenticated]);

  // Reset dismissed state when credits change significantly
  useEffect(() => {
    if (credits > threshold) {
      setDismissed(false);
    }
  }, [credits, threshold]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleRecharge = () => {
    setShowRechargeModal(true);
  };

  const handleRechargeSuccess = () => {
    setDismissed(true); // Auto-dismiss after successful recharge
  };

  if (!shouldShow) {
    return null;
  }

  // Get warning level styling
  const getWarningStyle = () => {
    if (credits === 0) {
      return {
        variant: 'destructive',
        icon: <AlertTriangle className="h-4 w-4" />,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      };
    } else if (credits <= 1) {
      return {
        variant: 'destructive',
        icon: <AlertTriangle className="h-4 w-4" />,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      };
    } else {
      return {
        variant: 'default',
        icon: <Zap className="h-4 w-4" />,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800'
      };
    }
  };

  const style = getWarningStyle();

  // Get message based on credit level
  const getMessage = () => {
    if (credits === 0) {
      return "You're out of credits! Recharge now to continue creating storyboards.";
    } else if (credits === 1) {
      return "Only 1 credit left! Recharge now to avoid interruption.";
    } else {
      return `Only ${credits} credits remaining. Consider recharging to continue creating.`;
    }
  };

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          <Badge variant={credits === 0 ? 'destructive' : 'secondary'} className="flex items-center gap-1">
            {style.icon}
            <span>{credits} credits</span>
          </Badge>
          <Button
            onClick={handleRecharge}
            size="sm"
            variant={credits === 0 ? 'default' : 'outline'}
            className="text-xs"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Recharge
          </Button>
        </div>
        
        <CreditRechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={handleRechargeSuccess}
        />
      </>
    );
  }

  // Banner variant for prominent display
  if (variant === 'banner') {
    return (
      <>
        <div className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 ${className}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`${style.iconColor} mt-0.5`}>
                {style.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${style.textColor} mb-1`}>
                  {credits === 0 ? 'Credits Depleted' : 'Low Credits Warning'}
                </h3>
                <p className={`text-sm ${style.textColor} mb-3`}>
                  {getMessage()}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleRecharge}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Recharge Now
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Coins className="h-4 w-4" />
                    <span>Current balance: {credits} credits</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CreditRechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={handleRechargeSuccess}
        />
      </>
    );
  }

  // Default variant using Alert component
  return (
    <>
      <Alert variant={style.variant} className={className}>
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-2 flex-1">
            {style.icon}
            <div className="flex-1">
              <AlertDescription className="mb-2">
                {getMessage()}
              </AlertDescription>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRecharge}
                  size="sm"
                  variant="outline"
                  className="border-current"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Recharge Credits
                </Button>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {credits} remaining
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
      
      <CreditRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onSuccess={handleRechargeSuccess}
      />
    </>
  );
};

export default LowCreditWarning;
