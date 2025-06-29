import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Download, 
  Package, 
  DollarSign, 
  Calendar, 
  FileText, 
  Hammer, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Edit,
  Home,
  Phone,
  Mail,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';
import { supabase } from '../lib/supabase';

interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  project_name: string;
  property_type: string;
  project_area?: string;
  budget_range: string;
  timeline: string;
  requirements: string;
  preferred_designer?: string;
  layout_image_url?: string;
  inspiration_links: string[];
  room_types: string[];
  special_requirements?: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_designer_id?: string;
  assignment_status?: string;
}

interface MaterialPrice {
  id: string;
  designer_id: string;
  category: string;
  name: string;
  description: string;
  unit: string;
  base_price: number;
  discount_price: number | null;
  is_discounted: boolean;
  brand: string;
  quality_grade: string;
  is_available: boolean;
}

interface QuoteItem {
  id?: string;
  material_id?: string;
  item_type: 'material' | 'labor' | 'service' | 'other';
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  amount: number;
  material?: MaterialPrice;
}

interface Quote {
  id?: string;
  designer_id: string;
  project_id: string;
  quote_number: string;
  title: string;
  description: string;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  terms_and_conditions: string;
  notes: string;
  items: QuoteItem[];
}

const DesignerQuoteGenerator = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { designer, isDesigner, loading: designerLoading } = useDesignerProfile();
  
  const [project, setProject] = useState<Customer | null>(null);
  const [materials, setMaterials] = useState<MaterialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeStep, setActiveStep] = useState<'details' | 'items' | 'preview'>('details');
  
  const [quote, setQuote] = useState<Quote>({
    designer_id: '',
    project_id: '',
    quote_number: '',
    title: '',
    description: '',
    subtotal: 0,
    discount_amount: 0,
    tax_rate: 18, // Default GST rate
    tax_amount: 0,
    total_amount: 0,
    status: 'draft',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    terms_and_conditions: 'This quote is valid for 30 days from the date of issue. 50% advance payment required to begin work. Balance payment due upon completion.',
    notes: '',
    items: []
  });

  const categories = [
    'Plywood & Boards',
    'Hardware',
    'Channels & Profiles',
    'Laminates & Veneers',
    'Countertops',
    'Flooring',
    'Lighting',
    'Paints & Finishes',
    'Fabrics & Upholstery',
    'Accessories',
    'Labor',
    'Services',
    'Other'
  ];

  const steps = [
    { id: 'details', label: 'Quote Details' },
    { id: 'items', label: 'Add Items' },
    { id: 'preview', label: 'Preview & Send' }
  ];

  const itemTypes = [
    { value: 'material', label: 'Material', icon: Package },
    { value: 'labor', label: 'Labor', icon: Hammer },
    { value: 'service', label: 'Service', icon: Briefcase },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  useEffect(() => {
    if (!designerLoading && designer && projectId) {
      fetchProject();
      fetchMaterials();
      generateQuoteNumber();
    }
  }, [designer, designerLoading, projectId]);

  const fetchProject = async () => {
    if (!designer || !projectId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', projectId)
        .eq('assigned_designer_id', designer.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Project not found or you do not have access to this project');
      }
      
      setProject(data);
      
      // Initialize quote with project data
      setQuote(prev => ({
        ...prev,
        designer_id: designer.id,
        project_id: data.id,
        title: `Quote for ${data.project_name}`,
        description: `Interior design services for ${data.property_type} in ${data.location}`
      }));
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError(error.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    if (!designer) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('designer_material_prices')
        .select('*')
        .eq('designer_id', designer.id)
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      setMaterials(data || []);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      setError(error.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const generateQuoteNumber = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const quoteNumber = `Q${year}${month}${day}-${random}`;
    setQuote(prev => ({ ...prev, quote_number: quoteNumber }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tax_rate' || name === 'discount_amount') {
      setQuote(prev => {
        const newQuote = { ...prev, [name]: parseFloat(value) || 0 };
        return calculateTotals(newQuote);
      });
    } else {
      setQuote(prev => ({ ...prev, [name]: value }));
    }
  };

  const addCustomItem = () => {
    const newItem: QuoteItem = {
      item_type: 'other',
      name: 'Custom Item',
      description: '',
      quantity: 1,
      unit: 'item',
      unit_price: 0,
      discount_percent: 0,
      amount: 0
    };
    
    setQuote(prev => {
      const newQuote = {
        ...prev,
        items: [...prev.items, newItem]
      };
      return calculateTotals(newQuote);
    });
  };

  const addMaterialItem = (material: MaterialPrice) => {
    const price = material.is_discounted && material.discount_price 
      ? material.discount_price 
      : material.base_price;
    
    const newItem: QuoteItem = {
      material_id: material.id,
      item_type: 'material',
      name: material.name,
      description: material.description,
      quantity: 1,
      unit: material.unit,
      unit_price: price,
      discount_percent: 0,
      amount: price,
      material: material
    };
    
    setQuote(prev => {
      const newQuote = {
        ...prev,
        items: [...prev.items, newItem]
      };
      return calculateTotals(newQuote);
    });
    
    setShowMaterialSelector(false);
    setSearchTerm('');
    setCategoryFilter('');
  };

  const updateItem = (index: number, field: string, value: any) => {
    setQuote(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], [field]: value };
      
      // Recalculate amount if quantity, unit_price, or discount_percent changes
      if (field === 'quantity' || field === 'unit_price' || field === 'discount_percent') {
        const quantity = field === 'quantity' ? value : item.quantity;
        const unitPrice = field === 'unit_price' ? value : item.unit_price;
        const discountPercent = field === 'discount_percent' ? value : item.discount_percent;
        
        const discountMultiplier = 1 - (discountPercent / 100);
        item.amount = quantity * unitPrice * discountMultiplier;
      }
      
      newItems[index] = item;
      
      const newQuote = {
        ...prev,
        items: newItems
      };
      
      return calculateTotals(newQuote);
    });
  };

  const removeItem = (index: number) => {
    setQuote(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const newQuote = {
        ...prev,
        items: newItems
      };
      return calculateTotals(newQuote);
    });
  };

  const calculateTotals = (quoteData: Quote): Quote => {
    // Calculate subtotal
    const subtotal = quoteData.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply discount
    const discountAmount = quoteData.discount_amount || 0;
    
    // Calculate tax
    const taxableAmount = subtotal - discountAmount;
    const taxRate = quoteData.tax_rate || 0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    
    // Calculate total
    const totalAmount = taxableAmount + taxAmount;
    
    return {
      ...quoteData,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    };
  };

  const validateQuote = (): boolean => {
    if (!quote.title.trim()) {
      setError('Quote title is required');
      return false;
    }
    
    if (quote.items.length === 0) {
      setError('At least one item is required');
      return false;
    }
    
    if (!quote.valid_until) {
      setError('Valid until date is required');
      return false;
    }
    
    // Check if all items have valid values
    for (const item of quote.items) {
      if (!item.name.trim()) {
        setError('All items must have a name');
        return false;
      }
      
      if (item.quantity <= 0) {
        setError('All items must have a quantity greater than zero');
        return false;
      }
      
      if (item.unit_price < 0) {
        setError('All items must have a non-negative unit price');
        return false;
      }
    }
    
    return true;
  };

  const saveQuote = async (status: 'draft' | 'sent' = 'draft') => {
    if (!designer || !project) return;
    
    if (!validateQuote()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare quote data
      const quoteData = {
        ...quote,
        status
      };
      
      // Extract items to insert separately
      const { items, ...quoteWithoutItems } = quoteData;
      
      // Insert or update quote
      let quoteId = quote.id;
      
      if (quoteId) {
        // Update existing quote
        const { error: updateError } = await supabase
          .from('designer_quotes')
          .update(quoteWithoutItems)
          .eq('id', quoteId);
          
        if (updateError) throw updateError;
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', quoteId);
          
        if (deleteError) throw deleteError;
      } else {
        // Insert new quote
        const { data: insertedQuote, error: insertError } = await supabase
          .from('designer_quotes')
          .insert(quoteWithoutItems)
          .select()
          .single();
          
        if (insertError) throw insertError;
        if (!insertedQuote) throw new Error('Failed to create quote');
        
        quoteId = insertedQuote.id;
        setQuote(prev => ({ ...prev, id: quoteId }));
      }
      
      // Insert items
      const itemsToInsert = items.map(item => ({
        quote_id: quoteId,
        material_id: item.material_id,
        item_type: item.item_type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        amount: item.amount
      }));
      
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;
      
      setSuccess(status === 'draft' 
        ? 'Quote saved as draft successfully!' 
        : 'Quote sent to customer successfully!');
        
      // If sent, navigate back to projects after a delay
      if (status === 'sent') {
        setTimeout(() => {
          navigate('/designer-quotes');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error saving quote:', error);
      setError(error.message || 'Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
                         material.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (designerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isDesigner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be a registered designer to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
            <p className="font-medium">Error loading project</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/customer-projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/customer-projects')}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </button>
              <h1 className="text-3xl font-bold text-secondary-800 mb-2">
                Generate Quote
              </h1>
              <p className="text-gray-600">
                Create a detailed quote for {project?.project_name}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => saveQuote('draft')}
                className="btn-secondary flex items-center space-x-2"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              <button
                onClick={() => saveQuote('sent')}
                className="btn-primary flex items-center space-x-2"
                disabled={loading}
              >
                <Send className="w-4 h-4" />
                <span>Send to Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2 animate-fadeIn">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Steps Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(step.id as any)}
                  className={`flex flex-col items-center space-y-2 ${
                    activeStep === step.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  disabled={loading}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep === step.id 
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-500' 
                      : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${
                    index < steps.findIndex(s => s.id === activeStep) ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quote Details Step */}
            {activeStep === 'details' && <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6">Quote Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Number
                  </label>
                  <input
                    type="text"
                    name="quote_number"
                    value={quote.quote_number}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="valid_until"
                      value={quote.valid_until}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={quote.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Interior Design Services for 3BHK Apartment"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={quote.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Provide a brief description of the services covered in this quote"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setActiveStep('items')}
                  className="btn-primary"
                >
                  Continue to Add Items
                </button>
              </div>
            </div>}

            {/* Quote Items Step */}
            {activeStep === 'items' && <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-800">Quote Items</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMaterialSelector(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                  >
                    <Package className="w-4 h-4" />
                    <span>Add Material</span>
                  </button>
                  <button
                    onClick={addCustomItem}
                    className="bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom</span>
                  </button>
                </div>
              </div>

              {quote.items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Added</h3>
                  <p className="text-gray-500 mb-4">
                    Add materials from your catalog or custom items to your quote.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setShowMaterialSelector(true)}
                      className="bg-primary-100 text-primary-700 hover:bg-primary-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <Package className="w-4 h-4" />
                      <span>Add Material</span>
                    </button>
                    <button
                      onClick={addCustomItem}
                      className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Custom Item</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-secondary-800">Item</th>
                        <th className="text-center py-3 px-4 font-semibold text-secondary-800">Qty</th>
                        <th className="text-center py-3 px-4 font-semibold text-secondary-800">Unit</th>
                        <th className="text-right py-3 px-4 font-semibold text-secondary-800">Unit Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-secondary-800">Discount %</th>
                        <th className="text-right py-3 px-4 font-semibold text-secondary-800">Amount</th>
                        <th className="text-center py-3 px-4 font-semibold text-secondary-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                className="font-medium text-secondary-800 w-full border-0 bg-transparent focus:ring-0 p-0"
                                placeholder="Item name"
                              />
                              <textarea
                                value={item.description || ''}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                className="text-sm text-gray-600 w-full border-0 bg-transparent focus:ring-0 p-0 resize-none"
                                placeholder="Description (optional)"
                                rows={1}
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min="0.01"
                              step="0.01"
                              className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => updateItem(index, 'unit', e.target.value)}
                              className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end">
                              <span className="text-gray-500 mr-1">₹</span>
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-right focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="number"
                                value={item.discount_percent}
                                onChange={(e) => updateItem(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                              <span className="text-gray-500 ml-1">%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-secondary-800">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setActiveStep('details')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back to Details
                </button>
                <button
                  onClick={() => setActiveStep('preview')}
                  className="btn-primary"
                  disabled={quote.items.length === 0}
                >
                  Continue to Preview
                </button>
              </div>
            </div>}

            {/* Terms and Notes (in Items step) */}
            {activeStep === 'items' && <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6">Terms and Notes</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    name="terms_and_conditions"
                    value={quote.terms_and_conditions}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter terms and conditions for this quote"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={quote.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any additional notes or comments for the customer"
                  />
                </div>
              </div>
            </div>}
            
            {/* Quote Preview Step */}
            {activeStep === 'preview' && (
              <div className="bg-white rounded-xl shadow-lg p-8 animate-fadeIn">
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex justify-between items-start">
                    {/* Designer Info */}
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-800">{designer?.name}</h2>
                      <p className="text-gray-600">{designer?.specialization}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {designer?.email}
                        </p>
                        {designer?.phone && (
                          <p className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {designer?.phone}
                          </p>
                        )}
                        <p className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {designer?.location}
                        </p>
                      </div>
                    </div>
                    
                    {/* Quote Info */}
                    <div className="text-right">
                      <div className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-lg text-sm font-medium mb-2">
                        QUOTATION
                      </div>
                      <p className="text-lg font-semibold text-secondary-800">{quote.quote_number}</p>
                      <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Valid Until: {new Date(quote.valid_until).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Quote Title */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-secondary-800 mb-2">{quote.title}</h1>
                  {quote.description && (
                    <p className="text-gray-600">{quote.description}</p>
                  )}
                </div>
                
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium">{project?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project</p>
                      <p className="font-medium">{project?.project_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{project?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{project?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{project?.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Property Type</p>
                      <p className="font-medium">{project?.property_type}</p>
                    </div>
                  </div>
                </div>
                
                {/* Quote Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quote Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-secondary-800">Item</th>
                          <th className="text-center py-3 px-4 font-semibold text-secondary-800">Qty</th>
                          <th className="text-center py-3 px-4 font-semibold text-secondary-800">Unit</th>
                          <th className="text-right py-3 px-4 font-semibold text-secondary-800">Unit Price</th>
                          <th className="text-center py-3 px-4 font-semibold text-secondary-800">Discount</th>
                          <th className="text-right py-3 px-4 font-semibold text-secondary-800">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-secondary-800">{item.name}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">{item.quantity}</td>
                            <td className="py-4 px-4 text-center">{item.unit}</td>
                            <td className="py-4 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="py-4 px-4 text-center">
                              {item.discount_percent > 0 ? `${item.discount_percent}%` : '-'}
                            </td>
                            <td className="py-4 px-4 text-right font-medium">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Quote Summary */}
                <div className="flex justify-end mb-8">
                  <div className="w-full md:w-64">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                      </div>
                      
                      {quote.discount_amount > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(quote.discount_amount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-gray-600">
                        <span>Tax ({quote.tax_rate}%):</span>
                        <span>{formatCurrency(quote.tax_amount)}</span>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-secondary-800">Total:</span>
                          <span className="text-primary-600">{formatCurrency(quote.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Terms and Notes */}
                <div className="space-y-6">
                  {quote.terms_and_conditions && (
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-800 mb-2">Terms and Conditions</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 whitespace-pre-line">{quote.terms_and_conditions}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-800 mb-2">Additional Notes</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 whitespace-pre-line">{quote.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setActiveStep('items')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back to Items
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => saveQuote('draft')}
                      className="btn-secondary flex items-center space-x-2"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      onClick={() => saveQuote('sent')}
                      className="btn-primary flex items-center space-x-2"
                      disabled={loading}
                    >
                      <Send className="w-4 h-4" />
                      <span>Send to Customer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quote Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6">Quote Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">₹</span>
                      <input
                        type="number"
                        name="discount_amount"
                        value={quote.discount_amount}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-right focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax Rate (GST):</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="tax_rate"
                        value={quote.tax_rate}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-right focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="text-gray-500 ml-1">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax Amount:</span>
                  <span>{formatCurrency(quote.tax_amount)}</span>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-secondary-800">Total:</span>
                    <span className="text-primary-600">{formatCurrency(quote.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              {activeStep !== 'preview' && (
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => saveQuote('draft')}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveStep('preview')}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                    disabled={quote.items.length === 0}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Quote</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // In a real app, this would generate a PDF
                      alert('PDF download functionality would be implemented here');
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Customer Info */}
            {project && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-secondary-800 mb-4">Customer Information</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{project.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{project.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{project.phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="font-medium">{project.project_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium">{project.property_type}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <p className="font-medium">{project.budget_range}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-secondary-800">Select Material</h2>
              <button
                onClick={() => {
                  setShowMaterialSelector(false);
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Materials Grid */}
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Materials Found</h3>
                  <p className="text-gray-500 mb-4">
                    {materials.length === 0 
                      ? "You haven't added any materials to your pricing catalog yet."
                      : "No materials match your current search filters."}
                  </p>
                  {materials.length === 0 && (
                    <button
                      onClick={() => {
                        setShowMaterialSelector(false);
                        navigate('/designer-material-pricing');
                      }}
                      className="btn-primary"
                    >
                      Add Materials to Catalog
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((material) => (
                    <div 
                      key={material.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => addMaterialItem(material)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-secondary-800">{material.name}</h3>
                          <p className="text-sm text-gray-500">{material.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          material.quality_grade === 'Budget' ? 'bg-green-100 text-green-800' :
                          material.quality_grade === 'Standard' ? 'bg-blue-100 text-blue-800' :
                          material.quality_grade === 'Premium' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {material.quality_grade}
                        </span>
                      </div>
                      
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{material.unit}</span>
                        <div>
                          {material.is_discounted && material.discount_price ? (
                            <div className="text-right">
                              <p className="font-medium text-primary-600">₹{material.discount_price.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 line-through">₹{material.base_price.toLocaleString()}</p>
                            </div>
                          ) : (
                            <p className="font-medium text-secondary-800">₹{material.base_price.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerQuoteGenerator;