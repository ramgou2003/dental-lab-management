import { testGeminiConnection } from '@/services/geminiAI';

export const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing Gemini API connection...');
    const isWorking = await testGeminiConnection();
    
    if (isWorking) {
      console.log('✅ Gemini API is working correctly!');
      return true;
    } else {
      console.log('❌ Gemini API test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini API test error:', error);
    return false;
  }
};

// Auto-run test when this module is imported
testGeminiAPI();
