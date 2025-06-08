import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Award, Phone, Mail, ArrowLeft, ExternalLink } from 'lucide-react';

const DesignerDetail = () => {
  const { id } = useParams();

  // Mock data - in real app, fetch by id
  const designer = {
    id: 1,
    name: 'Priya Sharma',
    specialization: 'Modern & Contemporary',
    experience: 8,
    rating: 4.9,
    reviews: 127,
    location: 'Mumbai',
    projects: 45,
    startingPrice: '₹50,000',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Priya Sharma is a renowned interior designer with over 8 years of experience in creating modern and contemporary living spaces. She specializes in clean lines, functional design, and creating spaces that reflect her clients\' personalities. Her work has been featured in leading home design magazines and she has won several awards for her innovative approach to residential design.',
    phone: '+91 98765 43210',
    email: 'priya@interiorcraft.com',
    website: 'www.priyasharmadesigns.com',
    services: [
      '3D Visualization',
      'Space Planning',
      'Furniture Selection',
      'Color Consultation',
      'Project Management',
      'Lighting Design'
    ],
    portfolio: [
      {
        id: 1,
        title: 'Modern Mumbai Apartment',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Residential'
      },
      {
        id: 2,
        title: 'Contemporary Office Space',
        image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Commercial'
      },
      {
        id: 3,
        title: 'Minimalist Living Room',
        image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Residential'
      }
    ],
    testimonials: [
      {
        id: 1,
        name: 'Rohit Malhotra',
        rating: 5,
        text: 'Priya transformed our apartment into a modern masterpiece. Her attention to detail and understanding of our needs was exceptional.',
        project: 'Modern Mumbai Apartment'
      },
      {
        id: 2,
        name: 'Sneha Kapoor',
        rating: 5,
        text: 'Working with Priya was a dream. She delivered exactly what we envisioned and more. Highly recommended!',
        project: 'Contemporary Villa'
      },
      {
        id: 3,
        name: 'Amit Sharma',
        rating: 5,
        text: 'Professional, creative, and efficient. Priya exceeded our expectations in every aspect of the project.',
        project: 'Office Renovation'
      }
    ],
    awards: [
      'Best Residential Design 2023 - Mumbai Design Awards',
      'Excellence in Interior Design 2022 - Indian Design Council',
      'Rising Designer of the Year 2021 - Design India Magazine'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/designers" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Designers
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Designer Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <img
                  src={designer.image}
                  alt={designer.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                />
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-secondary-800 mb-2">
                    {designer.name}
                  </h1>
                  <p className="text-xl text-primary-600 font-medium mb-4">
                    {designer.specialization}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{designer.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{designer.experience} years experience</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>{designer.projects} projects completed</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(designer.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{designer.rating}</span>
                      <span className="text-gray-600">({designer.reviews} reviews)</span>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {designer.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-6">Services Offered</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {designer.services.map((service, index) => (
                  <div key={index} className="bg-primary-50 text-primary-800 px-4 py-3 rounded-lg text-center font-medium">
                    {service}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-6">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {designer.portfolio.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="group">
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-800 mt-3 group-hover:text-primary-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600">{project.category}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-6">Client Testimonials</h2>
              <div className="space-y-6">
                {designer.testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border-l-4 border-primary-500 pl-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-secondary-800">{testimonial.name}</span>
                    </div>
                    <p className="text-gray-600 mb-2">"{testimonial.text}"</p>
                    <p className="text-sm text-primary-600 font-medium">Project: {testimonial.project}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Contact Designer</h3>
              
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <p className="text-2xl font-bold text-primary-600">{designer.startingPrice}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${designer.phone}`}
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>{designer.phone}</span>
                </a>
                <a
                  href={`mailto:${designer.email}`}
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>{designer.email}</span>
                </a>
                <a
                  href={`https://${designer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>{designer.website}</span>
                </a>
              </div>

              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Get Quote
                </button>
                <button className="w-full btn-secondary">
                  Schedule Consultation
                </button>
              </div>
            </div>

            {/* Awards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Awards & Recognition</h3>
              <div className="space-y-3">
                {designer.awards.map((award, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">{award}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerDetail;