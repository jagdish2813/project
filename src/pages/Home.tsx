import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Users, ArrowRight, Play, Palette, UserPlus } from 'lucide-react';
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
      id: 1,
      name: 'Priya Sharma',
      specialization: 'Modern & Contemporary',
      experience: '8 years',
      rating: 4.9,
      reviews: 127,
      location: 'Mumbai',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      specialization: 'Traditional Indian',
      experience: '12 years',
      rating: 4.8,
      reviews: 98,
      location: 'Delhi',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Anita Desai',
      specialization: 'Minimalist Design',
      experience: '6 years',
      rating: 4.9,
      reviews: 85,
      location: 'Bangalore',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'
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