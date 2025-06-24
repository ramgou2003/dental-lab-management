import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const getGeminiAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('❌ Gemini API key not configured:', {
      hasKey: !!apiKey,
      keyStart: apiKey?.substring(0, 10) + '...',
      environment: import.meta.env.MODE
    });
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Enhance dental lab instructions using Google Gemini AI
 * @param instructions - The original instructions to enhance
 * @returns Promise<string> - Enhanced instructions
 */
export const enhanceLabInstructions = async (instructions: string): Promise<string> => {
  try {
    const genAI = getGeminiAI();
    
    // Use Gemini 1.5 Flash (free model with generous limits)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a professional dental laboratory communication specialist. Rewrite these dental design instructions to be professionally formatted with correct grammar and proper dental terminology:

"${instructions}"

REWRITING REQUIREMENTS:
- Correct all grammar, spelling, and punctuation errors
- Use professional dental terminology and proper dental notations
- Maintain ALL technical specifications exactly as provided (tooth numbers, materials, shades, measurements)
- Keep ALL abbreviations unchanged (PTI, SDA, USDA, RPD, etc.)
- Format as clear design instructions from clinical staff to lab technician
- Use proper dental notation standards (tooth #8, teeth #14-16, etc.)
- Structure content with bullet points for clarity when appropriate
- Maintain professional, instructional tone throughout
- Preserve all original technical requirements and specifications

IMPORTANT - PRESERVE PERSONAL GREETINGS:
- If the text starts with "Hi [Name]" or similar greeting, keep it EXACTLY as written
- If the text ends with "Thank you, [Name]" or similar personal closing, keep it EXACTLY as written
- Only rewrite the middle content (the actual dental instructions)
- Do NOT add any generic closings if there's already a personal one

Focus on:
- Professional grammar and sentence structure
- Clear, concise design instructions
- Proper dental terminology usage
- Maintaining all technical details exactly as specified
- Preserving personal greetings and closings

Respond with only the professionally rewritten instructions, no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text();
    
    if (!enhancedText || enhancedText.trim().length === 0) {
      throw new Error('No enhanced text received from Gemini AI');
    }
    
    return enhancedText.trim();
    
  } catch (error) {
    console.error('Error enhancing instructions with Gemini AI:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      } else if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      } else if (error.message.includes('safety')) {
        throw new Error('Content was blocked by safety filters. Please modify your instructions.');
      }
    }
    
    throw new Error('Failed to enhance instructions. Please try again.');
  }
};

/**
 * Test if Gemini AI is properly configured
 * @returns Promise<boolean> - True if configured correctly
 */
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Simple test prompt
    const result = await model.generateContent("Say 'Hello' in one word.");
    const response = await result.response;
    const text = response.text();
    
    return text.trim().length > 0;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
};
