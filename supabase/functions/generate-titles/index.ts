import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoDescription, targetKeyword, emotion } = await req.json();
    
    console.log('Generating titles with:', { videoDescription, targetKeyword, emotion });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a YouTube title optimization expert. Generate engaging, click-worthy titles for YouTube videos.

RULES:
- Keep titles between 40-70 characters for optimal thumbnail readability
- Front-load the main keyword for SEO
- Use emotional triggers based on the specified emotion
- Include power words (SHOCKING, EASY, SECRET, ULTIMATE, etc.)
- Use numbers when appropriate
- Create urgency or curiosity
- Ensure titles are mobile-friendly and thumbnail-readable

Your response MUST be valid JSON in this exact format:
{
  "titles": [
    {
      "title": "The actual title text",
      "score": 85,
      "reason": "Why this title works"
    }
  ]
}

Generate 5-6 title variations with engagement scores (1-100).`;

    const userPrompt = `Video Description: ${videoDescription}

Target Keyword: ${targetKeyword}
Emotion: ${emotion}

Generate 5-6 YouTube title options optimized for this content. Each title should:
1. Include the target keyword naturally
2. Match the ${emotion} emotion
3. Be visually readable on a thumbnail
4. Score high for click-through rate potential

Return ONLY valid JSON with the format specified.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-titles function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate titles';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
