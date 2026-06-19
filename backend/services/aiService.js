const fs = require('fs');
const path = require('path');

exports.analyzeImage = async (imagePath, policies) => {
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';

    const enabledCategories = policies.map(p => p.category);

    const prompt = `You are a content moderation system. Analyze the image and evaluate it against these categories: ${enabledCategories.join(', ')}.

Return ONLY a JSON array, one object per category, in this exact shape:
[
  {
    "category": "Graphic Violence",
    "result": "safe" or "unsafe",
    "confidence": <integer 0 to 100>,
    "reasoning": "<one short sentence>"
  }
]

"confidence" is your confidence in the "result" you assigned. Be objective. Return ONLY the JSON array.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64Image } },
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', JSON.stringify(data));
      throw new Error(data?.error?.message || 'Gemini request failed');
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.error('AI Service error:', err.message);
    // Fallback: treat everything as safe so a submission never hard-fails
    return policies.map(p => ({
      category: p.category,
      result: 'safe',
      confidence: 0,
      reasoning: 'AI service unavailable'
    }));
  }
};