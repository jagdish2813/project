import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  ArrowLeft,
  Eye,
  Download,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Loader2,
  IndianRupee as Rupee,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SendToDesignerModal from '../components/SendToDesignerModal';

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  item_type: string;
}

interface Quote {
  id: string;
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
  status: string;
  valid_until: string;
  terms_and_conditions: string;
  notes: string;
  created_at: string;
  updated_at: string;
  customer_accepted: boolean;
  acceptance_date: string | null;
  customer_feedback: string | null;
  assigned_designer_id?: string;
  designer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    profile_image: string;
  };
  project: {
    id: string;
    project_name: string;
    assigned_designer_id?: string;
  };
  items: QuoteItem[];
}

const CustomerQuotes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFilter = searchParams.get('projectId');
  const { user, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchQuotes();
  }, [authLoading, user, navigate]);

  const fetchQuotes = async () => {
   // if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First try using the RPC function
      const { data: quotesData, error: quotesError } = await supabase
        .rpc('get_customer_quotes');

      if (quotesError) throw quotesError;
      
      console.log('Quotes data:', quotesData);
      
      // If no quotes data from RPC, try using the view
      if (!quotesData || quotesData.length === 0) {
        console.log('No quotes from RPC, trying view...');
        const { data: viewQuotes, error: viewError } = await supabase
          .from('customer_quotes_with_items')
          .select('*');
          
        if (viewError) {
          console.error('Error in view quotes query:', viewError);
          
          // Last resort: try direct query
          const { data: customerProjects, error: projectsError } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id);

          if (projectsError) throw projectsError;
          
          if (!customerProjects || customerProjects.length === 0) {
            setQuotes([]);
            setLoading(false);
            return;
          }

          const projectIds = customerProjects.map(p => p.id);
          
          console.log('Project IDs:', projectIds);
          
          // Direct query as last resort
          const { data: directQuotes, error: directError } = await supabase
            .from('designer_quotes')
            .select(`
              *,
              designer:designers(id, name, email, phone, specialization, profile_image),
              project:customers(id, project_name, user_id, assigned_designer_id)
            `)
            .in('project_id', projectIds)
            .order('created_at', { ascending: false });
            
          if (directError) {
            console.error('Error in direct quotes query:', directError);
          } else if (directQuotes) {
            console.log('Direct quotes found:', directQuotes.length);
            
            // For each quote, fetch its items
            const quotesWithItems = await Promise.all(directQuotes.map(async (quote) => {
              const { data: items, error: itemsError } = await supabase
                .from('quote_items')
                .select('*')
                .eq('quote_id', quote.id);
                
              if (itemsError) {
                console.error('Error fetching quote items:', itemsError);
                return { ...quote, items: [] };
              }
              
              return { ...quote, items: items || [] };
            }));
            
            setQuotes(quotesWithItems);
            return;
          }
        } else if (viewQuotes) {
          console.log('View quotes found:', viewQuotes.length);
          setQuotes(viewQuotes);
          return;
        }
      }
      
      // Process quotes from the RPC function
      const processedQuotes = (quotesData || []).map(quote => {
        // Parse items if they're in JSON string format
        let items = quote.items || [];
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error('Error parsing items JSON:', e);
            items = [];
          }
        }
        
        return {
          ...quote,
          items: items
        };
      });
      
      setAllQuotes(processedQuotes);

      // Filter by project if projectId is in URL
      if (projectIdFilter) {
        setQuotes(processedQuotes.filter(q => q.project_id === projectIdFilter));
      } else {
        setQuotes(processedQuotes);
      }
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      setError(error.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('designer_quotes')
        .update({
          customer_accepted: true,
          customer_feedback: feedbackText || 'Quote accepted',
          status: 'accepted'
        })
        .eq('id', quoteId);
        
      if (error) throw error;
      
      setSuccessMessage('Quote accepted successfully!');
      setSelectedQuote(null);
      setFeedbackText('');
      
      // Refresh quotes
      fetchQuotes();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error accepting quote:', error);
      setError(error.message || 'Failed to accept quote');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRejectQuote = async (quoteId: string) => {
    if (!user || !feedbackText) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('designer_quotes')
        .update({
          customer_accepted: false,
          customer_feedback: feedbackText,
          status: 'rejected'
        })
        .eq('id', quoteId);
        
      if (error) throw error;
      
      setSuccessMessage('Quote rejected. Your feedback has been sent to the designer.');
      setSelectedQuote(null);
      setFeedbackText('');
      
      // Refresh quotes
      fetchQuotes();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error rejecting quote:', error);
      setError(error.message || 'Failed to reject quote');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string, accepted: boolean) => {
    switch (status) {
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Draft</span>;
      case 'sent':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Pending Review</span>;
      case 'accepted':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'expired':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Expired</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your quotes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Please sign in to view your quotes</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/my-projects')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-secondary-800 mb-2">
            {projectIdFilter && quotes.length > 0 ? `Quotes for ${quotes[0].project?.project_name}` : 'My Quotes'}
          </h1>
          <p className="text-gray-600">
            {projectIdFilter ? 'Review quotes from designers for this project' : 'Review and manage quotes from designers for your projects'}
          </p>
          {projectIdFilter && (
            <button
              onClick={() => navigate('/customer-quotes')}
              className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View All Quotes</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">No Quotes Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven't received any quotes from designers yet. Once designers create quotes for your projects, they will appear here.
              </p>
              <button
                onClick={() => navigate('/my-projects')}
                className="btn-primary"
              >
                View My Projects
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-secondary-800">{quote.title}</h3>
                        {getStatusBadge(quote.status, quote.customer_accepted)}
                        {quote.status === 'sent' && !quote.customer_accepted && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Action Required</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Quote #{quote.quote_number}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Project: <span className="font-medium">{quote.project?.project_name}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">{formatCurrency(quote.total_amount)}</p>
                      <div className="flex items-center justify-end space-x-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>Valid until: {new Date(quote.valid_until).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {quote.description && (
                    <p className="text-gray-600 mb-4">{quote.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Created: {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{quote.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      {quote.designer?.profile_image ? (
                        <img src={quote.designer.profile_image} alt={quote.designer.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">{quote.designer?.name?.charAt(0) || 'D'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-800">{quote.designer?.name}</p>
                      <p className="text-sm text-gray-600">{quote.designer?.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-medium">{formatCurrency(quote.subtotal)}</p>
                    </div>
                    {quote.discount_amount > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-medium text-green-600">-{formatCurrency(quote.discount_amount)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Tax ({quote.tax_rate}%)</p>
                      <p className="font-medium">{formatCurrency(quote.tax_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                      <p className="text-lg font-bold text-primary-600">{formatCurrency(quote.total_amount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {quote.status === 'sent' && !quote.customer_accepted && (
                      <>
                        <button 
                          onClick={() => setSelectedQuote(quote)}
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review & Respond</span>
                        </button>
                      </>
                    )}
                    
                    {(quote.status === 'accepted' || quote.customer_accepted) && (
                      <>
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>View Accepted Quote</span>
                        </button>
                        {/* Only show Assign Designer if project doesn't have assigned_designer_id */}
                        {!quote.assigned_designer_id && (
                          <button
                            onClick={async () => {
                              // Fetch full project data
                              const { data: fullProject, error } = await supabase
                                .from('customers')
                                .select('*')
                                .eq('id', quote.project_id)
                                .maybeSingle();

                              if (error) {
                                console.error('Error fetching project:', error);
                                setError('Failed to load project data');
                                return;
                              }

                              if (fullProject) {
                                setSelectedProjectForAssignment(fullProject);
                                setShowAssignModal(true);
                              }
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Assign Designer</span>
                          </button>
                        )}
                      </>
                    )}
                    
                    {quote.status === 'rejected' && (
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejected Quote</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.open(`/generate-quote/${quote.project_id}?view=true&id=${quote.id}`, '_blank')}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Review Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-secondary-800">Review Quote</h2>
              <button
                onClick={() => {
                  setSelectedQuote(null);
                  setFeedbackText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-secondary-800">{selectedQuote.title}</h3>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(selectedQuote.total_amount)}</span>
                </div>
                <p className="text-gray-600">{selectedQuote.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(selectedQuote.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Valid until: {new Date(selectedQuote.valid_until).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-secondary-800 mb-3">Designer Information</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    {selectedQuote.designer?.profile_image ? (
                      <img 
                        src={selectedQuote.designer.profile_image} 
                        alt={selectedQuote.designer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {selectedQuote.designer?.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-800">{selectedQuote.designer?.name}</p>
                    <p className="text-sm text-gray-600">{selectedQuote.designer?.specialization}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{selectedQuote.designer?.email}</span>
                      {selectedQuote.designer?.phone && (
                        <>
                          <span>•</span>
                          <span>{selectedQuote.designer?.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-secondary-800 mb-3">Quote Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      {selectedQuote.items && selectedQuote.items.length > 0 ? (
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No items available</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedQuote.items && selectedQuote.items.length > 0 ? selectedQuote.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{item.description || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{item.quantity} {item.unit}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="py-3 px-4 text-sm text-gray-500 text-center">No items available for this quote</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">Subtotal</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">{formatCurrency(selectedQuote.subtotal)}</td>
                      </tr>
                      {selectedQuote.discount_amount > 0 && (
                        <tr>
                          <td colSpan={4} className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">Discount</td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">-{formatCurrency(selectedQuote.discount_amount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">Tax ({selectedQuote.tax_rate}%)</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">{formatCurrency(selectedQuote.tax_amount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-base font-bold text-secondary-800 text-right">Total</td>
                        <td className="py-3 px-4 text-base font-bold text-primary-600 text-right">{formatCurrency(selectedQuote.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedQuote.terms_and_conditions && (
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-800 mb-3">Terms & Conditions</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                    {selectedQuote.terms_and_conditions}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-semibold text-secondary-800 mb-3">Your Feedback</h4>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add your comments or feedback about this quote (required for rejection)"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedQuote(null);
                    setFeedbackText('');
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRejectQuote(selectedQuote.id)}
                  disabled={submitting || !feedbackText.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                  <span>Reject Quote</span>
                </button>
                <button
                  onClick={() => handleAcceptQuote(selectedQuote.id)}
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  <span>Accept Quote</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Designer Modal */}
      {selectedProjectForAssignment && (
        <SendToDesignerModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedProjectForAssignment(null);
          }}
          project={selectedProjectForAssignment}
        />
      )}
    </div>
  );
};

export default CustomerQuotes;