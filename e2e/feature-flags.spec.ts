import { test, expect } from '@playwright/test';

test.describe('Feature Flags Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should show all features in full production mode', async ({ page }) => {
    // Set environment variables for full production
    await page.addInitScript(() => {
      window.localStorage.setItem('test-feature-flags', JSON.stringify({
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
        profile: true
      }));
    });

    // Mock successful login
    await page.route('**/auth/v1/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: '1', email: 'test@example.com' }
        })
      });
    });

    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');

    // Check that all navigation items are visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Lead-in')).toBeVisible();
    await expect(page.locator('text=Appointments')).toBeVisible();
    await expect(page.locator('text=Consultation')).toBeVisible();
    await expect(page.locator('text=Patients')).toBeVisible();
    await expect(page.locator('text=Lab')).toBeVisible();
    await expect(page.locator('text=Report Cards')).toBeVisible();
    await expect(page.locator('text=Manufacturing')).toBeVisible();
    await expect(page.locator('text=Appliance Delivery')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should hide advanced features in minimal production mode', async ({ page }) => {
    // Set environment variables for minimal production
    await page.addInitScript(() => {
      window.localStorage.setItem('test-feature-flags', JSON.stringify({
        dashboard: true,
        patients: true,
        leadIn: false,
        appointments: false,
        consultation: false,
        lab: false,
        reportCards: false,
        manufacturing: false,
        applianceDelivery: false,
        userManagement: false,
        settings: true,
        profile: true
      }));
    });

    // Mock successful login
    await page.route('**/auth/v1/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: '1', email: 'test@example.com' }
        })
      });
    });

    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');

    // Check that core features are visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Patients')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();

    // Check that advanced features are hidden
    await expect(page.locator('text=Lead-in')).not.toBeVisible();
    await expect(page.locator('text=Lab')).not.toBeVisible();
    await expect(page.locator('text=Manufacturing')).not.toBeVisible();
    await expect(page.locator('text=Report Cards')).not.toBeVisible();
    await expect(page.locator('text=Appliance Delivery')).not.toBeVisible();
  });

  test('should prevent navigation to disabled features', async ({ page }) => {
    // Set minimal feature flags
    await page.addInitScript(() => {
      window.localStorage.setItem('test-feature-flags', JSON.stringify({
        dashboard: true,
        patients: true,
        lab: false,
        manufacturing: false
      }));
    });

    // Mock successful login
    await page.route('**/auth/v1/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: '1', email: 'test@example.com' }
        })
      });
    });

    // Login and navigate to dashboard
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Try to navigate directly to disabled feature
    await page.goto('/lab');
    
    // Should redirect to 404 or dashboard since route is disabled
    await expect(page.locator('text=Not Found')).toBeVisible();
  });
});
