import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VastuRequest {
  projectId?: string;
  layoutImageUrl: string;
}

interface VastuRecommendation {
  zone: string;
  element: string;
  status: 'good' | 'warning' | 'bad';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface VastuResponse {
  score: number;
  recommendations: VastuRecommendation[];
  summary: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { projectId, layoutImageUrl }: VastuRequest = await req.json()

    if (!layoutImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Layout image URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // In a real implementation, this would call a computer vision API
    // to analyze the floor plan and apply Vastu principles
    // For now, we'll generate mock analysis results

    // Generate a random Vastu score between 65-95
    const score = Math.floor(Math.random() * 31) + 65

    // Generate mock recommendations
    const recommendations: VastuRecommendation[] = [
      {
        zone: 'North-East (Ishanya)',
        element: 'Water',
        status: score > 80 ? 'good' : 'warning',
        recommendation: score > 80 
          ? 'Well placed water element. Maintain this area for prayer or meditation.'
          : 'Consider adding a water feature or prayer space in this zone for better energy flow.',
        priority: score > 80 ? 'low' : 'medium'
      },
      {
        zone: 'South-East (Agneya)',
        element: 'Fire',
        status: score > 75 ? 'good' : 'bad',
        recommendation: score > 75
          ? 'Kitchen is well positioned in the South-East. Maintain this placement.'
          : 'Kitchen should be relocated to the South-East corner for proper fire element alignment.',
        priority: score > 75 ? 'low' : 'high'
      },
      {
        zone: 'South (Yama)',
        element: 'Earth',
        status: Math.random() > 0.5 ? 'good' : 'warning',
        recommendation: 'Ensure heavy furniture or storage is placed in the southern zone. Avoid sleeping with head facing south.',
        priority: 'medium'
      },
      {
        zone: 'South-West (Nairutya)',
        element: 'Earth',
        status: Math.random() > 0.7 ? 'good' : 'warning',
        recommendation: 'Master bedroom is ideally placed in South-West. Ensure this area has solid walls and minimal windows.',
        priority: 'medium'
      },
      {
        zone: 'West (Varuna)',
        element: 'Water',
        status: Math.random() > 0.6 ? 'good' : 'warning',
        recommendation: 'Good placement for children\'s bedroom or study room. Ensure proper ventilation in this area.',
        priority: 'low'
      },
      {
        zone: 'North-West (Vayavya)',
        element: 'Air',
        status: Math.random() > 0.5 ? 'warning' : 'bad',
        recommendation: 'Guest room or storage should be in this area. Avoid placing toilets in the North-West zone.',
        priority: 'high'
      },
      {
        zone: 'North (Kubera)',
        element: 'Water',
        status: Math.random() > 0.4 ? 'good' : 'warning',
        recommendation: 'Ideal for wealth storage or home office. Ensure this area is clutter-free for prosperity.',
        priority: 'medium'
      },
      {
        zone: 'Center (Brahma)',
        element: 'Space',
        status: Math.random() > 0.8 ? 'good' : 'bad',
        recommendation: 'Keep the center of your home open and free from heavy furniture or beams for positive energy flow.',
        priority: 'high'
      }
    ]

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })

    // Generate summary based on score
    let summary = ''
    if (score >= 85) {
      summary = 'Your home layout has excellent Vastu alignment. Minor adjustments can perfect the energy flow.'
    } else if (score >= 70) {
      summary = 'Your home has good Vastu alignment with some areas needing attention.'
    } else {
      summary = 'Your home layout has several Vastu misalignments that should be addressed.'
    }

    const response: VastuResponse = {
      score,
      recommendations,
      summary
    }

    // If projectId is provided, save the analysis to the database
    if (projectId) {
      try {
        // Insert analysis
        const { data: analysisData, error: analysisError } = await supabase
          .from('vastu_analyses')
          .insert({
            project_id: projectId,
            layout_image_url: layoutImageUrl,
            vastu_score: score,
            analysis_summary: summary
          })
          .select()
          .single()

        if (analysisError) {
          console.error('Error saving Vastu analysis:', analysisError)
        } else if (analysisData) {
          // Insert recommendations
          const recommendationsToInsert = recommendations.map(rec => ({
            analysis_id: analysisData.id,
            zone: rec.zone,
            element: rec.element,
            status: rec.status,
            recommendation: rec.recommendation,
            priority: rec.priority
          }))

          const { error: recError } = await supabase
            .from('vastu_recommendations')
            .insert(recommendationsToInsert)

          if (recError) {
            console.error('Error saving Vastu recommendations:', recError)
          }
        }
      } catch (error) {
        console.error('Error in database operations:', error)
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in vastu-analysis function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})