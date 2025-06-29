-- Insert additional knowledge entries for the chatbot
INSERT INTO chatbot_knowledge (category, question, answer, keywords, priority, is_active)
VALUES
  ('services', 
   'What interior design services do you offer?', 
   'TheHomeDesigners offers a comprehensive range of interior design services including:

• Full home interior design
• Room-specific design (kitchen, bedroom, living room, etc.)
• Space planning and layout optimization
• Material and furniture selection
• 3D visualization and rendering
• Project management and execution
• Color consultation
• Lighting design
• Custom furniture design

You can browse designer profiles to see their specializations and portfolio work.',
   ARRAY['services', 'offerings', 'what do you do', 'design services', 'interior services', 'help with', 'provide'],
   10,
   true),
   
  ('pricing', 
   'How much does interior design cost?', 
   'Interior design costs vary based on several factors:

• Project scope (full home vs. single room)
• Property size (cost per square foot)
• Design complexity
• Material quality
• Location

Typical price ranges in India:
• Basic design: ₹50-100 per sq.ft
• Standard design: ₹100-200 per sq.ft
• Premium design: ₹200-500+ per sq.ft

Designers may charge fixed fees, per-room rates, or percentage-based fees. You can view starting prices on designer profiles or register your project to receive customized quotes.',
   ARRAY['cost', 'pricing', 'charges', 'fees', 'expensive', 'budget', 'affordable', 'price', 'rates'],
   10,
   true),
   
  ('process', 
   'How does the design process work?', 
   'Our interior design process typically follows these steps:

1. **Initial Consultation**: Discuss your requirements, style preferences, and budget
2. **Project Registration**: Register your project on our platform
3. **Designer Matching**: Get matched with suitable designers or choose one yourself
4. **Concept Development**: Your designer creates initial concepts and mood boards
5. **Design Presentation**: Review 3D visualizations and material selections
6. **Revisions**: Refine the design based on your feedback
7. **Final Design**: Approve the final design package
8. **Execution**: Optional implementation with project management
9. **Handover**: Final walkthrough and project completion

The timeline varies based on project scope, typically ranging from 2-8 weeks for the design phase.',
   ARRAY['process', 'steps', 'how it works', 'procedure', 'timeline', 'what to expect', 'stages'],
   9,
   true),
   
  ('designers', 
   'How do I find the right designer?', 
   'Finding the right designer is easy with TheHomeDesigners:

1. **Browse Profiles**: Explore our curated list of verified designers
2. **Use Filters**: Filter by location, style, budget, and experience
3. **Review Portfolios**: Check past projects and client reviews
4. **Compare Ratings**: See ratings and client testimonials
5. **Direct Contact**: Reach out to designers you like
6. **Register Your Project**: Let us match you with suitable designers

We recommend considering designers whose aesthetic matches your vision, have experience with similar projects, and fit your budget requirements.',
   ARRAY['find designer', 'choose designer', 'select designer', 'best designer', 'right designer', 'match'],
   8,
   true),
   
  ('locations', 
   'Which cities do you serve?', 
   E'TheHomeDesigners currently serves major cities across India including:\n\n• Mumbai\n• Delhi NCR (including Gurgaon, Noida)\n• Bangalore\n• Hyderabad\n• Chennai\n• Kolkata\n• Pune\n• Ahmedabad\n• Jaipur\n• Chandigarh\n• Lucknow\n• Kochi\n\nWe\'re continuously expanding our network. If your city isn\'t listed, please register your project anyway, and we\'ll try to connect you with designers who can work remotely or travel to your location.',
   ARRAY['cities', 'locations', 'areas', 'regions', 'serve', 'available in', 'where'],
   7,
   true),
   
  ('materials', 
   'What materials do you recommend?', 
   'Our designers work with a wide range of quality materials based on your requirements and budget. Popular choices include:

• **Flooring**: Italian marble, engineered wood, vitrified tiles, natural stone
• **Kitchen**: Quartz/granite countertops, acrylic/laminate finishes, modular systems
• **Furniture**: Teak, sheesham, oak, engineered wood, plywood with veneer/laminate
• **Fabrics**: Cotton, linen, velvet, leather, synthetic blends
• **Bathroom**: Porcelain tiles, glass partitions, premium sanitary ware

Your designer will recommend specific materials based on your lifestyle, maintenance preferences, and budget constraints. We also have a dedicated Materials Guide section on our website.',
   ARRAY['materials', 'quality', 'products', 'brands', 'wood', 'marble', 'fabric', 'recommend'],
   7,
   true),
   
  ('timeline', 
   'How long does a project take?', 
   'Project timelines vary based on scope and complexity:

• **Design Phase**:
  - Single room: 2-3 weeks
  - Full apartment: 3-6 weeks
  - Large home/villa: 6-8 weeks

• **Execution Phase** (if opted for):
  - Basic renovation: 4-8 weeks
  - Standard interior work: 8-12 weeks
  - Comprehensive interior: 12-20 weeks

Factors affecting timeline include material procurement time, custom furniture manufacturing, and site conditions. Your designer will provide a detailed timeline during the initial consultation.',
   ARRAY['timeline', 'duration', 'how long', 'time', 'weeks', 'months', 'schedule', 'completion'],
   6,
   true),
   
  ('payment', 
   'What are the payment terms?', 
   'Our standard payment structure is designed to be transparent and secure:

• **Design Fee**: Typically paid in 2-3 installments
  - 50% advance to begin design work
  - 50% upon design completion

• **Execution Fee** (if applicable):
  - 25-30% advance to begin procurement
  - 40-50% in staged payments based on work progress
  - 20-25% upon project completion

All payments are secured through our platform. We accept credit/debit cards, net banking, UPI, and bank transfers. Detailed payment terms will be outlined in your agreement with the designer.',
   ARRAY['payment', 'pay', 'cost', 'installments', 'advance', 'money', 'fee', 'charges'],
   6,
   true),
   
  ('registration', 
   'How do I register my project?', 
   'Registering your project is simple:

1. Click on "Register Your Project" in the navigation menu
2. Create an account or sign in if you already have one
3. Fill in the project questionnaire with details about:
   - Your space (size, type, location)
   - Your requirements and preferences
   - Your budget range
   - Your timeline
4. Upload any reference images or floor plans (optional)
5. Submit your project

Once registered, you can either browse designers yourself or wait for designer matches based on your requirements. The registration process takes about 5-10 minutes.',
   ARRAY['register', 'sign up', 'submit project', 'start', 'begin', 'create project', 'how to start'],
   8,
   true),
   
  ('styles', 
   'What design styles do you offer?', 
   'Our designers specialize in a wide range of interior design styles including:

• **Modern & Contemporary**: Clean lines, minimal ornamentation, current trends
• **Traditional Indian**: Rich colors, intricate patterns, cultural elements
• **Minimalist**: Simplicity, functionality, neutral colors, clean spaces
• **Industrial**: Raw materials, exposed elements, urban aesthetic
• **Scandinavian**: Light colors, natural materials, functionality
• **Luxury & High-End**: Premium materials, bespoke elements, sophisticated details
• **Fusion/Eclectic**: Mix of styles, personalized combinations
• **Vastu-compliant**: Designs following traditional Vastu principles

You can filter designers by their style specialization when browsing profiles.',
   ARRAY['styles', 'design styles', 'aesthetic', 'modern', 'traditional', 'minimalist', 'look', 'theme'],
   7,
   true);