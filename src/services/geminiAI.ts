import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const getGeminiAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
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
    
    const prompt = `Please enhance these dental lab instructions to be more professional and clear while keeping all technical details exactly the same:

"${instructions}"

ENHANCEMENT RULES:
- Keep ALL abbreviations and short forms EXACTLY as written (PTI, SDA, USDA, etc.)
- Do NOT expand or elaborate any abbreviations
- Keep ALL numbers, measurements, specifications unchanged
- Keep ALL materials, shades, tooth numbers exactly as provided
- Rephrase the entire text comprehensively
- Use proper dental terminology and professional tone throughout
- Make the tone consistently professional and polished
- Correct grammar and improve sentence structure
- Format content with proper layout and structure
- Convert any lists into bullet points (•)
- Write as clinical staff instructing designer on patient design requirements
- End with only "Thank you." - nothing else
- Preserve the original meaning and all technical terms

Please respond with only the professionally enhanced text, no additional commentary.`;

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
