# Page Visibility Management

This document explains how to control which pages are visible in the sidebar navigation.

## Overview

The page visibility system allows you to easily show or hide pages in the sidebar navigation without modifying code. This is useful for:

- **Staged Rollouts**: Show only completed features
- **User-Specific Views**: Different page sets for different user types
- **Development**: Hide work-in-progress features
- **Customization**: Tailor the interface to specific clinic needs

## Current Configuration

Currently, only these pages are visible:
- ✅ **Dashboard** - Main overview page
- ✅ **Patients** - Patient management
- ✅ **User Management** - Admin user controls

All other pages are hidden:
- ❌ Lead-in
- ❌ Appointments  
- ❌ Consultation
- ❌ Lab
- ❌ Report Cards
- ❌ Manufacturing
- ❌ Appliance Delivery
- ❌ Settings

## How to Change Page Visibility

### Method 1: Using the UI (Recommended)

1. **Navigate to Settings**:
   - Go to Settings page (if visible)
   - Click on "Page Visibility" in the left sidebar

2. **Use the Page Visibility Manager**:
   - Toggle individual pages on/off
   - Use quick presets for common configurations
   - Save changes and refresh the page

### Method 2: Edit Configuration File

Edit `src/config/pageVisibility.ts`:

```typescript
export const PAGE_VISIBILITY: PageVisibilityConfig = {
  dashboard: true,           // ✅ Show Dashboard
  patients: true,            // ✅ Show Patients
  userManagement: true,      // ✅ Show User Management
  
  leadIn: false,             // ❌ Hide Lead-in
  appointments: false,       // ❌ Hide Appointments
  consultation: false,       // ❌ Hide Consultation
  lab: false,                // ❌ Hide Lab
  reportCards: false,        // ❌ Hide Report Cards
  manufacturing: false,      // ❌ Hide Manufacturing
  applianceDelivery: false,  // ❌ Hide Appliance Delivery
  settings: false,           // ❌ Hide Settings
};
```

## Quick Presets

The system includes several preset configurations:

### Minimal (Current)
- Dashboard, Patients, User Management only

### Patient Focused
- Dashboard, Patients, Lead-in, Appointments, Consultation, User Management

### Full Lab
- All pages visible (complete system)

### Development
- All pages visible for testing

## Usage Examples

### Enable Appointments and Consultation
```typescript
// In pageVisibility.ts
appointments: true,
consultation: true,
```

### Apply Patient-Focused Preset
```typescript
// In code
import { applyPreset } from '@/config/pageVisibility';
applyPreset('patientFocused');
```

### Check if Page is Visible
```typescript
import { isPageVisible } from '@/config/pageVisibility';

if (isPageVisible('appointments')) {
  // Show appointments-related content
}
```

## Important Notes

1. **Page Refresh Required**: Changes require a page refresh to take effect
2. **URL Access**: Hidden pages are still accessible via direct URL if users know the route
3. **Admin Only**: User Management page respects admin permissions regardless of visibility setting
4. **Feature Flags**: Pages also respect existing feature flag settings

## File Structure

```
src/
├── config/
│   └── pageVisibility.ts          # Main configuration file
├── components/
│   ├── Sidebar.tsx                # Updated to use page visibility
│   └── PageVisibilityManager.tsx  # UI for managing visibility
└── pages/
    └── SettingsPage.tsx           # Includes visibility manager
```

## Troubleshooting

### Page Still Visible After Hiding
- Check if page has `adminOnly: true` and you're an admin
- Verify feature flags are enabled
- Refresh the page after making changes

### Settings Page Hidden
If you hide the Settings page, you can:
1. Edit `pageVisibility.ts` directly
2. Temporarily set `settings: true`
3. Use the UI to make changes
4. Hide settings again if needed

### Reset to Defaults
```typescript
// Apply minimal preset
applyPreset('minimal');
```

## Future Enhancements

Planned improvements:
- Real-time updates without page refresh
- User-specific visibility settings
- Role-based page visibility
- Import/export configurations
