// Test the improved AI analysis with sample patient data
import { generatePatientSummary } from './services/patientSummaryAI.js';

// Sample patient data based on the actual database structure
const samplePatientData = {
  first_name: "Jessica",
  last_name: "Taylor", 
  gender: "female",
  date_of_birth: "1985-08-04",
  height: "68",
  weight: "150",
  bmi: "22.8",
  
  // Critical medical conditions
  critical_conditions: {
    diabetes: { has: true, type: "1" },
    heartDisease: false,
    highBloodPressure: true,
    cancer: { has: true, type: "breast" },
    periodontalDisease: false,
    acidReflux: true,
    depressionAnxiety: false,
    substanceAbuse: false
  },
  
  // System-specific conditions
  system_specific: {
    cardiovascular: ["High Blood Pressure", "Pacemaker", "Heart Murmur"],
    respiratory: ["Asthma", "Shortness of Breath"],
    neurological: ["Seizures", "Multiple Sclerosis"],
    endocrineRenal: ["Thyroid Disease", "Osteoporosis"],
    gastrointestinal: ["Liver Disease"]
  },
  
  // Additional conditions
  additional_conditions: [
    "Frequent Headaches",
    "Joint Problems", 
    "Prolonged Bleeding"
  ],
  
  // Current medications
  current_medications: {
    emergency: ["Rescue Inhaler (Albuterol)"],
    specialized: [
      "Blood Thinners (Warfarin, Coumadin)",
      "Immunosuppressants",
      "Heart Medications",
      "Steroids (Prednisone)"
    ],
    boneOsteoporosis: [
      "Fosamax (Alendronate)",
      "Reclast (Zoledronic Acid)",
      "Boniva (Ibandronate)"
    ]
  },
  
  // Allergies
  allergies: {
    medications: [
      "Sulfa Drugs",
      "Aspirin", 
      "Acetaminophen",
      "Erythromycin"
    ],
    dentalRelated: [
      "Local Anesthetic (Lidocaine, Novocaine)",
      "Aspirin",
      "Dental Materials"
    ],
    food: "Nuts, shellfish",
    other: ["Nuts", "Soy"]
  },
  
  // Dental status
  dental_status: {
    upperJaw: "some-missing",
    lowerJaw: "some-missing"
  },
  
  // Previous dental solutions
  previous_solutions: [
    "Partial Dentures (Upper)",
    "Dental Bridges", 
    "Root Canals"
  ],
  
  // Current symptoms
  current_symptoms: {
    jawClicking: false,
    facialOralPain: true,
    jawPainOpening: true,
    symptomDuration: "3-6 months",
    digestiveProblems: true
  },
  
  // Healing issues
  healing_issues: {
    delayedHealing: true,
    bleedingBruising: true,
    recurrentInfections: true
  },
  
  // Pregnancy status
  pregnancy: {
    status: "not-applicable",
    weeks: 0
  },
  
  // Tobacco use
  tobacco_use: {
    type: "former-smoker"
  },
  
  // Patient preferences
  anxiety_control: [
    "I gag easily during dental procedures",
    "I have had traumatic dental experiences", 
    "I prefer sedation for anxiety"
  ],
  
  pain_injection: [
    "Pain relief is my top priority",
    "I prefer topical numbing before injections",
    "I need to discuss pain management options"
  ],
  
  communication: [
    "I need detailed explanations of procedures",
    "I prefer to have a family member present"
  ],
  
  physical_comfort: [
    "I have neck problems",
    "I have trouble keeping my mouth open"
  ]
};

// Test function
async function testAIAnalysis() {
  try {
    console.log('🧪 Testing improved AI analysis...');
    console.log('📋 Sample patient: Complex medical history with multiple risk factors');
    
    const summary = await generatePatientSummary(samplePatientData);
    
    console.log('\n✅ AI Analysis Results:');
    console.log('='.repeat(50));
    
    console.log('\n🏥 MEDICAL HISTORY SUMMARY:');
    console.log(summary.medicalHistorySummary);
    
    console.log('\n🚨 ALLERGIES SUMMARY:');
    console.log(summary.allergiesSummary);
    
    console.log('\n🦷 DENTAL HISTORY SUMMARY:');
    console.log(summary.dentalHistorySummary);
    
    console.log('\n⚠️ CRITICAL ATTENTION ITEMS:');
    summary.attentionItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    console.log('\n🔴 POTENTIAL COMPLICATIONS:');
    summary.potentialComplications.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    console.log('\n📊 OVERALL ASSESSMENT:');
    console.log(summary.overallAssessment);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAIAnalysis = testAIAnalysis;
  window.samplePatientData = samplePatientData;
  console.log('🔧 Test functions available:');
  console.log('- window.testAIAnalysis() - Run the AI analysis test');
  console.log('- window.samplePatientData - View the sample patient data');
} else {
  // Run if executed directly
  testAIAnalysis();
}
