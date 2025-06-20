import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import DebugPage from './pages/DebugPage';
import DebugDesignerProfile from './pages/DebugDesignerProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
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
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/debug-profile" element={<DebugDesignerProfile />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;