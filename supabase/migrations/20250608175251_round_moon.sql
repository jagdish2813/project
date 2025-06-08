/*
  # Add sample designers data

  1. Sample Data
    - Insert sample designers with complete profiles
    - Include various specializations and locations
    - Set realistic ratings and project counts

  2. Data includes
    - Profile information
    - Portfolio images
    - Services offered
    - Materials expertise
    - Awards and recognition
*/

-- Insert sample designers
INSERT INTO designers (
  name,
  email,
  phone,
  specialization,
  experience,
  location,
  bio,
  website,
  starting_price,
  profile_image,
  portfolio_images,
  services,
  materials_expertise,
  awards,
  rating,
  total_reviews,
  total_projects,
  is_verified,
  is_active
) VALUES 
(
  'Priya Sharma',
  'priya.sharma@interiorcraft.com',
  '+91 98765 43210',
  'Modern & Contemporary',
  8,
  'Mumbai',
  'Priya Sharma is a renowned interior designer with over 8 years of experience in creating modern and contemporary living spaces. She specializes in clean lines, functional design, and creating spaces that reflect her clients'' personalities.',
  'www.priyasharmadesigns.com',
  '₹50,000',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  ARRAY['3D Visualization', 'Space Planning', 'Furniture Selection', 'Color Consultation', 'Project Management', 'Lighting Design'],
  ARRAY['Italian Marble', 'Teak Wood', 'LED Lighting', 'Glass Partitions'],
  ARRAY['Best Residential Design 2023 - Mumbai Design Awards', 'Excellence in Interior Design 2022 - Indian Design Council'],
  4.9,
  127,
  45,
  true,
  true
),
(
  'Rajesh Kumar',
  'rajesh.kumar@interiorcraft.com',
  '+91 98765 43211',
  'Traditional Indian',
  12,
  'Delhi',
  'Rajesh Kumar brings traditional Indian design elements into modern homes. With 12 years of experience, he specializes in creating spaces that honor cultural heritage while meeting contemporary needs.',
  'www.rajeshkumardesigns.com',
  '₹45,000',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  ARRAY['Traditional Design', 'Vastu Consultation', 'Antique Integration', 'Cultural Themes', 'Handcrafted Elements'],
  ARRAY['Sheesham Wood', 'Brass Hardware', 'Rajasthani Stone', 'Handwoven Textiles'],
  ARRAY['Traditional Design Excellence 2023 - Delhi Heritage Foundation', 'Cultural Preservation Award 2022'],
  4.8,
  98,
  67,
  true,
  true
),
(
  'Anita Desai',
  'anita.desai@interiorcraft.com',
  '+91 98765 43212',
  'Minimalist Design',
  6,
  'Bangalore',
  'Anita Desai creates serene, clutter-free spaces that promote peace and functionality. Her minimalist approach focuses on quality over quantity, using natural materials and clean aesthetics.',
  'www.anitadesaidesigns.com',
  '₹40,000',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  ARRAY['Minimalist Design', 'Zen Spaces', 'Natural Materials', 'Decluttering', 'Sustainable Design'],
  ARRAY['Bamboo Flooring', 'Natural Wood', 'Linen Fabrics', 'Cork Flooring'],
  ARRAY['Minimalist Design Award 2023 - Bangalore Design Week', 'Sustainable Design Recognition 2022'],
  4.9,
  85,
  32,
  true,
  true
),
(
  'Vikram Singh',
  'vikram.singh@interiorcraft.com',
  '+91 98765 43213',
  'Luxury & High-End',
  15,
  'Gurgaon',
  'Vikram Singh specializes in luxury interior design for high-end residences and commercial spaces. With 15 years of experience, he creates opulent environments using premium materials and bespoke furniture.',
  'www.vikramsinghdesigns.com',
  '₹1,00,000',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Luxury Design', 'Bespoke Furniture', 'Premium Materials', 'High-End Finishes', 'Art Curation'],
  ARRAY['Carrara Marble', 'Walnut Veneer', 'Crystal Chandeliers', 'Silk Wallpapers'],
  ARRAY['Luxury Design Excellence 2023 - India Luxury Awards', 'Best High-End Residential 2022 - Design India'],
  4.7,
  156,
  89,
  true,
  true
),
(
  'Meera Reddy',
  'meera.reddy@interiorcraft.com',
  '+91 98765 43214',
  'Eco-Friendly Design',
  7,
  'Hyderabad',
  'Meera Reddy is passionate about sustainable interior design. She creates beautiful spaces using eco-friendly materials and energy-efficient solutions, proving that green design can be both stylish and functional.',
  'www.meerareddy.com',
  '₹35,000',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  ARRAY['Sustainable Design', 'Eco-Friendly Materials', 'Energy Efficiency', 'Green Building', 'Upcycling'],
  ARRAY['Reclaimed Wood', 'Cork Flooring', 'Organic Cotton', 'Solar Panels'],
  ARRAY['Green Design Award 2023 - Hyderabad Eco Foundation', 'Sustainable Living Recognition 2022'],
  4.8,
  73,
  28,
  true,
  true
),
(
  'Arjun Patel',
  'arjun.patel@interiorcraft.com',
  '+91 98765 43215',
  'Industrial & Loft',
  9,
  'Pune',
  'Arjun Patel specializes in industrial and loft-style interiors. He transforms urban spaces with exposed elements, raw materials, and contemporary aesthetics that celebrate the beauty of industrial design.',
  'www.arjunpateldesigns.com',
  '₹55,000',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  ARRAY['Industrial Design', 'Loft Conversion', 'Urban Aesthetics', 'Exposed Elements', 'Raw Materials'],
  ARRAY['Exposed Brick', 'Steel Frames', 'Concrete Floors', 'Edison Bulbs'],
  ARRAY['Industrial Design Excellence 2023 - Pune Design Awards', 'Urban Living Award 2022'],
  4.6,
  91,
  41,
  true,
  true
),
(
  'Kavya Nair',
  'kavya.nair@interiorcraft.com',
  '+91 98765 43216',
  'Scandinavian',
  5,
  'Chennai',
  'Kavya Nair brings the warmth and simplicity of Scandinavian design to Indian homes. Her approach focuses on functionality, natural light, and creating cozy, livable spaces with a Nordic touch.',
  'www.kavyanairdesigns.com',
  '₹42,000',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  ARRAY['Scandinavian Design', 'Hygge Concepts', 'Natural Light', 'Functional Furniture', 'Cozy Interiors'],
  ARRAY['Light Wood', 'Natural Textiles', 'White Paint', 'Wool Rugs'],
  ARRAY['Nordic Design Recognition 2023 - Chennai Design Week'],
  4.7,
  64,
  23,
  true,
  true
),
(
  'Rohit Malhotra',
  'rohit.malhotra@interiorcraft.com',
  '+91 98765 43217',
  'Modern & Contemporary',
  11,
  'Kolkata',
  'Rohit Malhotra creates sophisticated contemporary spaces that blend modern aesthetics with practical functionality. His designs are known for their clean lines, innovative storage solutions, and timeless appeal.',
  'www.rohitmalhotradesigns.com',
  '₹48,000',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY[
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'
  ],
  ARRAY['Contemporary Design', 'Smart Storage', 'Modern Aesthetics', 'Space Optimization', 'Technology Integration'],
  ARRAY['Engineered Wood', 'Glass', 'Steel', 'Quartz'],
  ARRAY['Contemporary Excellence 2023 - Kolkata Design Society', 'Innovation in Design 2022'],
  4.8,
  112,
  56,
  true,
  true
);