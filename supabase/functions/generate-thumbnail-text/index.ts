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
    const { videoDescription, selectedTitle, emotion } = await req.json();
    
    console.log('Generating thumbnail text with:', { videoDescription, selectedTitle, emotion });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a YouTube thumbnail text optimization expert. Generate SHORT, POWERFUL text for thumbnail overlays.

CRITICAL RULES:
- Keep text between 1-8 WORDS MAXIMUM (shorter is better)
- Use ALL CAPS for maximum impact
- Focus on emotional triggers and power words
- Text must be readable on mobile (large, bold text works best)
- Create curiosity or promise a benefit
- Use numbers when impactful (e.g., "3 SECRETS", "5 MIN")
- Think visual impact, NOT SEO

POWER WORDS TO USE:
- ULTIMATE, SECRET, SHOCKING, EASY, PROVEN, INSTANT
- HOW TO, NEVER, ALWAYS, BEST, WORST, NEW
- YOU, YOUR, FREE, BONUS, GUARANTEED

Your response MUST be valid JSON in this exact format:
{
  "thumbnailTexts": [
    {
      "text": "THE ACTUAL SHORT TEXT",
      "reason": "Why this text works visually"
    }
  ]
}

Generate 3-4 thumbnail text variations optimized for visual impact.`;

    const userPrompt = `Video Description: ${videoDescription}

Selected Video Title: ${selectedTitle}
Emotion: ${emotion}

Generate 3-4 SHORT thumbnail text options (1-8 words max) that:
1. Create visual impact and curiosity
2. Match the ${emotion} emotion
3. Are readable at small sizes on mobile
4. Complement but DON'T repeat the video title
5. Use power words and emotional triggers

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

    let parsedResponse;
    try {
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
    console.error('Error in generate-thumbnail-text function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate thumbnail text';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
