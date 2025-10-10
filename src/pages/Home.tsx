import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Users, ArrowRight, Play, Palette, UserPlus, Percent, Clock, Gift, ExternalLink, IndianRupee as Rupee } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserRegistrationStatus } from '../hooks/useUserRegistrationStatus';
import VideoModal from '../components/VideoModal';
import AuthModal from '../components/AuthModal';

const Home = () => {
  const { user } = useAuth();
  const { hasAnyRegistration, loading: registrationLoading } = useUserRegistrationStatus();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [pendingAction, setPendingAction] = useState<'designer' | 'customer' | null>(null);

  const featuredDesigners = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID format
      name: 'Priya Sharma',
      specialization: 'Modern & Contemporary',
      experience: '8 years',
      rating: 4.9,
      reviews: 127,
      location: 'Mumbai',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID format
      name: 'Rajesh Kumar',
      specialization: 'Traditional Indian',
      experience: '12 years',
      rating: 4.8,
      reviews: 98,
      location: 'Delhi',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003', // Valid UUID format
      name: 'Anita Desai',
      specialization: 'Minimalist Design',
      experience: '6 years',
      rating: 4.9,
      reviews: 85,
      location: 'Bangalore',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const designerAds = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID format - same as featured designer
      name: 'Priya Sharma',
      specialization: 'Modern & Contemporary',
      location: 'Mumbai',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      portfolioImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      offer: {
        title: 'New Year Special',
        discount: '25% OFF',
        description: 'Complete home makeover packages',
        validUntil: '2024-01-31',
        originalPrice: '₹2,00,000',
        discountedPrice: '₹1,50,000'
      },
      rating: 4.9,
      projects: 45,
      badge: 'Premium Designer'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004', // Valid UUID format
      name: 'Vikram Singh',
      specialization: 'Luxury & High-End',
      location: 'Gurgaon',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      portfolioImage: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      offer: {
        title: 'Luxury Living Sale',
        discount: 'FREE',
        description: '3D visualization with any project above ₹5L',
        validUntil: '2024-02-15',
        originalPrice: '₹50,000',
        discountedPrice: 'FREE'
      },
      rating: 4.7,
      projects: 89,
      badge: 'Top Rated'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005', // Valid UUID format
      name: 'Meera Reddy',
      specialization: 'Eco-Friendly Design',
      location: 'Hyderabad',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      portfolioImage: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800',
      offer: {
        title: 'Green Home Initiative',
        discount: '30% OFF',
        description: 'Sustainable design consultation',
        validUntil: '2024-02-28',
        originalPrice: '₹75,000',
        discountedPrice: '₹52,500'
      },
      rating: 4.8,
      projects: 28,
      badge: 'Eco Expert'
    }
  ];

  const stats = [
    { icon: Users, label: 'Expert Designers', value: '500+' },
    { icon: Award, label: 'Projects Completed', value: '2,500+' },
    { icon: Star, label: 'Happy Clients', value: '10,000+' },
  ];

  const handleDesignerRegistration = () => {
    if (!user) {
      setPendingAction('designer');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    // User is authenticated, proceed to registration
    window.location.href = '/register-designer';
  };

  const handleCustomerRegistration = () => {
    if (!user) {
      setPendingAction('customer');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    // User is authenticated, proceed to registration
    window.location.href = '/register-customer';
  };

  const handleContactDesigner = (designerId: string) => {
    if (!user) {
      setPendingAction(null);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    // User is authenticated, proceed to contact
    window.location.href = `/designers/${designerId}`;
  };

  const handleAuthSuccess = () => {
    // After successful authentication, redirect based on pending action
    if (pendingAction === 'designer') {
      window.location.href = '/register-designer';
    } else if (pendingAction === 'customer') {
      window.location.href = '/register-customer';
    }
    setPendingAction(null);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setPendingAction(null);
  };

  // Only show the "Join our community" section if user is not signed in
  // Remove it completely when user is signed in (regardless of registration status)
  const shouldShowJoinCommunity = !user;

  return (
    <div className="gradient-bg">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-secondary-800 mb-6 leading-tight">
                Transform Your
                <span className="block text-primary-500">Dream Home</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with India's most talented interior designers. From traditional elegance to modern sophistication, create spaces that reflect your unique style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/designers" className="btn-primary text-center">
                  Find Designers
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="btn-secondary flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Our Story
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Beautiful interior design"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-800">4.9/5 Rating</p>
                    <p className="text-sm text-gray-600">From 10,000+ clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Options - Only show if user is not logged in */}
      {shouldShowJoinCommunity && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
                Join Our Community
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you're a talented designer or looking to transform your space, we have the perfect platform for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Designer Registration */}
              <div className="card p-8 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-800 mb-4">For Designers</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Showcase your portfolio, connect with clients, and grow your interior design business on India's premier platform.
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Create stunning portfolio</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Get matched with clients</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Manage projects efficiently</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Build your reputation</span>
                  </li>
                </ul>
                <button 
                  onClick={handleDesignerRegistration}
                  className="btn-primary w-full"
                >
                  Register as Designer
                </button>
              </div>

              {/* Customer Registration */}
              <div className="card p-8 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-800 mb-4">For Homeowners</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Share your vision and get connected with the perfect interior designer to bring your dream home to life.
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>Share your project details</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>Get matched with designers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>Compare proposals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    <span>Track project progress</span>
                  </li>
                </ul>
                <button 
                  onClick={handleCustomerRegistration}
                  className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-full"
                >
                  Register Your Project
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-secondary-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Designers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
              Featured Designers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our top-rated interior designers who have transformed thousands of homes across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDesigners.map((designer) => (
              <Link key={designer.id} to={`/designers/${designer.id}`} className="card p-6 group">
                <div className="relative mb-4">
                  <img
                    src={designer.image}
                    alt={designer.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Top Rated
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">{designer.name}</h3>
                  <p className="text-primary-600 font-medium mb-2">{designer.specialization}</p>
                  <p className="text-gray-600 mb-3">{designer.experience} • {designer.location}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(designer.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {designer.rating} ({designer.reviews} reviews)
                    </span>
                  </div>
                  
                  <div className="text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                    View Profile →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/designers" className="btn-primary">
              View All Designers
            </Link>
          </div>
        </div>
      </section>

      {/* Designer Ads Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>Limited Time Offers</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
              Exclusive Designer Deals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these amazing offers from our top designers. Transform your space with premium services at unbeatable prices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {designerAds.map((ad) => (
              <div key={ad.id} className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Offer Badge */}
                <div className="relative">
                  <img
                    src={ad.portfolioImage}
                    alt={`${ad.name}'s work`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {ad.offer.discount}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={ad.image}
                        alt={ad.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-secondary-800 text-sm">{ad.name}</p>
                        <p className="text-xs text-gray-600">{ad.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                      {ad.badge}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{ad.rating}</span>
                      <span className="text-xs text-gray-500">({ad.projects} projects)</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-secondary-800 mb-2">{ad.offer.title}</h3>
                  <p className="text-gray-600 mb-4">{ad.offer.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{ad.specialization}</p>

                  {/* Pricing */}
                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 line-through">{ad.offer.originalPrice}</p>
                        <p className="text-2xl font-bold text-primary-600">{ad.offer.discountedPrice}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-red-500 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Limited Time</span>
                        </div>
                        <p className="text-xs text-gray-500">Valid until {new Date(ad.offer.validUntil).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/designers/${ad.id}`}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center"
                    >
                      View Profile
                    </Link>
                    {user ? (
                      <Link
                        to={`/designers/${ad.id}`}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Contact</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleContactDesigner(ad.id)}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Contact</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Discount Badge */}
                <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-br-lg text-xs font-bold">
                  <div className="flex items-center space-x-1">
                    <Percent className="w-3 h-3" />
                    <span>SAVE BIG</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-secondary-800 mb-4">
                Want to Feature Your Offers?
              </h3>
              <p className="text-gray-600 mb-6">
                Join our platform as a designer and showcase your special offers to thousands of potential clients.
              </p>
              <button
                onClick={handleDesignerRegistration}
                className="btn-primary"
              >
                Become a Featured Designer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Home;