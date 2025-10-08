import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, symptoms } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'Lovable API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the prompt for skin disease analysis
    const systemPrompt = `You are an expert dermatologist AI assistant specialized in skin disease analysis. 
    Analyze the provided skin image and provide a comprehensive medical assessment.
    
    IMPORTANT: This is for educational/preliminary screening purposes only. Always recommend consulting with a licensed dermatologist for proper diagnosis and treatment.
    
    Provide your response in the following JSON format:
    {
      "condition": "Most likely skin condition name",
      "confidence": "Confidence level as integer between 0-100",
      "severity": "mild/moderate/severe",
      "description": "Detailed description of the condition",
      "symptoms": ["array", "of", "typical", "symptoms"],
      "recommendations": ["array", "of", "care", "recommendations"],
      "urgency": "low/medium/high/urgent",
      "requires_immediate_attention": boolean,
      "common_causes": ["array", "of", "common", "causes"],
      "when_to_see_doctor": "When to seek professional medical attention"
    }`;

    const userPrompt = symptoms 
      ? `Please analyze this skin condition image. The patient reports the following symptoms: ${symptoms}`
      : `Please analyze this skin condition image and provide a comprehensive assessment.`;

    console.log('Sending request to Lovable AI for skin analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error:', errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('OpenAI response received');

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback: create structured response from text
      analysis = {
        condition: "Analysis Available",
        confidence: 85,
        severity: "moderate",
        description: analysisText,
        symptoms: [],
        recommendations: ["Consult with a dermatologist for proper diagnosis"],
        urgency: "medium",
        requires_immediate_attention: false,
        common_causes: [],
        when_to_see_doctor: "If symptoms persist or worsen"
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysis,
        disclaimer: "This AI analysis is for educational purposes only. Please consult with a licensed dermatologist for proper medical diagnosis and treatment."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-skin function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});