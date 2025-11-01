import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, User, LogOut, Palette, UserPlus, Edit, Loader2, FolderOpen, Users, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';
import { useUserRegistrationStatus } from '../hooks/useUserRegistrationStatus';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { designer, isDesigner, loading: designerLoading } = useDesignerProfile();
  const { hasCustomerProject, loading: registrationLoading } = useUserRegistrationStatus();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Designers', href: '/designers' },
    { name: 'Projects', href: '/projects' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Materials', href: '/materials' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      // Close any open menus
      setShowUserMenu(false);
      setIsMenuOpen(false);
      
      // Clear any form states in the current component
      setShowAuthModal(false);
      setAuthMode('login');
      setEditProfileLoading(false);
      
      // Call the enhanced signOut function that handles clearing and redirecting
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  const handleDesignerRegistration = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      setShowUserMenu(false);
      return;
    }
    navigate('/register-designer');
    setShowUserMenu(false);
  };

  const handleCustomerRegistration = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      setShowUserMenu(false);
      return;
    }
    navigate('/register-customer');
    setShowUserMenu(false);
  };

  const handleViewProjects = () => {
    navigate('/my-projects');
    setShowUserMenu(false);
  };

  const handleViewQuotes = () => {
    navigate('/customer-quotes');
    setShowUserMenu(false);
  };

  const handleViewCustomerProjects = () => {
    navigate('/customer-projects');
    setShowUserMenu(false);
  };

  const handleViewProfile = () => {
    if (designer) {
      navigate(`/designers/${designer.id}`);
    }
    setShowUserMenu(false);
  };

  const handleEditProfile = () => {
    if (designer) {
      setEditProfileLoading(true);
      setShowUserMenu(false);
      
      // Navigate directly to edit profile
      navigate('/edit-designer-profile');
      
      // Reset loading state
      setTimeout(() => {
        setEditProfileLoading(false);
      }, 500);
    }
  };

  const handleDesignerDashboard = () => {
    navigate('/designer-dashboard');
    setShowUserMenu(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    
    // Check if user is a designer and redirect to dashboard
    // We need to wait a moment for the designer profile to load
    setTimeout(() => {
      // Force a page refresh to ensure all hooks are properly initialized
      window.location.reload();
    }, 500);
  };

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-800">TheHomeDesigners</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {designerLoading || registrationLoading ? (
                        <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading profile...</span>
                        </div>
                      ) : (
                        <>
                          {isDesigner ? (
                            <>
                              <button
                                onClick={handleDesignerDashboard}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <BarChart3 className="w-4 h-4" />
                                <span>Dashboard</span>
                              </button>
                              <button
                                onClick={handleViewProfile}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <User className="w-4 h-4" />
                                <span>View Profile</span>
                              </button>
                              <button
                                onClick={handleEditProfile}
                                disabled={editProfileLoading}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50"
                              >
                                {editProfileLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Edit className="w-4 h-4" />
                                )}
                                <span>{editProfileLoading ? 'Loading...' : 'Edit Profile'}</span>
                              </button>
                              <button
                                onClick={handleViewCustomerProjects}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <Users className="w-4 h-4" />
                                <span>Customer Projects</span>
                              </button>
                            </>
                          ) : (
                            <>
                            {!isAdmin && (
                            <>
                              {/* Show "Register as Designer" only if user is not a customer */}
                              {!hasCustomerProject && (
                                <button
                                  onClick={handleDesignerRegistration}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                  <Palette className="w-4 h-4" />
                                  <span>Register as Designer</span>
                                </button>
                              )}

                              {/* Show project-related options for customers */}
                              {hasCustomerProject ? (
                                <>
                                  <button
                                    onClick={handleViewProjects}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <FolderOpen className="w-4 h-4" />
                                    <span>My Projects</span>
                                  </button>
                                  <button
                                    onClick={handleViewQuotes}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>My Quotes</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={handleCustomerRegistration}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  <span>Register Your Project</span>
                                </button>
                              )}
                            </>
                            )}
                            </>
                          )}
                          
                        </>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="btn-primary"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user ? (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Signed in as {user.user_metadata?.name || user.email}
                    </div>
                    {designerLoading || registrationLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500 flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading profile...</span>
                      </div>
                    ) : (
                      <>
                        {isDesigner ? (
                          <>
                            <button
                              onClick={() => {
                                handleDesignerDashboard();
                                setIsMenuOpen(false);
                              }}
                              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>Dashboard</span>
                            </button>
                            <button
                              onClick={() => {
                                handleViewProfile();
                                setIsMenuOpen(false);
                              }}
                              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <User className="w-4 h-4" />
                              <span>View Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                handleEditProfile();
                                setIsMenuOpen(false);
                              }}
                              disabled={editProfileLoading}
                              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
                            >
                              {editProfileLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                              <span>{editProfileLoading ? 'Loading...' : 'Edit Profile'}</span>
                            </button>
                            <button
                              onClick={() => {
                                handleViewCustomerProjects();
                                setIsMenuOpen(false);
                              }}
                              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Users className="w-4 h-4" />
                              <span>Customer Projects</span>
                            </button>
                          </>
                        ) : (
                          <>
                            {!isAdmin && (
                            <>
                              {/* Show "Register as Designer" only if user is not a customer */}
                              {!hasCustomerProject && (
                                <button
                                  onClick={() => {
                                    handleDesignerRegistration();
                                    setIsMenuOpen(false);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Palette className="w-4 h-4" />
                                  <span>Register as Designer</span>
                                </button>
                              )}

                              {/* Show project-related options for customers */}
                              {hasCustomerProject ? (
                                <>
                                  <button
                                    onClick={() => {
                                      handleViewProjects();
                                      setIsMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <FolderOpen className="w-4 h-4" />
                                    <span>My Projects</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleViewQuotes();
                                      setIsMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>My Quotes</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                <button
                                  onClick={() => {
                                    handleCustomerRegistration();
                                    setIsMenuOpen(false);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  <span>Register Your Project</span>
                                </button>
                                </>
                              )}
                            </>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;