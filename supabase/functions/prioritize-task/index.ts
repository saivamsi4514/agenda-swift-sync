import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = 'AIzaSyAhppouPT0zNRVb-POBQiyPkRoq2XmekiM';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    const prompt = `Analyze this task and determine its priority level (High, Medium, or Low) based on urgency, deadlines, and importance. Provide a brief, friendly explanation.

Task: "${title}"
Description: "${description || 'No additional description'}"

Consider:
- Deadlines or time-sensitive words (today, tonight, urgent, ASAP, deadline)
- Important keywords (meeting, presentation, exam, interview, project)
- Personal urgency indicators

Respond in this exact JSON format:
{
  "priority": "High|Medium|Low",
  "reason": "Brief explanation of why this priority was chosen"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error('No AI response received');
    }

    // Parse the JSON response from Gemini
    try {
      const parsed = JSON.parse(aiText);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const fallbackPriority = title.toLowerCase().includes('urgent') || 
                              title.toLowerCase().includes('asap') || 
                              title.toLowerCase().includes('deadline') ||
                              title.toLowerCase().includes('today') ||
                              title.toLowerCase().includes('tonight') ? 'High' : 'Medium';

      return new Response(JSON.stringify({
        priority: fallbackPriority,
        reason: `Assigned ${fallbackPriority} priority based on task content analysis.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in prioritize-task function:', error);
    return new Response(JSON.stringify({
      priority: 'Medium',
      reason: 'Unable to analyze priority automatically. Assigned Medium priority as default.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});