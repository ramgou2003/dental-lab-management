import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getFeatureFlags, isFeatureEnabled } from '@/config/featureFlags'

// Mock import.meta.env
const mockEnv = vi.hoisted(() => ({}))
vi.mock('import.meta.env', () => mockEnv)

describe('Feature Flags', () => {
  beforeEach(() => {
    // Reset mocked environment variables
    Object.keys(mockEnv).forEach(key => delete mockEnv[key])
  })

  describe('getFeatureFlags', () => {
    it('should return default flags when no environment variables are set', () => {
      const flags = getFeatureFlags()
      
      expect(flags.dashboard).toBe(true)
      expect(flags.patients).toBe(true)
      expect(flags.settings).toBe(true)
      expect(flags.profile).toBe(true)
      expect(flags.leadIn).toBe(true)
      expect(flags.appointments).toBe(true)
      expect(flags.consultation).toBe(true)
      expect(flags.lab).toBe(true)
      expect(flags.reportCards).toBe(true)
      expect(flags.manufacturing).toBe(true)
      expect(flags.applianceDelivery).toBe(true)
      expect(flags.userManagement).toBe(true)
      expect(flags.publicPatientForm).toBe(true)
      expect(flags.publicPatientPacket).toBe(true)
    })

    it('should override defaults with environment variables', () => {
      mockEnv.VITE_FEATURE_LAB = 'false'
      mockEnv.VITE_FEATURE_MANUFACTURING = 'false'
      mockEnv.VITE_FEATURE_USER_MANAGEMENT = 'false'
      
      const flags = getFeatureFlags()
      
      expect(flags.lab).toBe(false)
      expect(flags.manufacturing).toBe(false)
      expect(flags.userManagement).toBe(false)
      // Other flags should remain default
      expect(flags.dashboard).toBe(true)
      expect(flags.patients).toBe(true)
    })

    it('should handle case-insensitive boolean parsing', () => {
      mockEnv.VITE_FEATURE_LAB = 'TRUE'
      mockEnv.VITE_FEATURE_MANUFACTURING = 'False'
      mockEnv.VITE_FEATURE_USER_MANAGEMENT = 'true'
      
      const flags = getFeatureFlags()
      
      expect(flags.lab).toBe(true)
      expect(flags.manufacturing).toBe(false)
      expect(flags.userManagement).toBe(true)
    })
  })

  describe('isFeatureEnabled', () => {
    it('should return correct feature status', () => {
      mockEnv.VITE_FEATURE_LAB = 'false'
      mockEnv.VITE_FEATURE_DASHBOARD = 'true'
      
      expect(isFeatureEnabled('lab')).toBe(false)
      expect(isFeatureEnabled('dashboard')).toBe(true)
    })
  })

  describe('Minimal Production Configuration', () => {
    it('should disable advanced features in minimal mode', () => {
      // Simulate minimal production environment
      mockEnv.VITE_FEATURE_DASHBOARD = 'true'
      mockEnv.VITE_FEATURE_PATIENTS = 'true'
      mockEnv.VITE_FEATURE_SETTINGS = 'true'
      mockEnv.VITE_FEATURE_PROFILE = 'true'
      mockEnv.VITE_FEATURE_LEAD_IN = 'false'
      mockEnv.VITE_FEATURE_APPOINTMENTS = 'false'
      mockEnv.VITE_FEATURE_CONSULTATION = 'false'
      mockEnv.VITE_FEATURE_LAB = 'false'
      mockEnv.VITE_FEATURE_REPORT_CARDS = 'false'
      mockEnv.VITE_FEATURE_MANUFACTURING = 'false'
      mockEnv.VITE_FEATURE_APPLIANCE_DELIVERY = 'false'
      mockEnv.VITE_FEATURE_USER_MANAGEMENT = 'false'
      mockEnv.VITE_FEATURE_PUBLIC_PATIENT_FORM = 'true'
      mockEnv.VITE_FEATURE_PUBLIC_PATIENT_PACKET = 'true'
      
      const flags = getFeatureFlags()
      
      // Core features should be enabled
      expect(flags.dashboard).toBe(true)
      expect(flags.patients).toBe(true)
      expect(flags.settings).toBe(true)
      expect(flags.profile).toBe(true)
      expect(flags.publicPatientForm).toBe(true)
      expect(flags.publicPatientPacket).toBe(true)
      
      // Advanced features should be disabled
      expect(flags.leadIn).toBe(false)
      expect(flags.appointments).toBe(false)
      expect(flags.consultation).toBe(false)
      expect(flags.lab).toBe(false)
      expect(flags.reportCards).toBe(false)
      expect(flags.manufacturing).toBe(false)
      expect(flags.applianceDelivery).toBe(false)
      expect(flags.userManagement).toBe(false)
    })
  })
})
