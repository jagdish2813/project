import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, User, LogOut, Palette, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Designers', href: '/designers' },
    { name: 'Projects', href: '/projects' },
    { name: 'Gallery', href: '/gallery' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
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
              <span className="text-xl font-bold text-secondary-800">HomeDesigners</span>
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
                      <button
                        onClick={handleDesignerRegistration}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Palette className="w-4 h-4" />
                        <span>Register as Designer</span>
                      </button>
                      <button
                        onClick={handleCustomerRegistration}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Register Your Project</span>
                      </button>
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
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
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
      />
    </>
  );
};

export default Header;