// Feature flags configuration for controlling module visibility
// Set environment variables to control which features are enabled

export interface FeatureFlags {
  // Core modules - always enabled
  dashboard: boolean;
  patients: boolean;
  settings: boolean;
  profile: boolean;
  
  // Lead management
  leadIn: boolean;
  appointments: boolean;
  consultation: boolean;
  
  // Lab operations
  lab: boolean;
  reportCards: boolean;
  manufacturing: boolean;
  applianceDelivery: boolean;
  
  // Admin features
  userManagement: boolean;
  
  // Public features
  publicPatientForm: boolean;
  publicPatientPacket: boolean;
}

// Default feature flags - can be overridden by environment variables
const defaultFlags: FeatureFlags = {
  // Core modules - always enabled
  dashboard: true,
  patients: true,
  settings: true,
  profile: true,
  
  // Lead management - enabled by default
  leadIn: true,
  appointments: true,
  consultation: true,
  
  // Lab operations - can be disabled for initial production
  lab: true,
  reportCards: true,
  manufacturing: true,
  applianceDelivery: true,
  
  // Admin features - can be restricted
  userManagement: true,
  
  // Public features - enabled by default
  publicPatientForm: true,
  publicPatientPacket: true,
};

// Helper function to parse environment variable as boolean
const parseEnvBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Get feature flags from environment variables with fallbacks
export const getFeatureFlags = (): FeatureFlags => {
  return {
    // Core modules
    dashboard: parseEnvBoolean(import.meta.env.VITE_FEATURE_DASHBOARD, defaultFlags.dashboard),
    patients: parseEnvBoolean(import.meta.env.VITE_FEATURE_PATIENTS, defaultFlags.patients),
    settings: parseEnvBoolean(import.meta.env.VITE_FEATURE_SETTINGS, defaultFlags.settings),
    profile: parseEnvBoolean(import.meta.env.VITE_FEATURE_PROFILE, defaultFlags.profile),
    
    // Lead management
    leadIn: parseEnvBoolean(import.meta.env.VITE_FEATURE_LEAD_IN, defaultFlags.leadIn),
    appointments: parseEnvBoolean(import.meta.env.VITE_FEATURE_APPOINTMENTS, defaultFlags.appointments),
    consultation: parseEnvBoolean(import.meta.env.VITE_FEATURE_CONSULTATION, defaultFlags.consultation),
    
    // Lab operations
    lab: parseEnvBoolean(import.meta.env.VITE_FEATURE_LAB, defaultFlags.lab),
    reportCards: parseEnvBoolean(import.meta.env.VITE_FEATURE_REPORT_CARDS, defaultFlags.reportCards),
    manufacturing: parseEnvBoolean(import.meta.env.VITE_FEATURE_MANUFACTURING, defaultFlags.manufacturing),
    applianceDelivery: parseEnvBoolean(import.meta.env.VITE_FEATURE_APPLIANCE_DELIVERY, defaultFlags.applianceDelivery),
    
    // Admin features
    userManagement: parseEnvBoolean(import.meta.env.VITE_FEATURE_USER_MANAGEMENT, defaultFlags.userManagement),
    
    // Public features
    publicPatientForm: parseEnvBoolean(import.meta.env.VITE_FEATURE_PUBLIC_PATIENT_FORM, defaultFlags.publicPatientForm),
    publicPatientPacket: parseEnvBoolean(import.meta.env.VITE_FEATURE_PUBLIC_PATIENT_PACKET, defaultFlags.publicPatientPacket),
  };
};

// Export the current feature flags
export const featureFlags = getFeatureFlags();

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

// Environment presets for different deployment stages
export const ENVIRONMENT_PRESETS = {
  // Minimal production - only core features
  minimal: {
    VITE_FEATURE_DASHBOARD: 'true',
    VITE_FEATURE_PATIENTS: 'true',
    VITE_FEATURE_SETTINGS: 'true',
    VITE_FEATURE_PROFILE: 'true',
    VITE_FEATURE_LEAD_IN: 'false',
    VITE_FEATURE_APPOINTMENTS: 'false',
    VITE_FEATURE_CONSULTATION: 'false',
    VITE_FEATURE_LAB: 'false',
    VITE_FEATURE_REPORT_CARDS: 'false',
    VITE_FEATURE_MANUFACTURING: 'false',
    VITE_FEATURE_APPLIANCE_DELIVERY: 'false',
    VITE_FEATURE_USER_MANAGEMENT: 'false',
    VITE_FEATURE_PUBLIC_PATIENT_FORM: 'true',
    VITE_FEATURE_PUBLIC_PATIENT_PACKET: 'true',
  },

  // Lead management focused
  leadManagement: {
    VITE_FEATURE_DASHBOARD: 'true',
    VITE_FEATURE_PATIENTS: 'true',
    VITE_FEATURE_SETTINGS: 'true',
    VITE_FEATURE_PROFILE: 'true',
    VITE_FEATURE_LEAD_IN: 'true',
    VITE_FEATURE_APPOINTMENTS: 'true',
    VITE_FEATURE_CONSULTATION: 'true',
    VITE_FEATURE_LAB: 'false',
    VITE_FEATURE_REPORT_CARDS: 'false',
    VITE_FEATURE_MANUFACTURING: 'false',
    VITE_FEATURE_APPLIANCE_DELIVERY: 'false',
    VITE_FEATURE_USER_MANAGEMENT: 'true',
    VITE_FEATURE_PUBLIC_PATIENT_FORM: 'true',
    VITE_FEATURE_PUBLIC_PATIENT_PACKET: 'true',
  },

  // Full production - all features
  full: {
    VITE_FEATURE_DASHBOARD: 'true',
    VITE_FEATURE_PATIENTS: 'true',
    VITE_FEATURE_SETTINGS: 'true',
    VITE_FEATURE_PROFILE: 'true',
    VITE_FEATURE_LEAD_IN: 'true',
    VITE_FEATURE_APPOINTMENTS: 'true',
    VITE_FEATURE_CONSULTATION: 'true',
    VITE_FEATURE_LAB: 'true',
    VITE_FEATURE_REPORT_CARDS: 'true',
    VITE_FEATURE_MANUFACTURING: 'true',
    VITE_FEATURE_APPLIANCE_DELIVERY: 'true',
    VITE_FEATURE_USER_MANAGEMENT: 'true',
    VITE_FEATURE_PUBLIC_PATIENT_FORM: 'true',
    VITE_FEATURE_PUBLIC_PATIENT_PACKET: 'true',
  }
};
