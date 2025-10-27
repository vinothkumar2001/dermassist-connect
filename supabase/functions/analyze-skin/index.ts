import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { imageUrl, symptoms } = await req.json();
    
    // Input validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate imageUrl is from Supabase storage
    if (!imageUrl.includes(supabaseUrl)) {
      return new Response(
        JSON.stringify({ error: 'Image must be from authorized storage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate symptoms if provided
    if (symptoms && (typeof symptoms !== 'string' || symptoms.length > 5000)) {
      return new Response(
        JSON.stringify({ error: 'Symptoms must be a string under 5000 characters' }),
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

    // Sanitize symptoms to prevent prompt injection
    const sanitizedSymptoms = symptoms 
      ? symptoms.replace(/[<>{}]/g, '').trim().substring(0, 5000)
      : '';

    const userPrompt = sanitizedSymptoms
      ? `Please analyze this skin condition image. The patient reports the following symptoms: ${sanitizedSymptoms}`
      : `Please analyze this skin condition image and provide a comprehensive assessment.`;

    console.log(`Analyzing image for user ${user.id}`);

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
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_skin_condition",
              description: "Analyze a skin condition and return structured diagnosis data",
              parameters: {
                type: "object",
                properties: {
                  condition: { type: "string", description: "Most likely skin condition name" },
                  confidence: { type: "integer", description: "Confidence level between 0-100" },
                  severity: { type: "string", enum: ["mild", "moderate", "severe"] },
                  description: { type: "string", description: "Detailed description of the condition" },
                  symptoms: { type: "array", items: { type: "string" }, description: "Array of typical symptoms" },
                  recommendations: { type: "array", items: { type: "string" }, description: "Array of care recommendations" },
                  urgency: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                  requires_immediate_attention: { type: "boolean" },
                  common_causes: { type: "array", items: { type: "string" } },
                  when_to_see_doctor: { type: "string" }
                },
                required: ["condition", "confidence", "severity", "description", "symptoms", "recommendations", "urgency", "requires_immediate_attention", "common_causes", "when_to_see_doctor"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_skin_condition" } }
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
    console.log('Lovable AI response received');

    // Extract structured output from tool calling
    let analysis;
    try {
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function.name === 'analyze_skin_condition') {
        analysis = JSON.parse(toolCall.function.arguments);
        console.log('Successfully parsed structured analysis');
      } else {
        // Fallback to content if tool calling didn't work
        const analysisText = data.choices[0]?.message?.content;
        const jsonMatch = analysisText?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No structured output found in response');
        }
      }
    } catch (parseError) {
      console.error('Failed to extract analysis from response:', parseError);
      // Fallback: create default structured response
      analysis = {
        condition: "Analysis Available",
        confidence: 75,
        severity: "moderate",
        description: "Unable to perform detailed analysis. Please consult with a dermatologist for proper diagnosis.",
        symptoms: ["Unable to analyze automatically"],
        recommendations: ["Consult with a dermatologist for proper diagnosis", "Monitor the condition closely"],
        urgency: "medium",
        requires_immediate_attention: false,
        common_causes: ["Requires professional evaluation"],
        when_to_see_doctor: "As soon as possible for proper medical evaluation"
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