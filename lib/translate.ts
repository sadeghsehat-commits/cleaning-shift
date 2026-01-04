/**
 * Translate user-generated text using Google Translate API
 * Falls back to original text if translation fails or API is not available
 */

export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<string> {
  // If source and target are the same, return original
  if (targetLanguage === sourceLanguage || (sourceLanguage === 'auto' && targetLanguage === 'en')) {
    return text;
  }

  // Map language codes to Google Translate language codes
  const languageMap: Record<string, string> = {
    'en': 'en',
    'it': 'it',
    'ar': 'ar',
    'uk': 'uk',
  };

  const targetLang = languageMap[targetLanguage] || 'en';

  try {
    // Use Google Translate API (free tier available)
    // Note: This requires Google Cloud Translate API to be enabled
    // For now, we'll use a simple fetch approach (may require API key in production)
    
    // Using Google Translate free API endpoint (unofficial but works)
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage === 'auto' ? 'auto' : languageMap[sourceLanguage] || 'auto'}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
    }
  } catch (error) {
    console.error('Translation error:', error);
  }

  // Fallback: return original text
  return text;
}

