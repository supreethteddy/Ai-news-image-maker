import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  User,
  Calendar,
  Palette,
  Image,
  AlertTriangle,
  Shield,
  Download,
  RefreshCw,
  Settings,
  Layers,
  Star,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import StoryboardViewModal from './StoryboardViewModal';
import SimpleStoryboardModal from './SimpleStoryboardModal';
import TemplateViewModal from './TemplateViewModal';

export default function ContentManagement() {
  const [storyboards, setStoryboards] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('storyboards');
  const [selectedStoryboard, setSelectedStoryboard] = useState(null);
  const [showStoryboardModal, setShowStoryboardModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [storyboards, templates, characters, searchTerm, filterType, filterStatus]);

  // Force re-render when storyboards change
  useEffect(() => {
    console.log('🔄 Storyboards updated:', storyboards.length, 'items');
    if (storyboards.length > 0) {
      console.log('📝 First storyboard author in state:', storyboards[0]?.author);
    }
  }, [storyboards]);

  const loadContent = async () => {
    setIsLoading(true);
    console.log('📚 Loading content...');
    console.log('🔑 Token available:', !!token);
    
    try {
      // Load storyboards
      const storyboardsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/content/storyboards`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      console.log('📚 Storyboards response status:', storyboardsResponse.status);
      
      if (storyboardsResponse.ok) {
        const storyboardsData = await storyboardsResponse.json();
        console.log('✅ Storyboards data received:', storyboardsData);
        console.log('📝 First storyboard author:', storyboardsData.data?.[0]?.author);
        setStoryboards(storyboardsData.data || []);
      } else {
        const errorText = await storyboardsResponse.text();
        console.error('❌ Failed to fetch storyboards:', storyboardsResponse.status, errorText);
        setStoryboards([]);
      }

      // Load templates
      const templatesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/styling-templates`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.data || []);
      } else {
        console.error('Failed to fetch templates:', templatesResponse.status);
        setTemplates([]);
      }

      // Load characters
      const charactersResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/characters`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json();
        setCharacters(charactersData.data || []);
      } else {
        console.error('Failed to fetch characters:', charactersResponse.status);
        setCharacters([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setStoryboards([]);
      setTemplates([]);
      setCharacters([]);
      toast.error('Failed to load content');
    }
    setIsLoading(false);
  };

  const filterContent = () => {
    let content = [];
    
    if (activeTab === 'storyboards') {
      content = storyboards;
    } else if (activeTab === 'templates') {
      content = templates;
    } else if (activeTab === 'characters') {
      content = characters;
    }

    // Search filter
    if (searchTerm) {
      content = content.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      content = content.filter(item => item.status === filterStatus);
    }

    setFilteredContent(content);
  };

  const handleApproval = async (itemId, action) => {
    try {
      console.log(`${action} item ${itemId}`);
      toast.success(`Content ${action} successfully`);
      
      // Update local state
      const updateItem = (items) => items.map(item => 
        item.id === itemId ? { ...item, status: action } : item
      );

      if (activeTab === 'storyboards') {
        setStoryboards(updateItem);
      } else if (activeTab === 'templates') {
        setTemplates(updateItem);
      } else if (activeTab === 'characters') {
        setCharacters(updateItem);
      }
    } catch (error) {
      console.error(`Error ${action} content:`, error);
      toast.error(`Failed to ${action} content`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    try {
      console.log(`Performing bulk ${action} on items:`, selectedItems);
      toast.success(`Bulk ${action} completed for ${selectedItems.length} items`);
      setSelectedItems([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} items`);
    }
  };

  const handleViewStoryboard = (storyboard) => {
    console.log('🔍 Opening storyboard modal for:', storyboard.title);
    console.log('📖 Storyboard data:', storyboard);
    console.log('🎭 Current modal state:', showStoryboardModal);
    setSelectedStoryboard(storyboard);
    setShowStoryboardModal(true);
    console.log('✅ Modal state set to true');
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleRefresh = () => {
    // Clear current data to force re-render
    setStoryboards([]);
    setTemplates([]);
    setCharacters([]);
    setFilteredContent([]);
    
    // Reload content
    loadContent();
    toast.success('Content refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderStoryboards = () => (
    <div className="space-y-4">
      {filteredContent.map((storyboard, index) => (
        <div
          key={`${storyboard.id}-${storyboard.author}-${index}`}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(storyboard.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, storyboard.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== storyboard.id));
                    }
                  }}
                  className="rounded"
                />
                <h3 className="font-semibold text-lg">{storyboard.title}</h3>
                <Badge className={getStatusColor(storyboard.status)}>
                  {getStatusIcon(storyboard.status)}
                  <span className="ml-1">{storyboard.status}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {storyboard.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(storyboard.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {storyboard.parts} parts
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {storyboard.views} views
                </div>
                {storyboard.flags > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Flag className="h-4 w-4" />
                    {storyboard.flags} flags
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('👁️ View button clicked!');
                  alert('View button clicked for: ' + storyboard.title);
                  handleViewStoryboard(storyboard);
                }}
                type="button"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {storyboard.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproval(storyboard.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleApproval(storyboard.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => console.log('Edit storyboard', storyboard.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-4">
      {filteredContent.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(template.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, template.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== template.id));
                    }
                  }}
                  className="rounded"
                />
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <Badge className={getStatusColor(template.status)}>
                  {getStatusIcon(template.status)}
                  <span className="ml-1">{template.status}</span>
                </Badge>
                {template.public && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Star className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {template.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(template.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  {template.usage} uses
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewTemplate(template);
                }}
                type="button"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {template.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproval(template.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleApproval(template.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => console.log('Edit template', template.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCharacters = () => (
    <div className="space-y-4">
      {filteredContent.map((character, index) => (
        <motion.div
          key={character.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(character.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, character.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== character.id));
                    }
                  }}
                  className="rounded"
                />
                <h3 className="font-semibold text-lg">{character.name}</h3>
                <Badge className={getStatusColor(character.status)}>
                  {getStatusIcon(character.status)}
                  <span className="ml-1">{character.status}</span>
                </Badge>
                {character.public && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Star className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {character.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(character.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  {character.usage} uses
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => console.log('View character', character.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {character.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproval(character.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleApproval(character.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => console.log('Edit character', character.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'storyboards', label: 'Storyboards', icon: FileText, count: storyboards.length },
    { id: 'templates', label: 'Templates', icon: Palette, count: templates.length },
    { id: 'characters', label: 'Characters', icon: Layers, count: characters.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        {/* Debug info */}
        {showStoryboardModal && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Modal Open: {selectedStoryboard?.title}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedItems([]);
                }}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <Badge className="bg-gray-100 text-gray-600">{tab.count}</Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Content</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedItems.length} item(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === 'storyboards' && <FileText className="h-5 w-5" />}
            {activeTab === 'templates' && <Palette className="h-5 w-5" />}
            {activeTab === 'characters' && <Layers className="h-5 w-5" />}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {activeTab === 'storyboards' && renderStoryboards()}
            {activeTab === 'templates' && renderTemplates()}
            {activeTab === 'characters' && renderCharacters()}
          </AnimatePresence>

          {filteredContent.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No content found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storyboard View Modal */}
      <SimpleStoryboardModal
        storyboard={selectedStoryboard}
        isOpen={showStoryboardModal}
        onClose={() => {
          setShowStoryboardModal(false);
          setSelectedStoryboard(null);
        }}
      />

      {/* Template View Modal */}
      <TemplateViewModal
        template={selectedTemplate}
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setSelectedTemplate(null);
        }}
      />
    </div>
  );
}
