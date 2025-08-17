/**
 * Page Visibility Configuration
 * 
 * This file controls which pages are visible in the sidebar navigation.
 * Set a page to `true` to show it, or `false` to hide it.
 * 
 * This provides an easy way to show/hide pages without modifying
 * the main feature flags or navigation components.
 */

export interface PageVisibilityConfig {
  dashboard: boolean;
  leadIn: boolean;
  appointments: boolean;
  consultation: boolean;
  patients: boolean;
  lab: boolean;
  reportCards: boolean;
  manufacturing: boolean;
  applianceDelivery: boolean;
  userManagement: boolean;
  settings: boolean;
}

/**
 * Current Page Visibility Settings
 * 
 * Only Dashboard, Patients, and User Management are visible.
 * All other pages are hidden for now.
 */
export const PAGE_VISIBILITY: PageVisibilityConfig = {
  // ✅ VISIBLE PAGES
  dashboard: true,           // Dashboard - Main overview page
  patients: true,            // Patients - Patient management
  userManagement: true,      // User Management - Admin user controls

  // ❌ HIDDEN PAGES (can be enabled later)
  leadIn: false,             // Lead-in - Lead management system
  appointments: false,       // Appointments - Appointment scheduling
  consultation: true,       // Consultation - Patient consultations
  lab: false,                // Lab - Laboratory management
  reportCards: false,        // Report Cards - Clinical reports
  manufacturing: false,      // Manufacturing - Production tracking
  applianceDelivery: false,  // Appliance Delivery - Delivery tracking
  settings: false,           // Settings - Application settings
};

/**
 * Helper function to check if a page should be visible
 * @param pageKey - The page key to check
 * @returns boolean - Whether the page should be visible
 */
export const isPageVisible = (pageKey: keyof PageVisibilityConfig): boolean => {
  return PAGE_VISIBILITY[pageKey] ?? false;
};

/**
 * Get all visible pages
 * @returns Array of visible page keys
 */
export const getVisiblePages = (): (keyof PageVisibilityConfig)[] => {
  return Object.entries(PAGE_VISIBILITY)
    .filter(([_, isVisible]) => isVisible)
    .map(([pageKey, _]) => pageKey as keyof PageVisibilityConfig);
};

/**
 * Get all hidden pages
 * @returns Array of hidden page keys
 */
export const getHiddenPages = (): (keyof PageVisibilityConfig)[] => {
  return Object.entries(PAGE_VISIBILITY)
    .filter(([_, isVisible]) => !isVisible)
    .map(([pageKey, _]) => pageKey as keyof PageVisibilityConfig);
};

/**
 * Preset configurations for different deployment scenarios
 */
export const PAGE_VISIBILITY_PRESETS = {
  // Minimal setup - only core pages
  minimal: {
    dashboard: true,
    patients: true,
    userManagement: true,
    leadIn: false,
    appointments: false,
    consultation: false,
    lab: false,
    reportCards: false,
    manufacturing: false,
    applianceDelivery: false,
    settings: false,
  },

  // Patient management focused
  patientFocused: {
    dashboard: true,
    patients: true,
    leadIn: true,
    appointments: true,
    consultation: true,
    userManagement: true,
    lab: false,
    reportCards: false,
    manufacturing: false,
    applianceDelivery: false,
    settings: false,
  },

  // Full lab management
  fullLab: {
    dashboard: true,
    patients: true,
    leadIn: true,
    appointments: true,
    consultation: true,
    lab: true,
    reportCards: true,
    manufacturing: true,
    applianceDelivery: true,
    userManagement: true,
    settings: true,
  },

  // Development - all pages visible
  development: {
    dashboard: true,
    patients: true,
    leadIn: true,
    appointments: true,
    consultation: true,
    lab: true,
    reportCards: true,
    manufacturing: true,
    applianceDelivery: true,
    userManagement: true,
    settings: true,
  }
};

/**
 * Apply a preset configuration
 * @param preset - The preset to apply
 */
export const applyPreset = (preset: keyof typeof PAGE_VISIBILITY_PRESETS): void => {
  const presetConfig = PAGE_VISIBILITY_PRESETS[preset];
  Object.assign(PAGE_VISIBILITY, presetConfig);
};

/**
 * Feature flag mapping for backward compatibility
 * Maps page visibility keys to their corresponding feature flag names
 */
export const FEATURE_FLAG_MAPPING = {
  dashboard: 'VITE_FEATURE_DASHBOARD',
  leadIn: 'VITE_FEATURE_LEAD_IN',
  appointments: 'VITE_FEATURE_APPOINTMENTS',
  consultation: 'VITE_FEATURE_CONSULTATION',
  patients: 'VITE_FEATURE_PATIENTS',
  lab: 'VITE_FEATURE_LAB',
  reportCards: 'VITE_FEATURE_REPORT_CARDS',
  manufacturing: 'VITE_FEATURE_MANUFACTURING',
  applianceDelivery: 'VITE_FEATURE_APPLIANCE_DELIVERY',
  userManagement: 'VITE_FEATURE_USER_MANAGEMENT',
  settings: 'VITE_FEATURE_SETTINGS',
} as const;
