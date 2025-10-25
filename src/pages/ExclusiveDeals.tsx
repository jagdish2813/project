import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tag, Clock, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Deal {
  id: string;
  designer_id: string;
  title: string;
  description: string;
  discount_percentage: number;
  original_price: number;
  deal_price: number;
  deal_type: string;
  services_included: string[];
  terms_conditions: string;
  valid_from: string;
  valid_until: string;
  max_redemptions: number | null;
  current_redemptions: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  designers?: {
    id: string;
    name: string;
    specialization: string;
    rating: number;
    profile_image: string;
  };
}

export default function ExclusiveDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('designer_deals')
        .select(`
          *,
          designers (
            id,
            name,
            specialization,
            rating,
            profile_image
          )
        `)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allDeals = data || [];
      setDeals(allDeals);
      setFeaturedDeals(allDeals.filter(deal => deal.is_featured));
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemDeal = async (dealId: string) => {
    if (!user) {
      alert('Please sign in to redeem this deal');
      return;
    }

    try {
      const { error } = await supabase
        .from('deal_redemptions')
        .insert([{
          deal_id: dealId,
          customer_id: user.id,
          status: 'active'
        }]);

      if (error) {
        if (error.code === '23505') {
          alert('You have already redeemed this deal');
        } else {
          throw error;
        }
        return;
      }

      alert('Deal redeemed successfully! The designer will contact you soon.');
      setSelectedDeal(null);
      fetchDeals();
    } catch (error) {
      console.error('Error redeeming deal:', error);
      alert('Error redeeming deal. Please try again.');
    }
  };

  const getDaysRemaining = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredDeals = filter === 'all'
    ? deals
    : deals.filter(deal => deal.deal_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading exclusive deals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Tag size={32} />
            <h1 className="text-4xl font-bold">Exclusive Designer Deals</h1>
          </div>
          <p className="text-xl text-sky-100 max-w-2xl">
            Get amazing discounts on interior design services from our top-rated designers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {featuredDeals.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="text-yellow-500 fill-current" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Featured Deals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals.map(deal => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onSelect={setSelectedDeal}
                  getDaysRemaining={getDaysRemaining}
                  isFeatured
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-700 font-medium">Filter by type:</span>
            {['all', 'package', 'service', 'consultation', 'material'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.filter(deal => !deal.is_featured).map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              onSelect={setSelectedDeal}
              getDaysRemaining={getDaysRemaining}
            />
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals available at the moment.</p>
            <p className="text-gray-400 mt-2">Check back soon for new exclusive offers!</p>
          </div>
        )}
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onRedeem={handleRedeemDeal}
          getDaysRemaining={getDaysRemaining}
        />
      )}
    </div>
  );
}

function DealCard({
  deal,
  onSelect,
  getDaysRemaining,
  isFeatured = false
}: {
  deal: Deal;
  onSelect: (deal: Deal) => void;
  getDaysRemaining: (validUntil: string) => number;
  isFeatured?: boolean;
}) {
  const daysRemaining = getDaysRemaining(deal.valid_until);
  const isLimited = deal.max_redemptions !== null && deal.max_redemptions > 0;
  const remainingSlots = isLimited ? deal.max_redemptions - deal.current_redemptions : null;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
        isFeatured ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={() => onSelect(deal)}
    >
      {deal.image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={deal.image_url}
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded">
                {deal.deal_type}
              </span>
              {isFeatured && (
                <Star className="text-yellow-500 fill-current" size={16} />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.title}</h3>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.description}</p>

        {deal.designers && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
              {deal.designers.profile_image ? (
                <img
                  src={deal.designers.profile_image}
                  alt={deal.designers.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sky-700 font-semibold">
                  {deal.designers.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{deal.designers.name}</p>
              <p className="text-xs text-gray-500">{deal.designers.specialization}</p>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-sky-600">₹{deal.deal_price.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 line-through">₹{deal.original_price.toLocaleString()}</p>
              <p className="text-sm font-bold text-green-600">{deal.discount_percentage}% OFF</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : 'Ending soon'}
            </span>
          </div>
          {isLimited && remainingSlots !== null && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>{remainingSlots} slots remaining</span>
            </div>
          )}
        </div>

        <button className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}

function DealModal({
  deal,
  onClose,
  onRedeem,
  getDaysRemaining
}: {
  deal: Deal;
  onClose: () => void;
  onRedeem: (dealId: string) => void;
  getDaysRemaining: (validUntil: string) => number;
}) {
  const daysRemaining = getDaysRemaining(deal.valid_until);
  const isLimited = deal.max_redemptions !== null && deal.max_redemptions > 0;
  const remainingSlots = isLimited ? deal.max_redemptions - deal.current_redemptions : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {deal.image_url && (
          <div className="h-64 overflow-hidden">
            <img
              src={deal.image_url}
              alt={deal.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded">
                  {deal.deal_type}
                </span>
                {deal.is_featured && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded">
                    <Star size={14} className="fill-current" />
                    Featured
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{deal.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="bg-sky-50 p-6 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Deal Price</p>
                <p className="text-4xl font-bold text-sky-600 mb-2">
                  ₹{deal.deal_price.toLocaleString()}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-gray-500 line-through">₹{deal.original_price.toLocaleString()}</p>
                  <p className="px-2 py-1 bg-green-100 text-green-700 text-sm font-bold rounded">
                    Save {deal.discount_percentage}%
                  </p>
                </div>
              </div>

              {deal.designers && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-3">Offered by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                      {deal.designers.profile_image ? (
                        <img
                          src={deal.designers.profile_image}
                          alt={deal.designers.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sky-700 font-bold text-xl">
                          {deal.designers.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{deal.designers.name}</p>
                      <p className="text-sm text-gray-600">{deal.designers.specialization}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{deal.designers.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Valid Until</p>
                    <p className="font-medium">
                      {new Date(deal.valid_until).toLocaleDateString()} ({daysRemaining} days)
                    </p>
                  </div>
                </div>

                {isLimited && remainingSlots !== null && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <TrendingUp size={20} className="text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Limited Offer</p>
                      <p className="font-medium">{remainingSlots} slots remaining</p>
                    </div>
                  </div>
                )}
              </div>

              {deal.services_included.length > 0 && (
                <div className="mb-6">
                  <p className="font-medium text-gray-900 mb-3">Services Included:</p>
                  <ul className="space-y-2">
                    {deal.services_included.map((service, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{deal.description}</p>
          </div>

          {deal.terms_conditions && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">{deal.terms_conditions}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => onRedeem(deal.id)}
              className="flex-1 bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium"
              disabled={isLimited && remainingSlots !== null && remainingSlots <= 0}
            >
              {isLimited && remainingSlots !== null && remainingSlots <= 0
                ? 'Deal Expired'
                : 'Redeem Deal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
