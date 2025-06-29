import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, User, ArrowLeft, Clock, Ruler, IndianRupee as Rupee, Tag, ExternalLink } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();

  // Mock data - in real app, fetch by id
  const project = {
    id: 1,
    title: 'Modern Mumbai Apartment',
    designer: 'Priya Sharma',
    designerId: 1,
    category: 'Residential',
    location: 'Mumbai',
    budget: '₹8,50,000',
    duration: '3 months',
    completedDate: 'March 2024',
    area: '1,200 sq ft',
    client: 'Rohit & Sneha Malhotra',
    description: 'A complete transformation of a 3BHK apartment in Mumbai, featuring contemporary design with clean lines, neutral palette, and smart storage solutions. The project focused on maximizing natural light and creating an open, airy feel throughout the space.',
    challenge: 'The main challenge was to create a spacious feel in a compact 1,200 sq ft apartment while accommodating the needs of a young family with children. The existing layout was cramped with poor natural light distribution.',
    solution: 'We opened up the living and dining areas, used light colors and mirrors strategically, and implemented clever storage solutions. The kitchen was redesigned with an island to create better flow and additional prep space.',
    images: [
      {
        id: 1,
        url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        title: 'Living Room',
        description: 'Open concept living room with modern furniture and neutral tones'
      },
      {
        id: 2,
        url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
        title: 'Kitchen',
        description: 'Modern kitchen with island and smart storage solutions'
      },
      {
        id: 3,
        url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
        title: 'Master Bedroom',
        description: 'Serene master bedroom with built-in wardrobes'
      },
      {
        id: 4,
        url: 'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800',
        title: 'Bathroom',
        description: 'Spa-like bathroom with modern fixtures'
      }
    ],
    materials: [
      { name: 'Italian Marble', usage: 'Flooring in living areas', cost: '₹2,50,000' },
      { name: 'Teak Wood', usage: 'Kitchen cabinets and wardrobes', cost: '₹1,80,000' },
      { name: 'Quartz Countertops', usage: 'Kitchen and bathroom surfaces', cost: '₹85,000' },
      { name: 'LED Lighting', usage: 'Ambient and task lighting throughout', cost: '₹45,000' },
      { name: 'Designer Wallpaper', usage: 'Accent walls in bedrooms', cost: '₹35,000' },
      { name: 'Premium Paint', usage: 'Wall finishes', cost: '₹25,000' }
    ],
    timeline: [
      { phase: 'Planning & Design', duration: '2 weeks', description: 'Initial consultation, space planning, and design development' },
      { phase: 'Demolition', duration: '3 days', description: 'Removal of existing fixtures and non-structural walls' },
      { phase: 'Electrical & Plumbing', duration: '1 week', description: 'Installation of new electrical and plumbing systems' },
      { phase: 'Flooring & Painting', duration: '3 weeks', description: 'Installation of marble flooring and complete painting' },
      { phase: 'Kitchen Installation', duration: '2 weeks', description: 'Custom kitchen cabinet installation and appliances' },
      { phase: 'Furniture & Styling', duration: '1 week', description: 'Furniture placement and final styling touches' }
    ],
    tags: ['Modern', 'Minimalist', '3BHK', 'Open Concept', 'Smart Storage'],
    features: [
      'Smart home automation',
      'Energy-efficient LED lighting',
      'Built-in storage solutions',
      'Open concept living',
      'Premium Italian marble flooring',
      'Custom-designed furniture'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/projects" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-secondary-800 mb-4">
                {project.title}
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <div>
                    <p className="text-sm">Designer</p>
                    <Link to={`/designers/${project.designerId}`} className="font-medium text-primary-600 hover:text-primary-700">
                      {project.designer}
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <p className="text-sm">Location</p>
                    <p className="font-medium">{project.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="text-sm">Completed</p>
                    <p className="font-medium">{project.completedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Ruler className="w-5 h-5" />
                  <div>
                    <p className="text-sm">Area</p>
                    <p className="font-medium">{project.area}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-secondary-800 mb-4">Project Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold text-secondary-800">{project.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-secondary-800">{project.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-secondary-800">{project.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client</span>
                    <span className="font-semibold text-secondary-800">{project.client}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-secondary-800 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {project.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-secondary-800 mb-6">Project Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.images.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                    <p className="text-sm">{image.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge & Solution */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-secondary-800 mb-6">Challenge & Solution</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-3">The Challenge</h3>
                <p className="text-gray-600 leading-relaxed">{project.challenge}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-3">Our Solution</h3>
                <p className="text-gray-600 leading-relaxed">{project.solution}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-secondary-800 mb-6">Project Timeline</h2>
            
            <div className="space-y-4">
              {project.timeline.map((phase, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    {index < project.timeline.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-secondary-800">{phase.phase}</h3>
                      <span className="bg-accent-100 text-accent-800 px-2 py-1 rounded-md text-xs font-medium">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Materials Used */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-secondary-800 mb-6">Materials & Cost Breakdown</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-secondary-800">Material</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-800">Usage</th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary-800">Cost</th>
                </tr>
              </thead>
              <tbody>
                {project.materials.map((material, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-secondary-800">{material.name}</td>
                    <td className="py-3 px-4 text-gray-600">{material.usage}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary-600">{material.cost}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary-200 bg-primary-50">
                  <td className="py-3 px-4 font-bold text-secondary-800">Total Project Cost</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-bold text-primary-600 text-lg">{project.budget}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Inspired by this project?
          </h2>
          <p className="text-primary-100 mb-6">
            Get in touch with {project.designer} to discuss your interior design needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={`/designers/${project.designerId}`}
              className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Designer Profile
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              Get Similar Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;