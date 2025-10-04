import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { 
  Coins, 
  CreditCard, 
  Zap, 
  Star, 
  Check, 
  Loader2,
  Gift,
  TrendingUp,
  Users,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreditRechargeModal = ({ isOpen, onClose, onSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const { token, refreshCredits } = useAuth();

  // Fetch credit packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/credits/packages');
      
      if (response.ok) {
        const data = await response.json();
        setPackages(data.data || []);
      } else {
        toast.error('Failed to load credit packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Error loading credit packages');
    } finally {
      setLoading(false);
    }
  };

  // Purchase credits
  const purchaseCredits = async (packageId) => {
    if (!token) {
      toast.error('Please log in to purchase credits');
      return;
    }

    try {
      setPurchasing(true);
      const response = await fetch('http://localhost:3001/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId,
          paymentMethod: 'demo' // For demo purposes
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Credits purchased successfully! New balance: ${data.newBalance} credits`);
        
        // Refresh credits in auth context
        if (refreshCredits) {
          refreshCredits();
        }
        
        // Call success callback
        if (onSuccess) {
          onSuccess(data);
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to purchase credits');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast.error('Error processing purchase');
    } finally {
      setPurchasing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  // Get package icon based on size
  const getPackageIcon = (credits) => {
    if (credits >= 250) return <Crown className="h-8 w-8 text-purple-600" />;
    if (credits >= 100) return <TrendingUp className="h-8 w-8 text-blue-600" />;
    if (credits >= 50) return <Users className="h-8 w-8 text-green-600" />;
    if (credits >= 25) return <Star className="h-8 w-8 text-yellow-600" />;
    return <Zap className="h-8 w-8 text-orange-600" />;
  };

  // Get package color scheme
  const getPackageColors = (credits) => {
    if (credits >= 250) return {
      border: 'border-purple-200',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-100 text-purple-800'
    };
    if (credits >= 100) return {
      border: 'border-blue-200',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-100 text-blue-800'
    };
    if (credits >= 50) return {
      border: 'border-green-200',
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      button: 'bg-green-600 hover:bg-green-700',
      badge: 'bg-green-100 text-green-800'
    };
    if (credits >= 25) return {
      border: 'border-yellow-200',
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800'
    };
    return {
      border: 'border-orange-200',
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      button: 'bg-orange-600 hover:bg-orange-700',
      badge: 'bg-orange-100 text-orange-800'
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-blue-600" />
            Recharge Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to continue creating amazing storyboards. All packages include bonus credits!
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">Loading packages...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Popular badge for best value */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const colors = getPackageColors(pkg.credits);
                const isPopular = pkg.credits === 50; // Mark Pro Pack as popular
                const totalCredits = pkg.credits + (pkg.bonus_credits || 0);
                
                return (
                  <Card 
                    key={pkg.id} 
                    className={`relative ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      selectedPackage?.id === pkg.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-2">
                        {getPackageIcon(pkg.credits)}
                      </div>
                      <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                      <div className="text-3xl font-bold text-gray-900">
                        ${pkg.price_usd}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Coins className="h-5 w-5 text-blue-600" />
                          <span className="text-xl font-semibold">{pkg.credits} Credits</span>
                        </div>
                        
                        {pkg.bonus_credits > 0 && (
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Gift className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                              +{pkg.bonus_credits} Bonus Credits!
                            </span>
                          </div>
                        )}
                        
                        <Badge className={colors.badge}>
                          Total: {totalCredits} Credits
                        </Badge>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-gray-600 text-center">
                          {pkg.description}
                        </p>
                      )}
                      
                      <div className="text-center text-xs text-gray-500">
                        ${(pkg.price_usd / totalCredits).toFixed(2)} per credit
                      </div>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          purchaseCredits(pkg.id);
                        }}
                        disabled={purchasing}
                        className={`w-full ${colors.button} text-white`}
                      >
                        {purchasing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Purchase Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                What you get with every purchase:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Instant credit activation
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  No expiration date
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  High-quality AI storyboards
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  24/7 customer support
                </div>
              </div>
            </div>

            {/* Demo notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Demo Mode</h4>
                  <p className="text-sm text-blue-700">
                    This is a demo version. In production, this would integrate with Stripe, PayPal, or other payment processors. 
                    For now, clicking "Purchase Now" will instantly add credits to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreditRechargeModal;
