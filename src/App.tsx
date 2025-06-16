import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Designers from './pages/Designers';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import DesignerDetail from './pages/DesignerDetail';
import ProjectDetail from './pages/ProjectDetail';
import DesignerRegistration from './pages/DesignerRegistration';
import CustomerRegistration from './pages/CustomerRegistration';
import EditDesignerProfile from './pages/EditDesignerProfile';

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
            <Route path="/register-designer" element={<DesignerRegistration />} />
            <Route path="/register-customer" element={<CustomerRegistration />} />
            <Route path="/edit-designer-profile" element={<EditDesignerProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;