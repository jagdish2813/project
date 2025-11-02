import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useDesignerProfile } from './hooks/useDesignerProfile';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Designers from './pages/Designers';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import Materials from './pages/Materials';
import DesignerDetail from './pages/DesignerDetail';
import ProjectDetail from './pages/ProjectDetail';
import DesignerRegistration from './pages/DesignerRegistration';
import CustomerRegistration from './pages/CustomerRegistration';
import MyProjects from './pages/MyProjects';
import EditProject from './pages/EditProject';
import CustomerProjects from './pages/CustomerProjects';
import ProjectDetailWithTracking from './pages/ProjectDetailWithTracking';
import DesignerDashboard from './pages/DesignerDashboard';
import DesignerMaterialPricing from './pages/DesignerMaterialPricing';
import DesignerQuotes from './pages/DesignerQuotes';
import DesignerQuoteGenerator from './pages/DesignerQuoteGenerator';
import CustomerQuotes from './pages/CustomerQuotes';
import AdminDashboard from './pages/AdminDashboard';
import AdminDealsManagement from './pages/AdminDealsManagement';
import AdminSignup from './pages/AdminSignup';
import DebugPage from './pages/DebugPage';
import DebugDesignerProfile from './pages/DebugDesignerProfile';
import SharePhotoForm from './pages/SharePhotoForm';
import { forceLogoutAll } from './utils/clearAuth';

// Expose force logout to window for emergency use
if (typeof window !== 'undefined') {
  (window as any).forceLogoutAll = forceLogoutAll;
}

// Component to handle designer dashboard redirect
const DesignerRedirectHandler = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isDesigner, loading: designerLoading } = useDesignerProfile();

  useEffect(() => {
    // Only redirect if user is authenticated and we've finished loading designer profile
    if (!authLoading && !designerLoading && user && isDesigner) {
      // Check if we're on the home page and redirect to dashboard
      if (window.location.pathname === '/') {
        navigate('/designer-dashboard');
      }
    }
  }, [user, isDesigner, authLoading, designerLoading, navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <DesignerRedirectHandler />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/designers" element={<Designers />} />
            <Route path="/designers/:id" element={<DesignerDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/register-designer" element={<DesignerRegistration />} />
            <Route path="/edit-designer-profile" element={<DesignerRegistration />} />
            <Route path="/register-customer" element={<CustomerRegistration />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/edit-project/:id" element={<EditProject />} />
            <Route path="/project-detail/:id" element={<ProjectDetailWithTracking />} />
            <Route path="/customer-projects" element={<CustomerProjects />} />
            <Route path="/designer-dashboard" element={<DesignerDashboard />} />
            <Route path="/designer-material-pricing" element={<DesignerMaterialPricing />} />
            <Route path="/designer-quotes" element={<DesignerQuotes />} />
            <Route path="/customer-quotes" element={<CustomerQuotes />} />
            <Route path="/generate-quote/:id" element={<DesignerQuoteGenerator />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/deals" element={<AdminDealsManagement />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/debug-profile" element={<DebugDesignerProfile />} />
            <Route path="/share-photo" element={<SharePhotoForm />} />
          </Routes>
        </main>       
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;