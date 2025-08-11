import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../utils'
import Sidebar from '@/components/Sidebar'

// Mock the feature flags
const mockIsFeatureEnabled = vi.fn()
vi.mock('@/config/featureFlags', () => ({
  isFeatureEnabled: mockIsFeatureEnabled
}))

// Mock the auth context
const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}))

// Mock the permissions hook
const mockUsePermissions = vi.fn()
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: mockUsePermissions
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Sidebar', () => {
  const defaultProps = {
    activeSection: 'dashboard',
    collapsed: false,
    onToggleCollapse: vi.fn(),
    width: 280,
    onWidthChange: vi.fn(),
    onResizeStart: vi.fn(),
    onResizeEnd: vi.fn()
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Default auth state
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      loading: false
    })
    
    // Default permissions
    mockUsePermissions.mockReturnValue({
      canAccessUserManagement: () => true
    })
    
    // Default feature flags - all enabled
    mockIsFeatureEnabled.mockReturnValue(true)
  })

  it('should render all navigation items when all features are enabled', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Lead-in')).toBeInTheDocument()
    expect(screen.getByText('Appointments')).toBeInTheDocument()
    expect(screen.getByText('Consultation')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
    expect(screen.getByText('Lab')).toBeInTheDocument()
    expect(screen.getByText('Report Cards')).toBeInTheDocument()
    expect(screen.getByText('Manufacturing')).toBeInTheDocument()
    expect(screen.getByText('Appliance Delivery')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should hide navigation items when features are disabled', () => {
    // Mock feature flags to disable some features
    mockIsFeatureEnabled.mockImplementation((feature: string) => {
      const enabledFeatures = ['dashboard', 'patients', 'settings', 'profile']
      return enabledFeatures.includes(feature)
    })
    
    render(<Sidebar {...defaultProps} />)
    
    // Should show enabled features
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    
    // Should not show disabled features
    expect(screen.queryByText('Lead-in')).not.toBeInTheDocument()
    expect(screen.queryByText('Lab')).not.toBeInTheDocument()
    expect(screen.queryByText('Manufacturing')).not.toBeInTheDocument()
  })

  it('should hide admin-only items for non-admin users', () => {
    // Mock permissions to deny user management access
    mockUsePermissions.mockReturnValue({
      canAccessUserManagement: () => false
    })
    
    render(<Sidebar {...defaultProps} />)
    
    // Should not show user management for non-admin
    expect(screen.queryByText('User Management')).not.toBeInTheDocument()
    
    // Should still show other items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
  })

  it('should highlight active section', () => {
    render(<Sidebar {...defaultProps} activeSection="patients" />)
    
    const patientsButton = screen.getByText('Patients').closest('button')
    expect(patientsButton).toHaveClass('bg-indigo-50', 'text-indigo-700')
  })

  it('should handle navigation clicks', () => {
    render(<Sidebar {...defaultProps} />)
    
    const dashboardButton = screen.getByText('Dashboard').closest('button')
    dashboardButton?.click()
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('should render in minimal production mode', () => {
    // Simulate minimal production feature flags
    mockIsFeatureEnabled.mockImplementation((feature: string) => {
      const minimalFeatures = ['dashboard', 'patients', 'settings', 'profile']
      return minimalFeatures.includes(feature)
    })
    
    render(<Sidebar {...defaultProps} />)
    
    // Should only show core features
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Patients')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    
    // Should not show advanced features
    expect(screen.queryByText('Lead-in')).not.toBeInTheDocument()
    expect(screen.queryByText('Lab')).not.toBeInTheDocument()
    expect(screen.queryByText('Manufacturing')).not.toBeInTheDocument()
    expect(screen.queryByText('Report Cards')).not.toBeInTheDocument()
    expect(screen.queryByText('Appliance Delivery')).not.toBeInTheDocument()
  })
})
