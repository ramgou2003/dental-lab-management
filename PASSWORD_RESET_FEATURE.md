# Password Reset Feature Documentation

## Overview
This document describes the password reset functionality implemented in the dental lab management system. There are two types of password reset features:

1. **User Self-Service Password Change** - Users can change their own password from their profile page
2. **Admin Password Reset** - Admins and Super Admins can reset passwords for other users

---

## 1. User Self-Service Password Change

### Location
- **Profile Page** → Click "Change Password" button

### Features
- Users can change their own password
- Requires current password verification for security
- New password must be at least 6 characters
- Password confirmation to prevent typos
- Show/hide password toggles for all fields

### How It Works
1. User navigates to their Profile page
2. Clicks the "Change Password" button
3. Dialog opens with three fields:
   - Current Password (for verification)
   - New Password
   - Confirm New Password
4. System validates:
   - All fields are filled
   - Current password is correct
   - New password is at least 6 characters
   - New passwords match
   - New password is different from current password
5. Password is updated using Supabase Auth API
6. User receives success notification

### Files
- `src/components/profile/ChangePasswordDialog.tsx` - Dialog component
- `src/pages/ProfilePage.tsx` - Integration in profile page

---

## 2. Admin Password Reset

### Location
- **User Management Page** → Users Tab → Click "..." menu → "Reset Password"

### Permissions Required
- `users.update` permission
- Available to Super Admins and Admins

### Features
- Admins can reset passwords for any user (except Super Admins can only be reset by other Super Admins)
- Only requires new password (no current password needed)
- New password must be at least 6 characters
- Password confirmation to prevent typos
- Show/hide password toggles
- Warning message about secure password communication

### How It Works
1. Admin navigates to User Management page
2. Finds the user whose password needs to be reset
3. Clicks the "..." (More) menu button
4. Selects "Reset Password"
5. Dialog opens showing:
   - User's name and email
   - Warning about secure password communication
   - New Password field
   - Confirm New Password field
6. System validates:
   - All fields are filled
   - New password is at least 6 characters
   - Passwords match
   - Admin has proper permissions
7. Password is reset using secure database function
8. Admin receives success notification

### Security Features
- Uses server-side database function (`admin_reset_user_password`)
- Validates admin permissions before allowing reset
- Password is automatically hashed using bcrypt
- Audit trail can be added (commented in SQL function)
- Super Admin accounts are protected

### Files
- `src/components/user-management/ResetPasswordDialog.tsx` - Dialog component
- `src/pages/UserManagementPage.tsx` - Integration in user management
- `admin-reset-password-function.sql` - Database function

---

## Database Function

### Function Name
`admin_reset_user_password(target_user_id UUID, new_password TEXT)`

### Purpose
Securely reset user passwords from the admin interface

### Parameters
- `target_user_id` - UUID of the user whose password is being reset
- `new_password` - The new password (plain text, will be hashed)

### Security
- Checks if caller is authenticated
- Validates caller has `users.update` permission
- Validates password is at least 6 characters
- Uses bcrypt hashing with salt
- Returns JSON with success/error details

### Installation
The function has been created in your Supabase database. If you need to recreate it, run the SQL in `admin-reset-password-function.sql` in your Supabase SQL Editor.

---

## User Interface

### Change Password Dialog (User)
```
┌─────────────────────────────────────┐
│ 🔒 Change Password                  │
├─────────────────────────────────────┤
│ Enter your current password and     │
│ choose a new password.              │
│                                     │
│ Current Password *                  │
│ [••••••••••••••]           👁       │
│                                     │
│ New Password *                      │
│ [••••••••••••••]           👁       │
│ Minimum 6 characters                │
│                                     │
│ Confirm New Password *              │
│ [••••••••••••••]           👁       │
│                                     │
│         [Cancel] [Update Password]  │
└─────────────────────────────────────┘
```

### Reset Password Dialog (Admin)
```
┌─────────────────────────────────────┐
│ 🔑 Reset Password                   │
├─────────────────────────────────────┤
│ Reset password for John Doe         │
│ (john@example.com)                  │
│                                     │
│ ⚠️ This will immediately change     │
│    the user's password. Communicate │
│    securely to the user.            │
│                                     │
│ New Password *                      │
│ [••••••••••••••]           👁       │
│ Minimum 6 characters                │
│                                     │
│ Confirm New Password *              │
│ [••••••••••••••]           👁       │
│                                     │
│         [Cancel] [Reset Password]   │
└─────────────────────────────────────┘
```

---

## Testing

### Test User Password Change
1. Log in as any user
2. Go to Profile page
3. Click "Change Password"
4. Try with wrong current password (should fail)
5. Try with password < 6 characters (should fail)
6. Try with mismatched passwords (should fail)
7. Enter correct current password and valid new password
8. Verify success message
9. Log out and log back in with new password

### Test Admin Password Reset
1. Log in as Admin or Super Admin
2. Go to User Management page
3. Find a test user
4. Click "..." menu → "Reset Password"
5. Try with password < 6 characters (should fail)
6. Try with mismatched passwords (should fail)
7. Enter valid password and confirm
8. Verify success message
9. Log in as that user with the new password

---

## Troubleshooting

### "Password reset function not configured"
- The database function `admin_reset_user_password` is missing
- Run the SQL in `admin-reset-password-function.sql`

### "Insufficient permissions to reset user passwords"
- User doesn't have `users.update` permission
- Check user's role and permissions in User Management

### "Current password is incorrect"
- User entered wrong current password
- Verify the current password is correct

### Password reset succeeds but user can't log in
- Clear browser cache and cookies
- Check Supabase Auth logs for any issues
- Verify the password was actually updated in auth.users table

---

## Future Enhancements

- [ ] Password strength meter
- [ ] Password history (prevent reusing recent passwords)
- [ ] Configurable password policies (length, complexity)
- [ ] Email notification when password is changed
- [ ] Temporary passwords that expire
- [ ] Password reset via email link
- [ ] Two-factor authentication
- [ ] Audit log for password changes

---

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase Auth logs
3. Check browser console for errors
4. Contact system administrator

