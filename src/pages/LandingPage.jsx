import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Image, 
  Users, 
  Zap, 
  Palette, 
  Download, 
  ArrowRight, 
  Play,
  Star,
  CheckCircle,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Storytelling",
      description: "Transform any text into captivating visual storyboards using advanced AI technology"
    },
    {
      icon: <Image className="w-8 h-8 text-green-600" />,
      title: "Character Consistency",
      description: "Create and maintain consistent characters across all your storyboards"
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-600" />,
      title: "Brand Styling",
      description: "Apply your brand colors, logos, and visual style to every generated image"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Generate professional storyboards in seconds, not hours"
    },
    {
      icon: <Download className="w-8 h-8 text-red-600" />,
      title: "Export Ready",
      description: "Download high-quality images ready for presentations and marketing"
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Team Collaboration",
      description: "Share and collaborate on storyboards with your team"
    }
  ];

  const stats = [
    { number: "10K+", label: "Stories Created" },
    { number: "50K+", label: "Images Generated" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "NewsPlay revolutionized our content creation process. We can now create professional storyboards in minutes instead of days.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      company: "DesignStudio",
      content: "The character consistency feature is a game-changer. Our brand characters look perfect across all our marketing materials.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Content Manager",
      company: "MediaGroup",
      content: "The AI understands context so well. Every storyboard tells a compelling visual story that engages our audience.",
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = '/CreateStoryboard';
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">NewsPlay</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleGetStarted}
                className="text-slate-600 hover:text-slate-900"
              >
                Get Started
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered Storytelling Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                Transform Text into
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Visual Stories</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Create stunning storyboards from any text using AI. Maintain character consistency, 
                apply your brand styling, and generate professional visuals in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                >
                  Start Creating Stories
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-3 border-slate-300 hover:bg-slate-50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">See How It Works</h3>
                <p className="text-slate-600">From text to visual storyboard in seconds</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <h3 className="font-semibold text-slate-900">Input Text</h3>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-sm text-slate-600 italic">"A journalist reports live from a political rally in New Delhi, capturing the energy of thousands of supporters..."</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-600 mx-auto md:hidden" />
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <h3 className="font-semibold text-slate-900">AI Processing</h3>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span className="text-sm text-slate-600">Generating storyboard...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '70%'}}></div>
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '45%'}}></div>
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '85%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-600 mx-auto md:hidden" />
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <h3 className="font-semibold text-slate-900">Visual Storyboard</h3>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg h-16 flex items-center justify-center hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-1"></div>
                            <div className="text-xs text-blue-700">Crowd</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg h-16 flex items-center justify-center hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-6 h-6 bg-purple-500 rounded-full mx-auto mb-1"></div>
                            <div className="text-xs text-purple-700">Reporter</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-lg h-16 flex items-center justify-center hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-1"></div>
                            <div className="text-xs text-green-700">Stage</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg h-16 flex items-center justify-center hover:scale-105 transition-transform">
                          <div className="text-center">
                            <div className="w-6 h-6 bg-orange-500 rounded-full mx-auto mb-1"></div>
                            <div className="text-xs text-orange-700">Flags</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Storytelling
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to create professional storyboards that engage and inspire your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-slate-50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg text-slate-900">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Create professional storyboards in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs text-blue-600">📝</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Upload Your Text</h3>
              <p className="text-slate-600 leading-relaxed">Paste your article, story, or any text content into our platform. Our AI will analyze the content and understand the narrative structure.</p>
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700 italic">"A journalist reports live from a political rally..."</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Generates Storyboard</h3>
              <p className="text-slate-600 leading-relaxed">Our advanced AI analyzes your content and creates a visual storyboard with high-quality images that match your story's tone and style.</p>
              <div className="mt-4 bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-sm text-green-700 ml-2">Generating...</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Download className="w-3 h-3 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Download & Share</h3>
              <p className="text-slate-600 leading-relaxed">Download high-quality images and share your storyboard with the world. Perfect for presentations, social media, and marketing materials.</p>
              <div className="mt-4 bg-purple-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-purple-200 rounded h-8"></div>
                  <div className="bg-purple-200 rounded h-8"></div>
                  <div className="bg-purple-200 rounded h-8"></div>
                  <div className="bg-purple-200 rounded h-8"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Example Storyboards Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              See NewsPlay in Action
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real examples of storyboards created with NewsPlay
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Example 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Political Rally Coverage</h3>
                <p className="text-sm text-slate-600 mb-4">Journalist reporting live from New Delhi</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-blue-700">Crowd Scene</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-green-700">Reporter</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-purple-700">Stage</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-orange-700">Flags</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Example 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Tech Conference</h3>
                <p className="text-sm text-slate-600 mb-4">Startup pitch presentation</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-indigo-700">Audience</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-pink-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-pink-700">Speaker</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-teal-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-teal-700">Screen</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-red-700">Stage</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Example 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Product Launch</h3>
                <p className="text-sm text-slate-600 mb-4">New smartphone announcement</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-yellow-700">Product</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-cyan-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-cyan-700">CEO</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-emerald-700">Crowd</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg h-20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-violet-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-violet-700">Lights</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by Content Creators
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See what our users are saying about NewsPlay
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-slate-600">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{testimonial.name}</div>
                        <div className="text-sm text-slate-600">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of content creators who are already using NewsPlay to create stunning visual stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
              >
                Start Creating Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-white border-white hover:bg-white/10 text-lg px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NewsPlay</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Transform any text into captivating visual storyboards using AI. 
                Create consistent characters, apply brand styling, and generate professional visuals in seconds.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Shield className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 NewsPlay. All rights reserved. Built with ❤️ for content creators.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
};

export default LandingPage;
