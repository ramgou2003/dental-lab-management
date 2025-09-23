import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {}
    }
  },
  writable: true
})

describe('Feature Flags', () => {
  beforeEach(() => {
    // Reset mocked environment variables
    import.meta.env = {}
  })

  describe('getFeatureFlags', () => {
    it('should return default flags when no environment variables are set', async () => {
      const { getFeatureFlags } = await import('@/config/featureFlags')
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

    it('should override defaults with environment variables', async () => {
      import.meta.env.VITE_FEATURE_LAB = 'false'
      import.meta.env.VITE_FEATURE_MANUFACTURING = 'false'
      import.meta.env.VITE_FEATURE_USER_MANAGEMENT = 'false'

      // Re-import to get fresh module with new env vars
      vi.resetModules()
      const { getFeatureFlags } = await import('@/config/featureFlags')
      const flags = getFeatureFlags()

      expect(flags.lab).toBe(false)
      expect(flags.manufacturing).toBe(false)
      expect(flags.userManagement).toBe(false)
      // Other flags should remain default
      expect(flags.dashboard).toBe(true)
      expect(flags.patients).toBe(true)
    })

    it('should handle case-insensitive boolean parsing', async () => {
      import.meta.env.VITE_FEATURE_LAB = 'TRUE'
      import.meta.env.VITE_FEATURE_MANUFACTURING = 'False'
      import.meta.env.VITE_FEATURE_USER_MANAGEMENT = 'true'

      // Re-import to get fresh module with new env vars
      vi.resetModules()
      const { getFeatureFlags } = await import('@/config/featureFlags')
      const flags = getFeatureFlags()

      expect(flags.lab).toBe(true)
      expect(flags.manufacturing).toBe(false)
      expect(flags.userManagement).toBe(true)
    })
  })

  describe('isFeatureEnabled', () => {
    it('should return correct feature status', async () => {
      import.meta.env.VITE_FEATURE_LAB = 'false'
      import.meta.env.VITE_FEATURE_DASHBOARD = 'true'

      // Re-import to get fresh module with new env vars
      vi.resetModules()
      const { isFeatureEnabled } = await import('@/config/featureFlags')

      expect(isFeatureEnabled('lab')).toBe(false)
      expect(isFeatureEnabled('dashboard')).toBe(true)
    })
  })

  describe('Minimal Production Configuration', () => {
    it('should disable advanced features in minimal mode', async () => {
      // Simulate minimal production environment
      import.meta.env.VITE_FEATURE_DASHBOARD = 'true'
      import.meta.env.VITE_FEATURE_PATIENTS = 'true'
      import.meta.env.VITE_FEATURE_SETTINGS = 'true'
      import.meta.env.VITE_FEATURE_PROFILE = 'true'
      import.meta.env.VITE_FEATURE_LEAD_IN = 'false'
      import.meta.env.VITE_FEATURE_APPOINTMENTS = 'false'
      import.meta.env.VITE_FEATURE_CONSULTATION = 'false'
      import.meta.env.VITE_FEATURE_LAB = 'false'
      import.meta.env.VITE_FEATURE_REPORT_CARDS = 'false'
      import.meta.env.VITE_FEATURE_MANUFACTURING = 'false'
      import.meta.env.VITE_FEATURE_APPLIANCE_DELIVERY = 'false'
      import.meta.env.VITE_FEATURE_USER_MANAGEMENT = 'false'
      import.meta.env.VITE_FEATURE_PUBLIC_PATIENT_FORM = 'true'
      import.meta.env.VITE_FEATURE_PUBLIC_PATIENT_PACKET = 'true'

      // Re-import to get fresh module with new env vars
      vi.resetModules()
      const { getFeatureFlags } = await import('@/config/featureFlags')
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
