import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewPatientFormData } from '@/types/newPatientPacket';

// Initialize Gemini AI with API key from environment
const getGeminiAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  console.log('🔑 Checking Gemini API key:', {
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyStart: apiKey?.substring(0, 10) + '...',
    environment: import.meta.env.MODE
  });

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('❌ Gemini API key not configured for patient summary');
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }

  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate AI-powered patient summary from patient packet data
 */
export const generatePatientSummary = async (patientData: NewPatientFormData): Promise<{
  medicalHistorySummary: string;
  allergiesSummary: string;
  dentalHistorySummary: string;
  attentionItems: string[];
  potentialComplications: string[];
  overallAssessment: string;
}> => {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Prepare patient data for AI analysis with better data cleaning
    const cleanArray = (arr: any): string[] => {
      if (!arr) return [];
      if (Array.isArray(arr)) return arr.filter(item => item && item.trim());
      if (typeof arr === 'string') {
        try {
          const parsed = JSON.parse(arr);
          return Array.isArray(parsed) ? parsed.filter(item => item && item.trim()) : [arr];
        } catch {
          return arr.split(',').map(item => item.trim()).filter(item => item);
        }
      }
      return [];
    };

    const cleanString = (str: any): string => {
      if (!str) return 'Not provided';
      if (typeof str === 'string') return str.trim();
      if (typeof str === 'object') return JSON.stringify(str);
      return String(str);
    };

    // Helper function to get property value (handles both camelCase and snake_case)
    const getProp = (obj: any, camelCase: string, snakeCase: string): any => {
      return obj[camelCase] || obj[snakeCase] || null;
    };

    // Extract and analyze critical medical data for dental/oral surgery
    const criticalConditions = getProp(patientData, 'criticalConditions', 'critical_conditions') || {};
    const systemSpecific = getProp(patientData, 'systemSpecific', 'system_specific') || {};
    const medications = getProp(patientData, 'currentMedications', 'current_medications') || {};
    const allergies = patientData.allergies || {};
    const dentalStatus = getProp(patientData, 'dentalStatus', 'dental_status') || {};
    const currentSymptoms = getProp(patientData, 'currentSymptoms', 'current_symptoms') || {};
    const healingIssues = getProp(patientData, 'healingIssues', 'healing_issues') || {};
    const pregnancy = patientData.pregnancy || {};
    const tobaccoUse = getProp(patientData, 'tobaccoUse', 'tobacco_use') || {};

    const clinicalData = {
      patient: {
        name: `${getProp(patientData, 'firstName', 'first_name') || ''} ${getProp(patientData, 'lastName', 'last_name') || ''}`.trim(),
        age: getProp(patientData, 'dateOfBirth', 'date_of_birth') ? calculateAge(getProp(patientData, 'dateOfBirth', 'date_of_birth')) : 'Unknown',
        gender: patientData.gender || 'Not specified'
      },

      // Critical medical conditions affecting dental treatment
      criticalMedicalConditions: {
        diabetes: criticalConditions.diabetes || { has: false },
        heartDisease: criticalConditions.heartDisease || false,
        highBloodPressure: criticalConditions.highBloodPressure || false,
        cancer: criticalConditions.cancer || { has: false },
        periodontalDisease: criticalConditions.periodontalDisease || false,
        acidReflux: criticalConditions.acidReflux || false,
        depressionAnxiety: criticalConditions.depressionAnxiety || false,
        substanceAbuse: criticalConditions.substanceAbuse || false
      },

      // System-specific conditions
      systemicConditions: {
        cardiovascular: systemSpecific.cardiovascular || [],
        respiratory: systemSpecific.respiratory || [],
        neurological: systemSpecific.neurological || [],
        endocrineRenal: systemSpecific.endocrineRenal || [],
        gastrointestinal: systemSpecific.gastrointestinal || []
      },

      // Medications with dental implications
      medications: {
        emergency: medications.emergency || [],
        specialized: medications.specialized || [],
        boneOsteoporosis: medications.boneOsteoporosis || [],
        complete: medications.complete || 'Not provided'
      },

      // Allergies critical for dental treatment
      allergies: {
        medications: (allergies as any)?.medications || [],
        dentalRelated: (allergies as any)?.dentalRelated || [],
        food: (allergies as any)?.food || 'None reported',
        other: (allergies as any)?.other || []
      },

      // Current dental status and needs
      dentalCondition: {
        upperJaw: dentalStatus.upperJaw || 'Not specified',
        lowerJaw: dentalStatus.lowerJaw || 'Not specified',
        previousSolutions: cleanArray(getProp(patientData, 'previousSolutions', 'previous_solutions')),
        currentSymptoms: {
          jawClicking: (currentSymptoms as any)?.jawClicking || false,
          facialOralPain: (currentSymptoms as any)?.facialOralPain || false,
          jawPainOpening: (currentSymptoms as any)?.jawPainOpening || false,
          symptomDuration: (currentSymptoms as any)?.symptomDuration || 'Not specified',
          digestiveProblems: (currentSymptoms as any)?.digestiveProblems || false
        }
      },

      // Healing and surgical risk factors
      healingFactors: {
        delayedHealing: (healingIssues as any)?.delayedHealing || false,
        bleedingBruising: (healingIssues as any)?.bleedingBruising || false,
        recurrentInfections: (healingIssues as any)?.recurrentInfections || false,
        pregnancy: {
          status: (pregnancy as any)?.status || 'not-applicable',
          weeks: (pregnancy as any)?.weeks || 0
        },
        tobaccoUse: (tobaccoUse as any)?.type || 'none'
      },

      // Patient comfort and anxiety management
      patientPreferences: {
        anxietyControl: cleanArray(getProp(patientData, 'anxietyControl', 'anxiety_control')),
        painManagement: cleanArray(getProp(patientData, 'painInjection', 'pain_injection')),
        communication: cleanArray(patientData.communication),
        physicalComfort: cleanArray(getProp(patientData, 'physicalComfort', 'physical_comfort'))
      }
    };

    // Debug: Log the patient data structure
    console.log('🔍 Clinical data for dental AI analysis:', {
      originalData: patientData,
      processedClinicalData: clinicalData
    });

    const prompt = `You are a specialized dental and oral surgery AI assistant. Analyze this patient's medical and dental history to provide a comprehensive clinical assessment for dental treatment planning and oral surgery procedures.

CLINICAL PATIENT DATA:
${JSON.stringify(clinicalData, null, 2)}

DENTAL PRACTICE CONTEXT:
This analysis is for a dental clinic specializing in oral surgery, dental implants, and complex restorative procedures. Focus on clinical factors that directly impact dental treatment safety, success, and patient management.

ANALYSIS INSTRUCTIONS:
- Prioritize medical conditions that affect dental procedures (bleeding, healing, infection risk)
- Identify medication interactions with dental anesthetics and procedures
- Assess surgical candidacy for implants and oral surgery
- Evaluate infection control and antibiotic prophylaxis needs
- Consider anxiety management and sedation requirements
- Provide actionable clinical recommendations

Provide your analysis in this exact JSON format with BULLET POINTS for easy clinical review:

{
  "medicalHistorySummary": "• Diabetes: [Type and control status]\n• Cardiovascular: [Heart conditions, BP, pacemaker status]\n• Bleeding Risk: [Anticoagulants, bleeding disorders]\n• Bone Health: [Osteoporosis medications, BRONJ risk]\n• Other Conditions: [Additional relevant medical history]",
  "allergiesSummary": "• Local Anesthetics: [Lidocaine, articaine, epinephrine allergies]\n• Antibiotics: [Penicillin, sulfa, erythromycin allergies]\n• Pain Medications: [NSAID, aspirin, acetaminophen allergies]\n• Dental Materials: [Latex, metal, acrylic allergies]\n• Food Allergies: [Relevant food allergies affecting treatment]",
  "dentalHistorySummary": "• Current Dental Status: [Missing teeth, existing restorations]\n• Previous Dental Work: [Bridges, dentures, implants, success/failures]\n• Current Symptoms: [Pain, TMJ issues, functional problems]\n• Oral Surgery Needs: [Extractions, bone grafting, implant planning]\n• Treatment Urgency: [Immediate vs elective care needs]",
  "attentionItems": [
    "Critical medical factor requiring immediate attention before treatment",
    "Important medication interaction or contraindication to address",
    "Specific dental risk factor requiring special protocols"
  ],
  "potentialComplications": [
    "Surgical complication risk based on medical history",
    "Healing or infection risk factor to monitor",
    "Anesthetic or medication complication to prevent"
  ],
  "overallAssessment": "RISK LEVEL: [LOW/MODERATE/HIGH]\n• Premedication Needs: [Antibiotics, anxiety management]\n• Specialist Consultations: [Cardiology, endocrinology clearance needed]\n• Treatment Modifications: [Shorter appointments, special protocols]\n• Implant Candidacy: [Bone quality, healing factors assessment]"
}

SPECIFIC CLINICAL ANALYSIS REQUIREMENTS:

1. **Medical History Summary** - Format as BULLET POINTS covering:
   - Diabetes: Type, control status, HbA1c implications for healing
   - Cardiovascular: Heart disease, pacemaker, blood pressure, bleeding risk
   - Cancer: Current treatment, radiation history affecting jaw/oral tissues
   - Bone health: Osteoporosis medications (bisphosphonates), BRONJ risk
   - Respiratory: Asthma, sleep apnea affecting sedation/anesthesia
   - Neurological: Seizures, stroke, affecting treatment positioning

2. **Allergies Summary** - Format as BULLET POINTS for dental-specific focus:
   - Local anesthetics: Lidocaine, articaine, epinephrine sensitivity
   - Antibiotics: Penicillin, sulfa, erythromycin for prophylaxis planning
   - NSAIDs: Aspirin, ibuprofen for pain management options
   - Latex: Glove and material selection
   - Dental materials: Metals, acrylics, impression materials

3. **Dental History Summary** - Format as BULLET POINTS for treatment planning:
   - Current tooth status: Missing teeth, implant candidacy
   - Previous work: Bridges, dentures, root canals, success/failure patterns
   - Current symptoms: Pain, TMJ issues, functional problems
   - Oral surgery needs: Extractions, bone grafting, sinus lifts

4. **Critical Attention Items** (3-5 items):
   - Immediate safety concerns (uncontrolled diabetes, recent MI)
   - Medication interactions (warfarin, bisphosphonates)
   - Infection risks (immunosuppression, valve disease)
   - Pregnancy considerations (trimester, medication safety)

5. **Potential Complications** (3-5 items):
   - Bleeding complications (anticoagulants, liver disease)
   - Healing problems (diabetes, smoking, steroids)
   - Infection risks (immunocompromised, prosthetic joints)
   - Anesthetic complications (allergies, drug interactions)

6. **Overall Assessment**:
   - Risk level: LOW/MODERATE/HIGH for dental procedures
   - Premedication needs: Antibiotics, anxiety management
   - Specialist consultations: Cardiology, endocrinology clearance
   - Treatment modifications: Shorter appointments, special protocols
   - Implant candidacy: Bone quality, healing factors, success predictors

CRITICAL FORMATTING REQUIREMENTS:
- Respond with ONLY a valid JSON object
- No markdown formatting, no code blocks, no explanations
- Start with { and end with }
- Use proper JSON syntax with double quotes
- Ensure all strings are properly escaped
- Do not include any text before or after the JSON

EXAMPLE FORMAT:
{
  "medicalHistorySummary": "Your analysis here...",
  "allergiesSummary": "Your analysis here...",
  "dentalHistorySummary": "Your analysis here...",
  "attentionItems": ["Item 1", "Item 2", "Item 3"],
  "potentialComplications": ["Complication 1", "Complication 2", "Complication 3"],
  "overallAssessment": "Your assessment here..."
}

RESPOND NOW WITH ONLY THE JSON OBJECT:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Debug: Log the raw AI response
    console.log('🤖 Raw AI Response:', aiResponse);
    console.log('📏 Response length:', aiResponse.length);

    // Clean and parse the AI response
    let cleanedResponse = aiResponse.trim();

    // Remove any markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to find JSON object in the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    console.log('🧹 Cleaned response:', cleanedResponse);

    try {
      const parsedResponse = JSON.parse(cleanedResponse);
      console.log('✅ Successfully parsed AI response:', parsedResponse);

      // Validate the response has required fields
      if (parsedResponse.medicalHistorySummary &&
          parsedResponse.allergiesSummary &&
          parsedResponse.dentalHistorySummary &&
          parsedResponse.attentionItems &&
          parsedResponse.potentialComplications &&
          parsedResponse.overallAssessment) {
        return parsedResponse;
      } else {
        console.warn('⚠️ AI response missing required fields:', Object.keys(parsedResponse));
        throw new Error('Incomplete AI response');
      }

    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.log('🔍 Attempting to extract information from raw response...');

      // Try to extract information from the raw response using regex
      const extractSection = (sectionName: string): string => {
        const regex = new RegExp(`"${sectionName}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = aiResponse.match(regex);
        return match ? match[1] : `Unable to extract ${sectionName} from AI response.`;
      };

      const extractArray = (arrayName: string): string[] => {
        const regex = new RegExp(`"${arrayName}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i');
        const match = aiResponse.match(regex);
        if (match) {
          try {
            return JSON.parse(`[${match[1]}]`);
          } catch {
            return [`Unable to parse ${arrayName} from AI response.`];
          }
        }
        return [`No ${arrayName} found in AI response.`];
      };

      // Create fallback response with extracted information
      return {
        medicalHistorySummary: extractSection('medicalHistorySummary'),
        allergiesSummary: extractSection('allergiesSummary'),
        dentalHistorySummary: extractSection('dentalHistorySummary'),
        attentionItems: extractArray('attentionItems'),
        potentialComplications: extractArray('potentialComplications'),
        overallAssessment: extractSection('overallAssessment')
      };
    }
    
  } catch (error) {
    console.error('Error generating patient summary:', error);
    throw new Error('Failed to generate patient summary. Please try again.');
  }
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Test if patient summary AI is working
 */
export const testPatientSummaryAI = async (): Promise<boolean> => {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent("Respond with 'OK' if you can analyze patient data.");
    const response = await result.response;
    const text = response.text();

    return text.trim().toLowerCase().includes('ok');
  } catch (error) {
    console.error('Patient summary AI test failed:', error);
    return false;
  }
}

// Simple test function for debugging
export async function testSimpleAI(): Promise<void> {
  try {
    console.log('🧪 Testing AI with simple prompt...');

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const simplePrompt = `Respond with this exact JSON format:
{
  "test": "This is a test response",
  "status": "working"
}`;

    const result = await model.generateContent(simplePrompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 Simple AI Response:', text);

    try {
      const parsed = JSON.parse(text);
      console.log('✅ Successfully parsed:', parsed);
    } catch (parseError) {
      console.log('❌ Parse error:', parseError);
      console.log('🔍 Trying to clean response...');

      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }

      console.log('🧹 Cleaned response:', cleaned);

      try {
        const parsedCleaned = JSON.parse(cleaned);
        console.log('✅ Successfully parsed cleaned response:', parsedCleaned);
      } catch (cleanParseError) {
        console.log('❌ Still failed to parse:', cleanParseError);
      }
    }

  } catch (error) {
    console.error('❌ Simple AI test failed:', error);
  }
}

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testSimpleAI = testSimpleAI;
  (window as any).testAIConnection = async () => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const result = await model.generateContent("Respond with 'OK' if you can analyze patient data.");
      const response = await result.response;
      const text = response.text();

      console.log('🔗 AI Connection test result:', text);
      return text.trim().toLowerCase().includes('ok');
    } catch (error) {
      console.error('❌ AI connection test failed:', error);
      return false;
    }
  };
};
